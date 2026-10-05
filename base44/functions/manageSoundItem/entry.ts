import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { checkSoundAccess } from '../../shared/soundPermissions.ts';

/**
 * manageSoundItem — Fonction backend pour les écritures Sonorisation.
 *
 * Toutes les écritures passent par cette fonction qui vérifie :
 * 1. L'appartenance au département Sonorisation
 * 2. Le statut responsable pour les opérations de gestion
 * 3. La propriété pour les opérations personnelles (confirmer affectation, disponibilité)
 *
 * Opérations responsable uniquement :
 *   save_plan, delete_plan, save_assignment, delete_assignment,
 *   save_equipment, update_equipment_status, retire_equipment,
 *   save_incident, update_incident, close_incident,
 *   save_template, delete_template, start_checklist, update_checklist_item,
 *   complete_checklist, save_profile
 *
 * Opérations utilisateur (soi-même ou responsable) :
 *   confirm_assignment, decline_assignment, save_availability, report_incident
 */
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { department_slug, operation, item, item_id } = body;

    if (!department_slug || !operation) {
      return Response.json({ error: 'department_slug et operation requis' }, { status: 400 });
    }

    // 1. Vérifier l'accès
    const access = await checkSoundAccess(base44, department_slug);
    if (access.not_found) return Response.json({ not_found: true });
    if (access.access_denied) {
      return Response.json({ access_denied: true }, { status: 403 });
    }

    const deptId = access.department.id;
    const isResponsable = access.isResponsable;
    const isAdmin = access.isAdmin;
    const userId = user.id;

    // Opérations nécessitant le statut responsable
    const RESPONSABLE_OPS = [
      'save_plan', 'delete_plan',
      'save_assignment', 'delete_assignment',
      'save_equipment', 'update_equipment_status', 'retire_equipment',
      'save_incident', 'update_incident', 'close_incident',
      'save_template', 'delete_template',
      'start_checklist', 'update_checklist_item', 'complete_checklist',
      'save_profile',
    ];

    if (RESPONSABLE_OPS.includes(operation) && !isResponsable) {
      return Response.json({
        error: 'Seul un responsable de Sonorisation peut effectuer cette action.',
      }, { status: 403 });
    }

    // 2. Router selon l'opération
    switch (operation) {
      // === PLANS ===
      case 'save_plan': {
        const data = {
          department_id: deptId,
          event_id: item.event_id || null,
          title: item.title,
          date: item.date,
          call_time: item.call_time || '',
          service_start_time: item.service_start_time || '',
          status: item.status || 'draft',
          technical_notes: item.technical_notes || '',
        };
        if (item_id) {
          await base44.asServiceRole.entities.SoundServicePlan.update(item_id, data);
          await logAudit(base44, user, 'update', 'SoundServicePlan', item_id, `Plan modifié: ${data.title}`);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.SoundServicePlan.create(data);
          await logAudit(base44, user, 'create', 'SoundServicePlan', created.id, `Plan créé: ${data.title}`);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'delete_plan': {
        // Supprimer aussi les assignments, checklist runs et item states associés
        await base44.asServiceRole.entities.SoundAssignment.deleteMany({
          service_plan_id: item_id,
        });
        const runs = await base44.asServiceRole.entities.SoundChecklistRun.filter({
          service_plan_id: item_id,
        });
        if (runs && runs.length > 0) {
          const runIds = runs.map((r: any) => r.id);
          await base44.asServiceRole.entities.SoundChecklistItemState.deleteMany({
            run_id: { $in: runIds },
          });
          await base44.asServiceRole.entities.SoundChecklistRun.deleteMany({
            service_plan_id: item_id,
          });
        }
        await base44.asServiceRole.entities.SoundServicePlan.delete(item_id);
        await logAudit(base44, user, 'delete', 'SoundServicePlan', item_id, 'Plan supprimé');
        return Response.json({ success: true });
      }

      // === ASSIGNMENTS ===
      case 'save_assignment': {
        const data = {
          service_plan_id: item.service_plan_id,
          department_id: deptId,
          user_id: item.user_id,
          full_name: item.full_name || '',
          position: item.position,
          status: item.status || 'assigned',
          notes: item.notes || '',
        };
        if (item_id) {
          await base44.asServiceRole.entities.SoundAssignment.update(item_id, data);
          await logAudit(base44, user, 'update', 'SoundAssignment', item_id, `Affectation modifiée: ${data.full_name} → ${data.position}`);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.SoundAssignment.create(data);
          await logAudit(base44, user, 'create', 'SoundAssignment', created.id, `Affectation: ${data.full_name} → ${data.position}`);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'delete_assignment': {
        await base44.asServiceRole.entities.SoundAssignment.delete(item_id);
        await logAudit(base44, user, 'delete', 'SoundAssignment', item_id, 'Affectation supprimée');
        return Response.json({ success: true });
      }
      case 'confirm_assignment': {
        const assignment = await base44.asServiceRole.entities.SoundAssignment.get(item_id);
        if (!assignment) return Response.json({ error: 'Affectation introuvable' }, { status: 404 });
        if (!isResponsable && assignment.user_id !== userId) {
          return Response.json({ error: 'Tu ne peux confirmer que ta propre affectation.' }, { status: 403 });
        }
        await base44.asServiceRole.entities.SoundAssignment.update(item_id, { status: 'confirmed' });
        await logAudit(base44, user, 'update', 'SoundAssignment', item_id, 'Affectation confirmée');
        return Response.json({ success: true });
      }
      case 'decline_assignment': {
        const assignment = await base44.asServiceRole.entities.SoundAssignment.get(item_id);
        if (!assignment) return Response.json({ error: 'Affectation introuvable' }, { status: 404 });
        if (!isResponsable && assignment.user_id !== userId) {
          return Response.json({ error: 'Tu ne peux décliner que ta propre affectation.' }, { status: 403 });
        }
        await base44.asServiceRole.entities.SoundAssignment.update(item_id, { status: 'declined' });
        await logAudit(base44, user, 'update', 'SoundAssignment', item_id, 'Affectation déclinée');
        return Response.json({ success: true });
      }

      // === EQUIPMENT ===
      case 'save_equipment': {
        const data = {
          department_id: deptId,
          name: item.name,
          category: item.category || 'other',
          identifier: item.identifier || '',
          location: item.location || '',
          status: item.status || 'available',
          notes: item.notes || '',
          active: item.active !== false,
        };
        if (item_id) {
          await base44.asServiceRole.entities.SoundEquipment.update(item_id, data);
          await logAudit(base44, user, 'update', 'SoundEquipment', item_id, `Matériel modifié: ${data.name}`);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.SoundEquipment.create(data);
          await logAudit(base44, user, 'create', 'SoundEquipment', created.id, `Matériel créé: ${data.name}`);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'update_equipment_status': {
        await base44.asServiceRole.entities.SoundEquipment.update(item_id, { status: item.status });
        await logAudit(base44, user, 'update', 'SoundEquipment', item_id, `Statut matériel → ${item.status}`);
        return Response.json({ success: true });
      }
      case 'retire_equipment': {
        await base44.asServiceRole.entities.SoundEquipment.update(item_id, { active: false, status: 'retired' });
        await logAudit(base44, user, 'update', 'SoundEquipment', item_id, 'Matériel retiré');
        return Response.json({ success: true });
      }

      // === INCIDENTS ===
      case 'report_incident': {
        // Un membre peut signaler ; un responsable aussi
        const data = {
          department_id: deptId,
          equipment_id: item.equipment_id || null,
          service_plan_id: item.service_plan_id || null,
          title: item.title,
          description: item.description || '',
          severity: item.severity || 'low',
          status: 'open',
          reported_by_name: user.full_name || user.email,
        };
        const created = await base44.asServiceRole.entities.SoundIncident.create(data);
        await logAudit(base44, user, 'create', 'SoundIncident', created.id, `Incident signalé: ${data.title}`);
        return Response.json({ success: true, id: created.id });
      }
      case 'save_incident': {
        const data = {
          department_id: deptId,
          equipment_id: item.equipment_id || null,
          service_plan_id: item.service_plan_id || null,
          title: item.title,
          description: item.description || '',
          severity: item.severity || 'low',
          status: item.status || 'open',
          assigned_to_name: item.assigned_to_name || '',
        };
        if (item_id) {
          await base44.asServiceRole.entities.SoundIncident.update(item_id, data);
          await logAudit(base44, user, 'update', 'SoundIncident', item_id, `Incident modifié: ${data.title}`);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.SoundIncident.create(data);
          await logAudit(base44, user, 'create', 'SoundIncident', created.id, `Incident créé: ${data.title}`);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'update_incident': {
        const updates: any = {};
        if (item.status) updates.status = item.status;
        if (item.severity) updates.severity = item.severity;
        if (item.assigned_to_name !== undefined) updates.assigned_to_name = item.assigned_to_name;
        if (item.resolution_notes !== undefined) updates.resolution_notes = item.resolution_notes;
        await base44.asServiceRole.entities.SoundIncident.update(item_id, updates);
        await logAudit(base44, user, 'update', 'SoundIncident', item_id, `Incident mis à jour`);
        return Response.json({ success: true });
      }
      case 'close_incident': {
        await base44.asServiceRole.entities.SoundIncident.update(item_id, {
          status: 'closed',
          resolution_notes: item.resolution_notes || '',
        });
        await logAudit(base44, user, 'update', 'SoundIncident', item_id, 'Incident clôturé');
        return Response.json({ success: true });
      }

      // === CHECKLIST TEMPLATES ===
      case 'save_template': {
        const data = {
          department_id: deptId,
          name: item.name,
          description: item.description || '',
          items: item.items || [],
          active: item.active !== false,
        };
        if (item_id) {
          await base44.asServiceRole.entities.SoundChecklistTemplate.update(item_id, data);
          await logAudit(base44, user, 'update', 'SoundChecklistTemplate', item_id, `Template modifié: ${data.name}`);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.SoundChecklistTemplate.create(data);
          await logAudit(base44, user, 'create', 'SoundChecklistTemplate', created.id, `Template créé: ${data.name}`);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'delete_template': {
        await base44.asServiceRole.entities.SoundChecklistTemplate.update(item_id, { active: false });
        await logAudit(base44, user, 'update', 'SoundChecklistTemplate', item_id, 'Template désactivé');
        return Response.json({ success: true });
      }

      // === CHECKLIST RUNS ===
      case 'start_checklist': {
        // Créer un run à partir d'un template pour un service
        const template = await base44.asServiceRole.entities.SoundChecklistTemplate.get(item.template_id);
        if (!template) return Response.json({ error: 'Template introuvable' }, { status: 404 });

        const run = await base44.asServiceRole.entities.SoundChecklistRun.create({
          department_id: deptId,
          service_plan_id: item.service_plan_id || null,
          template_id: template.id,
          template_name: template.name,
          status: 'in_progress',
        });

        // Créer les item states à partir des items du template
        const items = template.items || [];
        for (let i = 0; i < items.length; i++) {
          await base44.asServiceRole.entities.SoundChecklistItemState.create({
            run_id: run.id,
            department_id: deptId,
            item_label: items[i].label,
            item_order: items[i].item_order || i,
            state: 'todo',
            note: '',
          });
        }

        await logAudit(base44, user, 'create', 'SoundChecklistRun', run.id, `Checklist démarrée: ${template.name}`);
        return Response.json({ success: true, id: run.id });
      }
      case 'update_checklist_item': {
        const updates: any = {};
        if (item.state) updates.state = item.state;
        if (item.note !== undefined) updates.note = item.note;
        await base44.asServiceRole.entities.SoundChecklistItemState.update(item_id, updates);
        return Response.json({ success: true });
      }
      case 'complete_checklist': {
        await base44.asServiceRole.entities.SoundChecklistRun.update(item_id, {
          status: 'completed',
          completed_by_name: user.full_name || user.email,
        });
        await logAudit(base44, user, 'update', 'SoundChecklistRun', item_id, 'Checklist terminée');
        return Response.json({ success: true });
      }

      // === PROFILES ===
      case 'save_profile': {
        const data = {
          department_id: deptId,
          user_id: item.user_id,
          full_name: item.full_name || '',
          positions: item.positions || [],
          active: item.active !== false,
          notes: item.notes || '',
        };
        const existing = await base44.asServiceRole.entities.SoundMemberProfile.filter({
          department_id: deptId,
          user_id: item.user_id,
        });
        if (existing && existing[0]) {
          await base44.asServiceRole.entities.SoundMemberProfile.update(existing[0].id, data);
          await logAudit(base44, user, 'update', 'SoundMemberProfile', existing[0].id, `Profil technique modifié: ${data.full_name}`);
          return Response.json({ success: true, id: existing[0].id });
        } else {
          const created = await base44.asServiceRole.entities.SoundMemberProfile.create(data);
          await logAudit(base44, user, 'create', 'SoundMemberProfile', created.id, `Profil technique créé: ${data.full_name}`);
          return Response.json({ success: true, id: created.id });
        }
      }

      // === AVAILABILITY ===
      case 'save_availability': {
        const targetUserId = item.user_id || userId;
        if (!isResponsable && targetUserId !== userId) {
          return Response.json({ error: 'Tu ne peux gérer que ta propre disponibilité.' }, { status: 403 });
        }
        const data = {
          department_id: deptId,
          user_id: targetUserId,
          full_name: item.full_name || user.full_name || '',
          date: item.date,
          status: item.status || 'unsure',
          reason: item.reason || '',
        };
        const existing = await base44.asServiceRole.entities.SoundAvailability.filter({
          department_id: deptId,
          user_id: targetUserId,
          date: item.date,
        });
        if (existing && existing[0]) {
          await base44.asServiceRole.entities.SoundAvailability.update(existing[0].id, data);
          return Response.json({ success: true, id: existing[0].id });
        } else {
          const created = await base44.asServiceRole.entities.SoundAvailability.create(data);
          return Response.json({ success: true, id: created.id });
        }
      }

      default:
        return Response.json({ error: 'Opération non reconnue: ' + operation }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function logAudit(base44: any, user: any, action: string, entityType: string, entityId: string, details: string) {
  try {
    await base44.asServiceRole.entities.AuditLog.create({
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      performed_by_id: user.id,
      performed_by_name: user.full_name || user.email,
      performed_by_role: user.role || '',
    });
  } catch {
    // Non bloquant
  }
}