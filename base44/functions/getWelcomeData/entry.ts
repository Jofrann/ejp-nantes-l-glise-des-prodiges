import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { checkWelcomeAccess } from '../../shared/welcomePermissions.ts';
import { filterActiveMembers, loadUserMap, enrichMembers, enrichAssignments, groupBy, loadAssignmentsForPlans } from '../../shared/departmentDataUtils.ts';

/**
 * getWelcomeData — Fonction backend gardien pour les données Accueil.
 *
 * Vérifie l'appartenance au département Accueil, puis renvoie
 * les données autorisées (planning, affectations, visiteurs, profils).
 *
 * CONFIDENTIALITÉ VISITEURS :
 * - VisitorContact n'est retourné en détail que pour les responsables Accueil.
 * - Les membres ordinaires ne voient que les infos opérationnelles de service.
 * - Les visiteurs sans consentement (consent_to_contact=false) ne sont pas
 *   inclus dans le suivi détaillé.
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

    const access = await checkWelcomeAccess(base44, department_slug);
    if (access.not_found) return Response.json({ not_found: true });
    if (access.access_denied) {
      await base44.asServiceRole.entities.AuditLog.create({
        action: 'access_denied',
        entity_type: 'WelcomeDepartment',
        entity_id: access.department?.id || '',
        details: `Tentative d'accès refusée aux données Accueil (${department_slug})`,
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

    const [plans, profiles, members] = await Promise.all([
      base44.asServiceRole.entities.WelcomeServicePlan.filter({ department_id: deptId }, '-date', 100),
      base44.asServiceRole.entities.WelcomeMemberProfile.filter({ department_id: deptId, active: true }, 'full_name', 200),
      base44.asServiceRole.entities.DepartmentMember.filter({ department_id: deptId }, 'full_name', 200),
    ]);

    const activeMembers = filterActiveMembers(members);

    const planIds = (plans || []).map((p: any) => p.id);
    const assignments = await loadAssignmentsForPlans(base44, 'WelcomeAssignment', planIds);

    // Visiteurs : les responsables voient tout, les membres ordinaires ne voient
    // que les visiteurs avec consentement et sans données sensibles
    let visitors: any[] = [];
    if (isResponsable) {
      const allVisitors = await base44.asServiceRole.entities.VisitorContact.filter(
        { department_id: deptId, status: { $ne: 'closed' } },
        '-created_date',
        200
      );
      // Les responsables voient tout, y compris sans consentement (pour gestion)
      visitors = allVisitors || [];
    } else {
      // Les membres ordinaires ne voient que les visiteurs avec consentement
      // et seulement les infos opérationnelles (pas phone, pas notes détaillées)
      const allVisitors = await base44.asServiceRole.entities.VisitorContact.filter(
        { department_id: deptId, consent_to_contact: true, status: { $ne: 'closed' } },
        '-created_date',
        100
      );
      visitors = (allVisitors || []).map((v: any) => ({
        id: v.id,
        first_name: v.first_name,
        last_name: v.last_name || '',
        first_visit_date: v.first_visit_date || '',
        status: v.status,
        assigned_to_name: v.assigned_to_name || '',
        consent_to_contact: v.consent_to_contact,
        // Ne pas exposer phone, contact_channel, notes aux membres ordinaires
      }));
    }

    // Enrichir les membres
    const memberUserIds = activeMembers.map((m: any) => m.user_id).filter(Boolean);
    const userMap = await loadUserMap(base44, memberUserIds);

    const profileMap: Record<string, any> = {};
    (profiles || []).forEach((p: any) => {
      if (p.user_id) profileMap[p.user_id] = p;
    });

    const enrichedMembers = enrichMembers(activeMembers, userMap, profileMap, 'welcome_profile');

    // Enrichir les assignments
    const assignmentUserIds = (assignments || []).map((a: any) => a.user_id).filter(Boolean);
    const assignmentUserMap = await loadUserMap(base44, assignmentUserIds);
    const enrichedAssignments = enrichAssignments(assignments, assignmentUserMap);

    const assignmentsByPlan = groupBy(enrichedAssignments, 'service_plan_id');

    return Response.json({
      access_granted: true,
      department,
      role_in_dept: access.roleInDept,
      is_responsable: isResponsable,
      is_admin: isAdmin,
      members: enrichedMembers,
      plans: plans || [],
      assignments: enrichedAssignments,
      assignments_by_plan: assignmentsByPlan,
      profiles: profiles || [],
      visitors,
      current_user_id: user.id,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}