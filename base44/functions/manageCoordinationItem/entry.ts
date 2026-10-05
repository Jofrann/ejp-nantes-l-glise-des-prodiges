import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { checkCoordinationAccess, canManageCoordination } from '../../shared/coordinationPermissions.ts';

/**
 * manageCoordinationItem — Fonction backend pour les écritures Coordination.
 *
 * Opérations responsable uniquement :
 *   save_plan, delete_plan,
 *   save_followup, update_followup_status, assign_followup, delete_followup,
 *   save_attention, update_attention_status, resolve_attention, delete_attention,
 *   save_meeting, update_meeting, delete_meeting, save_meeting_report,
 *   create_followup_from_meeting, create_attention_from_meeting,
 *   save_profile,
 *   save_report, submit_report, update_report_status, delete_report
 *
 * Opérations utilisateur (soi-même ou responsable) :
 *   update_my_followup_status
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

    const access = await checkCoordinationAccess(base44, department_slug);
    if (access.not_found) return Response.json({ not_found: true });
    if (access.access_denied) return Response.json({ access_denied: true }, { status: 403 });

    const deptId = access.department.id;
    const isResponsable = access.isResponsable;
    const isAdmin = access.isAdmin;
    const userId = user.id;
    const canManage = canManageCoordination(isResponsable, isAdmin);

    const MANAGE_OPS = [
      'save_plan', 'delete_plan',
      'save_followup', 'assign_followup', 'delete_followup',
      'save_attention', 'update_attention_status', 'resolve_attention', 'delete_attention',
      'save_meeting', 'update_meeting', 'delete_meeting', 'save_meeting_report',
      'create_followup_from_meeting', 'create_attention_from_meeting',
      'save_profile',
      'save_report', 'submit_report', 'update_report_status', 'delete_report',
    ];

    if (MANAGE_OPS.includes(operation) && !canManage) {
      return Response.json({ error: 'Seul un responsable Coordination peut effectuer cette action.' }, { status: 403 });
    }

    switch (operation) {
      // === PLANS ===
      case 'save_plan': {
        const data = {
          department_id: deptId,
          event_id: item.event_id || null,
          title: item.title,
          description: item.description || '',
          date: item.date,
          start_time: item.start_time || '',
          end_time: item.end_time || '',
          location: item.location || '',
          type: item.type || 'coordination',
          status: item.status || 'draft',
          created_by: userId,
        };
        if (item_id) {
          await base44.asServiceRole.entities.CoordinationPlan.update(item_id, data);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.CoordinationPlan.create(data);
          await logAudit(base44, user, 'coordination_plan_created', 'CoordinationPlan', created.id, `Plan créé: ${data.title}`);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'delete_plan': {
        await base44.asServiceRole.entities.CoordinationPlan.delete(item_id);
        await logAudit(base44, user, 'delete', 'CoordinationPlan', item_id, 'Plan supprimé');
        return Response.json({ success: true });
      }

      // === FOLLOWUPS ===
      case 'save_followup': {
        const data = {
          department_id: deptId,
          title: item.title,
          description: item.description || '',
          assigned_to: item.assigned_to || null,
          assigned_to_name: item.assigned_to_name || '',
          due_date: item.due_date || null,
          priority: item.priority || 'normal',
          status: item.status || 'todo',
          source: item.source || 'internal',
          source_meeting_id: item.source_meeting_id || null,
          source_event_id: item.source_event_id || null,
          created_by: userId,
        };
        if (item_id) {
          await base44.asServiceRole.entities.CoordinationFollowUp.update(item_id, data);
          await logAudit(base44, user, 'coordination_followup_updated', 'CoordinationFollowUp', item_id, `Suivi modifié: ${data.title}`);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.CoordinationFollowUp.create(data);
          await logAudit(base44, user, 'coordination_followup_created', 'CoordinationFollowUp', created.id, `Suivi créé: ${data.title}`);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'assign_followup': {
        await base44.asServiceRole.entities.CoordinationFollowUp.update(item_id, {
          assigned_to: item.assigned_to || null,
          assigned_to_name: item.assigned_to_name || '',
        });
        await logAudit(base44, user, 'coordination_followup_assigned', 'CoordinationFollowUp', item_id, `Suivi assigné à: ${item.assigned_to_name || '?'}`);
        return Response.json({ success: true });
      }
      case 'update_followup_status': {
        await base44.asServiceRole.entities.CoordinationFollowUp.update(item_id, { status: item.status });
        await logAudit(base44, user, 'coordination_followup_updated', 'CoordinationFollowUp', item_id, `Statut suivi → ${item.status}`);
        return Response.json({ success: true });
      }
      case 'update_my_followup_status': {
        const fu = await base44.asServiceRole.entities.CoordinationFollowUp.get(item_id);
        if (!fu) return Response.json({ error: 'Suivi introuvable' }, { status: 404 });
        if (!canManage && fu.assigned_to !== userId) {
          return Response.json({ error: 'Tu ne peux modifier que tes propres suivis.' }, { status: 403 });
        }
        await base44.asServiceRole.entities.CoordinationFollowUp.update(item_id, { status: item.status });
        return Response.json({ success: true });
      }
      case 'delete_followup': {
        await base44.asServiceRole.entities.CoordinationFollowUp.delete(item_id);
        await logAudit(base44, user, 'delete', 'CoordinationFollowUp', item_id, 'Suivi supprimé');
        return Response.json({ success: true });
      }

      // === ATTENTION POINTS ===
      case 'save_attention': {
        const data = {
          department_id: deptId,
          title: item.title,
          description: item.description || '',
          expected_action: item.expected_action || '',
          severity: item.severity || 'watch',
          status: item.status || 'open',
          assigned_to: item.assigned_to || null,
          assigned_to_name: item.assigned_to_name || '',
          due_date: item.due_date || null,
          created_by: userId,
        };
        if (item_id) {
          await base44.asServiceRole.entities.CoordinationAttentionPoint.update(item_id, data);
          await logAudit(base44, user, 'coordination_attention_updated', 'CoordinationAttentionPoint', item_id, `Point d'attention modifié: ${data.title}`);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.CoordinationAttentionPoint.create(data);
          await logAudit(base44, user, 'coordination_attention_created', 'CoordinationAttentionPoint', created.id, `Point d'attention créé: ${data.title}`);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'update_attention_status': {
        const update: any = { status: item.status };
        if (item.status === 'resolved') {
          update.resolved_at = new Date().toISOString().slice(0, 10);
        }
        await base44.asServiceRole.entities.CoordinationAttentionPoint.update(item_id, update);
        if (item.status === 'resolved') {
          await logAudit(base44, user, 'coordination_attention_resolved', 'CoordinationAttentionPoint', item_id, 'Point d\'attention résolu');
        }
        return Response.json({ success: true });
      }
      case 'resolve_attention': {
        await base44.asServiceRole.entities.CoordinationAttentionPoint.update(item_id, {
          status: 'resolved',
          resolved_at: new Date().toISOString().slice(0, 10),
        });
        await logAudit(base44, user, 'coordination_attention_resolved', 'CoordinationAttentionPoint', item_id, 'Point d\'attention résolu');
        return Response.json({ success: true });
      }
      case 'delete_attention': {
        await base44.asServiceRole.entities.CoordinationAttentionPoint.delete(item_id);
        await logAudit(base44, user, 'delete', 'CoordinationAttentionPoint', item_id, 'Point d\'attention supprimé');
        return Response.json({ success: true });
      }

      // === MEETINGS ===
      case 'save_meeting': {
        const data = {
          department_id: deptId,
          event_id: item.event_id || null,
          title: item.title,
          date: item.date,
          start_time: item.start_time || '',
          end_time: item.end_time || '',
          location: item.location || '',
          participant_ids: item.participant_ids || [],
          participant_names: item.participant_names || [],
          external_participants: item.external_participants || [],
          agenda: item.agenda || '',
          status: item.status || 'planned',
          created_by: userId,
        };
        if (item_id) {
          await base44.asServiceRole.entities.CoordinationMeeting.update(item_id, data);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.CoordinationMeeting.create(data);
          await logAudit(base44, user, 'coordination_meeting_created', 'CoordinationMeeting', created.id, `Réunion créée: ${data.title}`);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'update_meeting': {
        const data = {
          title: item.title,
          date: item.date,
          start_time: item.start_time || '',
          end_time: item.end_time || '',
          location: item.location || '',
          participant_ids: item.participant_ids || [],
          participant_names: item.participant_names || [],
          external_participants: item.external_participants || [],
          agenda: item.agenda || '',
          status: item.status || 'planned',
        };
        await base44.asServiceRole.entities.CoordinationMeeting.update(item_id, data);
        return Response.json({ success: true, id: item_id });
      }
      case 'delete_meeting': {
        await base44.asServiceRole.entities.CoordinationMeeting.delete(item_id);
        await logAudit(base44, user, 'delete', 'CoordinationMeeting', item_id, 'Réunion supprimée');
        return Response.json({ success: true });
      }
      case 'save_meeting_report': {
        await base44.asServiceRole.entities.CoordinationMeeting.update(item_id, {
          notes: item.notes || '',
          decisions: item.decisions || '',
          status: 'completed',
        });
        await logAudit(base44, user, 'coordination_meeting_completed', 'CoordinationMeeting', item_id, 'Compte rendu enregistré');
        return Response.json({ success: true, id: item_id });
      }
      case 'create_followup_from_meeting': {
        const meeting = await base44.asServiceRole.entities.CoordinationMeeting.get(item_id);
        if (!meeting) return Response.json({ error: 'Réunion introuvable' }, { status: 404 });
        const created = await base44.asServiceRole.entities.CoordinationFollowUp.create({
          department_id: deptId,
          title: item.title,
          description: item.description || '',
          assigned_to: item.assigned_to || null,
          assigned_to_name: item.assigned_to_name || '',
          due_date: item.due_date || null,
          priority: item.priority || 'normal',
          status: 'todo',
          source: 'meeting',
          source_meeting_id: item_id,
          created_by: userId,
        });
        await logAudit(base44, user, 'coordination_followup_created', 'CoordinationFollowUp', created.id, `Suivi créé depuis réunion: ${created.title}`);
        return Response.json({ success: true, id: created.id });
      }
      case 'create_attention_from_meeting': {
        const created = await base44.asServiceRole.entities.CoordinationAttentionPoint.create({
          department_id: deptId,
          title: item.title,
          description: item.description || '',
          expected_action: item.expected_action || '',
          severity: item.severity || 'watch',
          status: 'open',
          assigned_to: item.assigned_to || null,
          assigned_to_name: item.assigned_to_name || '',
          due_date: item.due_date || null,
          created_by: userId,
        });
        await logAudit(base44, user, 'coordination_attention_created', 'CoordinationAttentionPoint', created.id, `Point d'attention créé depuis réunion: ${created.title}`);
        return Response.json({ success: true, id: created.id });
      }

      // === PROFILES ===
      case 'save_profile': {
        const data = {
          department_id: deptId,
          user_id: item.user_id,
          full_name: item.full_name || '',
          functions: item.functions || [],
          active: item.active !== false,
          notes: item.notes || '',
        };
        const existing = await base44.asServiceRole.entities.CoordinationMemberProfile.filter({
          department_id: deptId, user_id: item.user_id,
        });
        if (existing && existing[0]) {
          await base44.asServiceRole.entities.CoordinationMemberProfile.update(existing[0].id, data);
          return Response.json({ success: true, id: existing[0].id });
        } else {
          const created = await base44.asServiceRole.entities.CoordinationMemberProfile.create(data);
          return Response.json({ success: true, id: created.id });
        }
      }

      // === REPORTS ===
      case 'save_report': {
        const data = {
          department_id: deptId,
          period_start: item.period_start || null,
          period_end: item.period_end || null,
          title: item.title,
          summary: item.summary || '',
          difficulties: item.difficulties || '',
          needs: item.needs || '',
          decisions: item.decisions || '',
          submitted_by: userId,
          submitted_by_name: user.full_name || user.email,
          status: item.status || 'draft',
        };
        if (item_id) {
          await base44.asServiceRole.entities.CoordinationReport.update(item_id, data);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.CoordinationReport.create(data);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'submit_report': {
        await base44.asServiceRole.entities.CoordinationReport.update(item_id, { status: 'submitted' });
        await logAudit(base44, user, 'coordination_report_submitted', 'CoordinationReport', item_id, 'Rapport soumis');
        return Response.json({ success: true });
      }
      case 'update_report_status': {
        await base44.asServiceRole.entities.CoordinationReport.update(item_id, { status: item.status });
        await logAudit(base44, user, 'coordination_report_status_changed', 'CoordinationReport', item_id, `Statut rapport → ${item.status}`);
        return Response.json({ success: true });
      }
      case 'delete_report': {
        await base44.asServiceRole.entities.CoordinationReport.delete(item_id);
        await logAudit(base44, user, 'delete', 'CoordinationReport', item_id, 'Rapport supprimé');
        return Response.json({ success: true });
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
  } catch {}
}