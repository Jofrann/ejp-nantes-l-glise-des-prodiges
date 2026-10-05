import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { checkModerationAccess } from '../../shared/moderationPermissions.ts';
import { filterActiveMembers, loadUserMap, enrichMembers, groupBy } from '../../shared/departmentDataUtils.ts';

/**
 * getModerationData — Fonction backend gardien pour les données Modération.
 *
 * Vérifie l'appartenance au département Modération, puis renvoie
 * les données autorisées (planning, conducteurs, annonces, profils).
 */
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { department_slug } = body;

    if (!department_slug) {
      return Response.json({ error: 'department_slug requis' }, { status: 400 });
    }

    const access = await checkModerationAccess(base44, department_slug);
    if (access.not_found) return Response.json({ not_found: true });
    if (access.access_denied) {
      await base44.asServiceRole.entities.AuditLog.create({
        action: 'access_denied',
        entity_type: 'ModerationDepartment',
        entity_id: access.department?.id || '',
        details: `Tentative d'accès refusée aux données Modération (${department_slug})`,
        performed_by_id: user.id,
        performed_by_name: user.full_name || user.email,
        performed_by_role: user.role || '',
      });
      return Response.json({ access_denied: true, message: 'Tu ne fais pas partie de ce département.' });
    }

    const department = access.department;
    const deptId = department.id;
    const isResponsable = access.isResponsable;
    const isAdmin = access.isAdmin;
    const userId = user.id;

    const [plans, profiles, members, announcements] = await Promise.all([
      base44.asServiceRole.entities.ModerationServicePlan.filter({ department_id: deptId }, '-date', 100),
      base44.asServiceRole.entities.ModerationMemberProfile.filter({ department_id: deptId, active: true }, 'full_name', 200),
      base44.asServiceRole.entities.DepartmentMember.filter({ department_id: deptId }, 'full_name', 200),
      base44.asServiceRole.entities.ModerationAnnouncement.filter({ department_id: deptId, status: { $ne: 'archived' } }, '-created_date', 100),
    ]);

    const activeMembers = filterActiveMembers(members);

    // Charger les run items pour les plans
    const planIds = (plans || []).map((p: any) => p.id);
    let runItems: any[] = [];
    if (planIds.length > 0) {
      runItems = await base44.asServiceRole.entities.ModerationRunItem.filter({
        service_plan_id: { $in: planIds },
      });
    }
    const runItemsByPlan = groupBy(runItems, 'service_plan_id');

    // Enrichir les membres
    const memberUserIds = activeMembers.map((m: any) => m.user_id).filter(Boolean);
    const userMap = await loadUserMap(base44, memberUserIds);

    const profileMap: Record<string, any> = {};
    (profiles || []).forEach((p: any) => {
      if (p.user_id) profileMap[p.user_id] = p;
    });

    const enrichedMembers = enrichMembers(activeMembers, userMap, profileMap, 'moderation_profile');

    return Response.json({
      access_granted: true,
      department,
      role_in_dept: access.roleInDept,
      is_responsable: isResponsable,
      is_admin: isAdmin,
      members: enrichedMembers,
      plans: plans || [],
      run_items: runItems || [],
      run_items_by_plan: runItemsByPlan,
      announcements: announcements || [],
      profiles: profiles || [],
      current_user_id: user.id,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}