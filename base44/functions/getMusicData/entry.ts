import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { checkMusicAccess } from '../../shared/musicPermissions.ts';

/**
 * getMusicData — Fonction backend gardien pour les données musicales.
 *
 * Vérifie l'appartenance au département Prodiges Musique, puis renvoie
 * toutes les données musicales autorisées (plans, affectations, répétitions,
 * chants, setlists, profils, disponibilités).
 *
 * La sécurité ne repose PAS sur l'interface — cette fonction est le gardien backend.
 *
 * Paramètres :
 * - department_slug : slug du département musique
 *
 * Retour :
 * - access_denied si l'utilisateur n'appartient pas au département
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
        message: 'Tu ne fais pas partie de ce département.',
      });
    }

    const department = access.department;
    const deptId = department.id;
    const isResponsable = access.isResponsable;
    const isAdmin = access.isAdmin;

    // 2. Charger toutes les données musicales scopées au département
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
    const activeMembers = (members || []).filter(
      (m: any) => m.status === 'active' || (!m.status && m.is_active === true)
    );

    // 4. Récupérer les assignments pour les plans
    const planIds = (plans || []).map((p: any) => p.id);
    let assignments: any[] = [];
    if (planIds.length > 0) {
      assignments = await base44.asServiceRole.entities.MusicAssignment.filter({
        service_plan_id: { $in: planIds },
      });
    }

    // 5. Enrichir les membres avec internal_identifier et profil musical
    const memberUserIds = activeMembers.map((m: any) => m.user_id).filter(Boolean);
    let userMap: Record<string, any> = {};
    if (memberUserIds.length > 0) {
      const users = await base44.asServiceRole.entities.User.filter({
        id: { $in: memberUserIds },
      });
      (users || []).forEach((u: any) => {
        userMap[u.id] = u;
      });
    }

    const profileMap: Record<string, any> = {};
    (profiles || []).forEach((p: any) => {
      if (p.user_id) profileMap[p.user_id] = p;
    });

    const enrichedMembers = activeMembers.map((m: any) => ({
      ...m,
      internal_identifier: m.user_id ? userMap[m.user_id]?.internal_identifier || '' : '',
      music_profile: m.user_id ? profileMap[m.user_id] || null : null,
    }));

    // 6. Enrichir les assignments avec full_name si manquant
    const assignmentUserIds = (assignments || [])
      .map((a: any) => a.user_id)
      .filter(Boolean);
    let assignmentUserMap: Record<string, any> = {};
    if (assignmentUserIds.length > 0) {
      const uniqueIds = [...new Set(assignmentUserIds)];
      const users = await base44.asServiceRole.entities.User.filter({
        id: { $in: uniqueIds },
      });
      (users || []).forEach((u: any) => {
        assignmentUserMap[u.id] = u;
      });
    }
    const enrichedAssignments = (assignments || []).map((a: any) => ({
      ...a,
      full_name: a.full_name || assignmentUserMap[a.user_id]?.full_name || '',
    }));

    // 7. Grouper les setlists par plan
    const setlistByPlan: Record<string, any[]> = {};
    (setlistItems || []).forEach((item: any) => {
      const pid = item.service_plan_id;
      if (!setlistByPlan[pid]) setlistByPlan[pid] = [];
      setlistByPlan[pid].push(item);
    });

    // 8. Grouper les assignments par plan
    const assignmentsByPlan: Record<string, any[]> = {};
    (enrichedAssignments || []).forEach((a: any) => {
      const pid = a.service_plan_id;
      if (!assignmentsByPlan[pid]) assignmentsByPlan[pid] = [];
      assignmentsByPlan[pid].push(a);
    });

    // 9. Grouper les répétitions par plan
    const rehearsalsByPlan: Record<string, any[]> = {};
    (rehearsals || []).forEach((r: any) => {
      if (r.service_plan_id) {
        if (!rehearsalsByPlan[r.service_plan_id]) rehearsalsByPlan[r.service_plan_id] = [];
        rehearsalsByPlan[r.service_plan_id].push(r);
      }
    });

    // 10. Grouper les disponibilités par date
    const availabilityByDate: Record<string, any[]> = {};
    (availabilities || []).forEach((a: any) => {
      if (!availabilityByDate[a.date]) availabilityByDate[a.date] = [];
      availabilityByDate[a.date].push(a);
    });

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