import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { checkSoundAccess } from '../../shared/soundPermissions.ts';
import { filterActiveMembers, loadUserMap, enrichMembers, enrichAssignments, groupBy, loadAssignmentsForPlans } from '../../shared/departmentDataUtils.ts';

/**
 * getSoundData — Fonction backend gardien pour les données Sonorisation.
 *
 * Vérifie l'appartenance au département Sonorisation, puis renvoie
 * toutes les données techniques autorisées (plans, affectations, matériel,
 * incidents, checklists, profils, disponibilités).
 *
 * La sécurité ne repose PAS sur l'interface — cette fonction est le gardien backend.
 *
 * Paramètres :
 * - department_slug : slug du département sonorisation
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
    const access = await checkSoundAccess(base44, department_slug);
    if (access.not_found) {
      return Response.json({ not_found: true });
    }
    if (access.access_denied) {
      await base44.asServiceRole.entities.AuditLog.create({
        action: 'access_denied',
        entity_type: 'SoundDepartment',
        entity_id: access.department?.id || '',
        details: `Tentative d'accès refusée aux données sonorisation (${department_slug})`,
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

    // 2. Charger toutes les données scopées au département
    const [plans, equipment, incidents, templates, profiles, availabilities, members] = await Promise.all([
      base44.asServiceRole.entities.SoundServicePlan.filter(
        { department_id: deptId },
        '-date',
        100
      ),
      base44.asServiceRole.entities.SoundEquipment.filter(
        { department_id: deptId, active: true },
        'name',
        500
      ),
      base44.asServiceRole.entities.SoundIncident.filter(
        { department_id: deptId, status: { $in: ['open', 'in_progress'] } },
        '-created_date',
        100
      ),
      base44.asServiceRole.entities.SoundChecklistTemplate.filter(
        { department_id: deptId, active: true },
        'name',
        100
      ),
      base44.asServiceRole.entities.SoundMemberProfile.filter(
        { department_id: deptId, active: true },
        'full_name',
        200
      ),
      base44.asServiceRole.entities.SoundAvailability.filter(
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
    const assignments = await loadAssignmentsForPlans(base44, 'SoundAssignment', planIds);

    // 5. Récupérer les checklist runs pour les plans
    let checklistRuns: any[] = [];
    if (planIds.length > 0) {
      checklistRuns = await base44.asServiceRole.entities.SoundChecklistRun.filter({
        service_plan_id: { $in: planIds },
      });
    }

    // 6. Récupérer les item states pour les runs
    const runIds = (checklistRuns || []).map((r: any) => r.id);
    let checklistItemStates: any[] = [];
    if (runIds.length > 0) {
      checklistItemStates = await base44.asServiceRole.entities.SoundChecklistItemState.filter({
        run_id: { $in: runIds },
      });
    }

    // 7. Enrichir les membres avec internal_identifier et profil technique
    const memberUserIds = activeMembers.map((m: any) => m.user_id).filter(Boolean);
    const userMap = await loadUserMap(base44, memberUserIds);

    const profileMap: Record<string, any> = {};
    (profiles || []).forEach((p: any) => {
      if (p.user_id) profileMap[p.user_id] = p;
    });

    const enrichedMembers = enrichMembers(activeMembers, userMap, profileMap, 'sound_profile');

    // 8. Enrichir les assignments avec full_name si manquant
    const assignmentUserIds = (assignments || []).map((a: any) => a.user_id).filter(Boolean);
    const assignmentUserMap = await loadUserMap(base44, assignmentUserIds);
    const enrichedAssignments = enrichAssignments(assignments, assignmentUserMap);

    // 9. Grouper les données
    const assignmentsByPlan = groupBy(enrichedAssignments, 'service_plan_id');
    const checklistRunsByPlan = groupBy((checklistRuns || []).filter((r: any) => r.service_plan_id), 'service_plan_id');
    const itemStatesByRun = groupBy(checklistItemStates || [], 'run_id');
    const availabilityByDate = groupBy(availabilities || [], 'date');

    // 10. Carte équipement pour les incidents
    const equipmentMap: Record<string, any> = {};
    (equipment || []).forEach((e: any) => {
      equipmentMap[e.id] = e;
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
      equipment: equipment || [],
      equipment_map: equipmentMap,
      incidents: incidents || [],
      checklist_templates: templates || [],
      checklist_runs: checklistRuns || [],
      checklist_runs_by_plan: checklistRunsByPlan,
      checklist_item_states: checklistItemStates || [],
      item_states_by_run: itemStatesByRun,
      profiles: profiles || [],
      availabilities: availabilities || [],
      availability_by_date: availabilityByDate,
      current_user_id: user.id,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}