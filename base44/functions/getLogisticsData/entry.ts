import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { checkLogisticsAccess } from '../../shared/logisticsPermissions.ts';
import { filterActiveMembers, loadUserMap, enrichMembers, groupBy } from '../../shared/departmentDataUtils.ts';

/**
 * getLogisticsData — Fonction backend gardien pour les données Intendance.
 *
 * Vérifie l'appartenance au département Intendance, puis renvoie
 * les données autorisées (planning, tâches, besoins, matériel, profils).
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

    const access = await checkLogisticsAccess(base44, department_slug);
    if (access.not_found) return Response.json({ not_found: true });
    if (access.access_denied) {
      await base44.asServiceRole.entities.AuditLog.create({
        action: 'access_denied',
        entity_type: 'LogisticsDepartment',
        entity_id: access.department?.id || '',
        details: `Tentative d'accès refusée aux données Intendance (${department_slug})`,
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

    const [plans, profiles, members, equipment, allTasks, allNeeds] = await Promise.all([
      base44.asServiceRole.entities.LogisticsPlan.filter({ department_id: deptId }, '-date', 100),
      base44.asServiceRole.entities.LogisticsMemberProfile.filter({ department_id: deptId, active: true }, 'full_name', 200),
      base44.asServiceRole.entities.DepartmentMember.filter({ department_id: deptId }, 'full_name', 200),
      base44.asServiceRole.entities.LogisticsEquipment.filter({ department_id: deptId, active: { $ne: false } }, 'name', 200),
      base44.asServiceRole.entities.LogisticsTask.filter({ department_id: deptId }, '-created_date', 200),
      base44.asServiceRole.entities.LogisticsNeed.filter({ department_id: deptId, status: { $ne: 'cancelled' } }, '-created_date', 200),
    ]);

    const activeMembers = filterActiveMembers(members);

    // Enrichir les membres
    const memberUserIds = activeMembers.map((m: any) => m.user_id).filter(Boolean);
    const userMap = await loadUserMap(base44, memberUserIds);

    const profileMap: Record<string, any> = {};
    (profiles || []).forEach((p: any) => {
      if (p.user_id) profileMap[p.user_id] = p;
    });

    const enrichedMembers = enrichMembers(activeMembers, userMap, profileMap, 'logistics_profile');

    // Grouper les tâches et besoins par plan
    const tasksByPlan = groupBy(allTasks, 'logistics_plan_id');
    const needsByPlan = groupBy(allNeeds, 'logistics_plan_id');

    return Response.json({
      access_granted: true,
      department,
      role_in_dept: access.roleInDept,
      is_responsable: isResponsable,
      is_admin: isAdmin,
      members: enrichedMembers,
      plans: plans || [],
      tasks: allTasks || [],
      tasks_by_plan: tasksByPlan,
      needs: allNeeds || [],
      needs_by_plan: needsByPlan,
      equipment: equipment || [],
      profiles: profiles || [],
      current_user_id: user.id,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}