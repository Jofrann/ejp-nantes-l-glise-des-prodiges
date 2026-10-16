import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { checkMusicAccess } from '../../shared/musicPermissions.ts';
import { filterActiveMembers, loadUserMap, enrichMembers, enrichAssignments, groupBy, loadAssignmentsForPlans } from '../../shared/departmentDataUtils.ts';

/**
 * getMusicData — Fonction backend gardien pour les données musicales.
 *
 * Vérifie l'appartenance au ministère Prodiges Musique, puis renvoie
 * toutes les données musicales autorisées (plans, affectations, répétitions,
 * chants, setlists, profils, disponibilités).
 *
 * La sécurité ne repose PAS sur l'interface — cette fonction est le gardien backend.
 *
 * Paramètres :
 * - department_slug : slug du ministère musique
 *
 * Retour :
 * - access_denied si l'utilisateur n'appartient pas au ministère
 * - toutes les données musicales si autorisé
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
    const access = await checkMusicAccess(base44, department_slug);
    if (access.not_found) {
      return Response.json({ not_found: true });
    }
    if (access.access_denied) {
      await base44.asServiceRole.entities.AuditLog.create({
        action: 'access_denied',
        entity_type: 'MusicDepartment',
        entity_id: access.department?.id || '',
        details: `Tentative d'accès refusée aux données musicales (${department_slug})`,
        performed_by_id: user.id,
        performed_by_name: user.full_name || user.email,
        performed_by_role: user.role || '',
      });
      return Response.json({
        access_denied: true,
        message: 'Tu ne fais pas partie de ce ministère.',
      });
    }

    const department = access.department;
    const deptId = department.id;
    const isResponsable = access.isResponsable;
    const isAdmin = access.isAdmin;

    // 2. Charger toutes les données musicales scopées au ministère
    const [plans, rehearsals, songs, setlistItems, profiles, availabilities, members] = await Promise.all([
      base44.asServiceRole.entities.MusicServicePlan.filter(
        { department_id: deptId },
        '-date',
        100
      ),
      base44.asServiceRole.entities.MusicRehearsal.filter(
        { department_id: deptId },
        '-date',
        50
      ),
      base44.asServiceRole.entities.MusicSong.filter(
        { department_id: deptId, active: true },
        'title',
        500
      ),
      base44.asServiceRole.entities.MusicSetlistItem.filter(
        { department_id: deptId },
        'item_order',
        500
      ),
      base44.asServiceRole.entities.MusicMemberProfile.filter(
        { department_id: deptId, active: true },
        'full_name',
        200
      ),
      base44.asServiceRole.entities.MusicAvailability.filter(
        { department_id: deptId },
        '-date',
        200
      ),
      base44.asServiceRole.entities.DepartmentMember.filter(
        { department_id: deptId },
        'full_name',
        200
      ),
    ]);

    // 3. Filtrer les membres actifs
    const activeMembers = filterActiveMembers(members);

    // 4. Récupérer les assignments pour les plans
    const planIds = (plans || []).map((p: any) => p.id);
    const assignments = await loadAssignmentsForPlans(base44, 'MusicAssignment', planIds);

    // 5. Enrichir les membres avec internal_identifier et profil musical
    const memberUserIds = activeMembers.map((m: any) => m.user_id).filter(Boolean);
    const userMap = await loadUserMap(base44, memberUserIds);

    const profileMap: Record<string, any> = {};
    (profiles || []).forEach((p: any) => {
      if (p.user_id) profileMap[p.user_id] = p;
    });

    const enrichedMembers = enrichMembers(activeMembers, userMap, profileMap, 'music_profile');

    // 6. Enrichir les assignments avec full_name si manquant
    const assignmentUserIds = (assignments || []).map((a: any) => a.user_id).filter(Boolean);
    const assignmentUserMap = await loadUserMap(base44, assignmentUserIds);
    const enrichedAssignments = enrichAssignments(assignments, assignmentUserMap);

    // 7. Grouper les setlists, assignments, répétitions et disponibilités
    const setlistByPlan = groupBy(setlistItems || [], 'service_plan_id');
    const assignmentsByPlan = groupBy(enrichedAssignments, 'service_plan_id');
    const rehearsalsByPlan = groupBy((rehearsals || []).filter((r: any) => r.service_plan_id), 'service_plan_id');
    const availabilityByDate = groupBy(availabilities || [], 'date');

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
      rehearsals: rehearsals || [],
      rehearsals_by_plan: rehearsalsByPlan,
      songs: songs || [],
      setlist_items: setlistItems || [],
      setlist_by_plan: setlistByPlan,
      profiles: profiles || [],
      availabilities: availabilities || [],
      availability_by_date: availabilityByDate,
      current_user_id: user.id,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}