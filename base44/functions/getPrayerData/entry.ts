import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { checkPrayerAccess, canReadRequest, canReadTopic } from '../../shared/prayerPermissions.ts';
import { filterActiveMembers, loadUserMap, enrichMembers, enrichAssignments, groupBy, loadAssignmentsForPlans } from '../../shared/departmentDataUtils.ts';

/**
 * getPrayerData — Fonction backend gardien pour les données MPI.
 *
 * Vérifie l'appartenance au département MPI, puis renvoie
 * les données autorisées (planning, affectations, sujets, demandes, disponibilités).
 *
 * CONFIDENTIALITÉ ABSOLU :
 * - PrayerRequest est filtrée par niveau de confidentialité AVANT retour.
 * - PrayerTopic est filtré par visibilité AVANT retour.
 * - PrayerRequestUpdate n'est retourné que pour les demandes visibles.
 * - PrayerRequestAssignee n'est retourné que pour les demandes visibles.
 *
 * Paramètres :
 * - department_slug : slug du département MPI
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

    // 1. Vérifier l'accès
    const access = await checkPrayerAccess(base44, department_slug);
    if (access.not_found) {
      return Response.json({ not_found: true });
    }
    if (access.access_denied) {
      await base44.asServiceRole.entities.AuditLog.create({
        action: 'access_denied',
        entity_type: 'PrayerDepartment',
        entity_id: access.department?.id || '',
        details: `Tentative d'accès refusée aux données MPI (${department_slug})`,
        performed_by_id: user.id,
        performed_by_name: user.full_name || user.email,
        performed_by_role: user.role || '',
      });
      return Response.json({
        access_denied: true,
        message: 'Tu ne fais pas partie de ce département.',
      });
    }

    const department = access.department;
    const deptId = department.id;
    const isResponsable = access.isResponsable;
    const isAdmin = access.isAdmin;
    const isLeader = access.isLeader;
    const userId = user.id;

    // 2. Charger toutes les données scopées au département
    const [schedules, profiles, availabilities, members, allTopics, allRequests] = await Promise.all([
      base44.asServiceRole.entities.PrayerSchedule.filter(
        { department_id: deptId },
        '-date',
        100
      ),
      base44.asServiceRole.entities.PrayerMemberProfile.filter(
        { department_id: deptId, active: true },
        'full_name',
        200
      ),
      base44.asServiceRole.entities.PrayerAvailability.filter(
        { department_id: deptId },
        '-date',
        200
      ),
      base44.asServiceRole.entities.DepartmentMember.filter(
        { department_id: deptId },
        'full_name',
        200
      ),
      base44.asServiceRole.entities.PrayerTopic.filter(
        { department_id: deptId, status: 'active' },
        '-created_date',
        200
      ),
      base44.asServiceRole.entities.PrayerRequest.filter(
        { department_id: deptId, status: { $ne: 'archived' } },
        '-created_date',
        200
      ),
    ]);

    // 3. Filtrer les membres actifs
    const activeMembers = filterActiveMembers(members);

    // 4. Récupérer les assignments pour les schedules
    const scheduleIds = (schedules || []).map((s: any) => s.id);
    const assignments = await loadAssignmentsForPlans(base44, 'PrayerAssignment', scheduleIds);

    // 5. Filtrer les sujets par visibilité
    const visibleTopics = (allTopics || []).filter((t: any) =>
      canReadTopic(t, isResponsable, isAdmin, isLeader)
    );

    // 6. Filtrer les demandes par confidentialité
    // D'abord charger les assignees pour les demandes PRIVATE_ASSIGNEES
    const privateRequestIds = (allRequests || [])
      .filter((r: any) => r.confidentiality === 'PRIVATE_ASSIGNEES')
      .map((r: any) => r.id);

    let assigneeMap: Record<string, string[]> = {};
    let allAssigneeRecords: any[] = [];
    if (privateRequestIds.length > 0) {
      const assigneeRecords = await base44.asServiceRole.entities.PrayerRequestAssignee.filter({
        prayer_request_id: { $in: privateRequestIds },
      });
      allAssigneeRecords = assigneeRecords || [];
      (assigneeRecords || []).forEach((a: any) => {
        if (!assigneeMap[a.prayer_request_id]) assigneeMap[a.prayer_request_id] = [];
        assigneeMap[a.prayer_request_id].push(a.user_id);
      });
    }

    const visibleRequests = (allRequests || []).filter((r: any) => {
      const assigneeIds = assigneeMap[r.id] || [];
      return canReadRequest(r, assigneeIds, user, isResponsable, isAdmin, isLeader);
    });

    // 7. Charger les updates pour les demandes visibles uniquement
    const visibleRequestIds = visibleRequests.map((r: any) => r.id);
    let allUpdates: any[] = [];
    if (visibleRequestIds.length > 0) {
      allUpdates = await base44.asServiceRole.entities.PrayerRequestUpdate.filter({
        request_id: { $in: visibleRequestIds },
      });
    }
    const updatesByRequest = groupBy(allUpdates, 'request_id');

    // 8. N'exposer les assignees que pour les demandes PRIVATE_ASSIGNEES visibles
    const visiblePrivateRequestIds = visibleRequests
      .filter((r: any) => r.confidentiality === 'PRIVATE_ASSIGNEES')
      .map((r: any) => r.id);
    const visibleAssignees = allAssigneeRecords.filter((a: any) =>
      visiblePrivateRequestIds.includes(a.prayer_request_id)
    );
    const assigneesByRequest = groupBy(visibleAssignees, 'prayer_request_id');

    // 9. Enrichir les membres avec internal_identifier et profil MPI
    const memberUserIds = activeMembers.map((m: any) => m.user_id).filter(Boolean);
    const userMap = await loadUserMap(base44, memberUserIds);

    const profileMap: Record<string, any> = {};
    (profiles || []).forEach((p: any) => {
      if (p.user_id) profileMap[p.user_id] = p;
    });

    const enrichedMembers = enrichMembers(activeMembers, userMap, profileMap, 'prayer_profile');

    // 10. Enrichir les assignments avec full_name si manquant
    const assignmentUserIds = (assignments || []).map((a: any) => a.user_id).filter(Boolean);
    const assignmentUserMap = await loadUserMap(base44, assignmentUserIds);
    const enrichedAssignments = enrichAssignments(assignments, assignmentUserMap);

    // 11. Grouper les données
    const assignmentsBySchedule = groupBy(enrichedAssignments, 'schedule_id');
    const availabilityByDate = groupBy(availabilities || [], 'date');

    // 12. Masquer request_text dans les listes pour les demandes non accessibles en détail
    // (le texte est déjà filtré par canReadRequest, mais on ne l'expose pas dans les listes)
    const safeRequests = visibleRequests.map((r: any) => ({
      ...r,
      // Ne pas exposer request_text dans la liste — le détail l'expose après autorisation
      request_text: undefined,
    }));

    return Response.json({
      access_granted: true,
      department,
      role_in_dept: access.roleInDept,
      is_responsable: isResponsable,
      is_admin: isAdmin,
      is_leader: isLeader,
      members: enrichedMembers,
      schedules: schedules || [],
      assignments: enrichedAssignments,
      assignments_by_schedule: assignmentsBySchedule,
      topics: visibleTopics,
      requests: safeRequests,
      requests_detail: visibleRequests, // Détail avec request_text (déjà filtré par confidentialité)
      updates_by_request: updatesByRequest,
      assignees_by_request: assigneesByRequest,
      profiles: profiles || [],
      availabilities: availabilities || [],
      availability_by_date: availabilityByDate,
      current_user_id: user.id,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}