import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { checkCoordinationAccess } from '../../shared/coordinationPermissions.ts';
import { filterActiveMembers, loadUserMap, enrichMembers, groupBy } from '../../shared/departmentDataUtils.ts';

/**
 * getCoordinationData — Fonction backend gardien pour les données Coordination.
 *
 * Vérifie l'appartenance au département Coordination, puis renvoie
 * les données autorisées (planning, suivis, points d'attention, réunions, rapports, profils).
 *
 * CLOISONNEMENT :
 * - NE charge JAMAIS les données des autres départements.
 * - NE charge pas MusicAssignment, SoundEquipment, PrayerSchedule, VisitorContact,
 *   ModerationRunItem, LogisticsTask, FIJ, etc.
 * - Un Event référencé ne donne aucun accès aux modules des autres départements.
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

    const access = await checkCoordinationAccess(base44, department_slug);
    if (access.not_found) return Response.json({ not_found: true });
    if (access.access_denied) {
      await base44.asServiceRole.entities.AuditLog.create({
        action: 'access_denied',
        entity_type: 'CoordinationDepartment',
        entity_id: access.department?.id || '',
        details: `Tentative d'accès refusée aux données Coordination (${department_slug})`,
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

    const [plans, followups, attentionPoints, meetings, reports, profiles, members] = await Promise.all([
      base44.asServiceRole.entities.CoordinationPlan.filter({ department_id: deptId }, '-date', 100),
      base44.asServiceRole.entities.CoordinationFollowUp.filter({ department_id: deptId }, '-created_date', 200),
      base44.asServiceRole.entities.CoordinationAttentionPoint.filter({ department_id: deptId }, '-created_date', 200),
      base44.asServiceRole.entities.CoordinationMeeting.filter({ department_id: deptId }, '-date', 100),
      base44.asServiceRole.entities.CoordinationReport.filter({ department_id: deptId }, '-created_date', 50),
      base44.asServiceRole.entities.CoordinationMemberProfile.filter({ department_id: deptId, active: true }, 'full_name', 200),
      base44.asServiceRole.entities.DepartmentMember.filter({ department_id: deptId }, 'full_name', 200),
    ]);

    const activeMembers = filterActiveMembers(members);

    // Filtrage des suivis : les membres ordinaires ne voient que leurs propres suivis
    // Les responsables voient tous les suivis du département
    let visibleFollowups: any[] = followups || [];
    if (!isResponsable) {
      visibleFollowups = (followups || []).filter((f: any) => f.assigned_to === userId || f.created_by === userId);
    }

    // Enrichir les membres
    const memberUserIds = activeMembers.map((m: any) => m.user_id).filter(Boolean);
    const userMap = await loadUserMap(base44, memberUserIds);

    const profileMap: Record<string, any> = {};
    (profiles || []).forEach((p: any) => {
      if (p.user_id) profileMap[p.user_id] = p;
    });

    const enrichedMembers = enrichMembers(activeMembers, userMap, profileMap, 'coordination_profile');

    return Response.json({
      access_granted: true,
      department,
      role_in_dept: access.roleInDept,
      is_responsable: isResponsable,
      is_admin: isAdmin,
      members: enrichedMembers,
      plans: plans || [],
      followups: visibleFollowups,
      all_followups_count: (followups || []).length,
      attention_points: attentionPoints || [],
      meetings: meetings || [],
      reports: reports || [],
      profiles: profiles || [],
      current_user_id: user.id,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}