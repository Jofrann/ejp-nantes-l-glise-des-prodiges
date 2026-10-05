import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { checkModerationAccess } from '../../shared/moderationPermissions.ts';

/**
 * manageModerationItem — Fonction backend pour les écritures Modération.
 *
 * Opérations responsable uniquement :
 *   save_plan, delete_plan, save_run_item, delete_run_item, reorder_run_items,
 *   save_announcement, delete_announcement, save_profile,
 *   assign_moderator, assign_co_moderator
 *
 * Opérations membre :
 *   update_run_item_status (si responsable)
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

    const access = await checkModerationAccess(base44, department_slug);
    if (access.not_found) return Response.json({ not_found: true });
    if (access.access_denied) return Response.json({ access_denied: true }, { status: 403 });

    const deptId = access.department.id;
    const isResponsable = access.isResponsable;
    const isAdmin = access.isAdmin;
    const userId = user.id;

    const RESPONSABLE_OPS = [
      'save_plan', 'delete_plan',
      'save_run_item', 'delete_run_item', 'reorder_run_items',
      'save_announcement', 'delete_announcement',
      'save_profile',
      'assign_moderator', 'assign_co_moderator',
      'update_run_item_status',
    ];

    if (RESPONSABLE_OPS.includes(operation) && !isResponsable) {
      return Response.json({ error: 'Seul un responsable Modération peut effectuer cette action.' }, { status: 403 });
    }

    switch (operation) {
      // === PLANS ===
      case 'save_plan': {
        const data = {
          department_id: deptId,
          event_id: item.event_id || null,
          title: item.title,
          date: item.date,
          call_time: item.call_time || '',
          moderator_user_id: item.moderator_user_id || null,
          moderator_name: item.moderator_name || '',
          co_moderator_user_id: item.co_moderator_user_id || null,
          co_moderator_name: item.co_moderator_name || '',
          status: item.status || 'draft',
          general_notes: item.general_notes || '',
          created_by: userId,
        };
        if (item_id) {
          await base44.asServiceRole.entities.ModerationServicePlan.update(item_id, data);
          await logAudit(base44, user, 'moderation_plan_created', 'ModerationServicePlan', item_id, `Plan modération modifié: ${data.title}`);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.ModerationServicePlan.create(data);
          await logAudit(base44, user, 'moderation_plan_created', 'ModerationServicePlan', created.id, `Plan modération créé: ${data.title}`);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'delete_plan': {
        await base44.asServiceRole.entities.ModerationRunItem.deleteMany({ service_plan_id: item_id });
        await base44.asServiceRole.entities.ModerationServicePlan.delete(item_id);
        await logAudit(base44, user, 'delete', 'ModerationServicePlan', item_id, 'Plan modération supprimé');
        return Response.json({ success: true });
      }

      // === RUN ITEMS (CONDUCTEUR) ===
      case 'save_run_item': {
        const data = {
          service_plan_id: item.service_plan_id,
          department_id: deptId,
          order_index: item.order_index ?? 0,
          type: item.type || 'custom',
          title: item.title,
          start_time: item.start_time || '',
          duration_minutes: item.duration_minutes || null,
          speaker_user_id: item.speaker_user_id || null,
          speaker_name: item.speaker_name || '',
          external_speaker_name: item.external_speaker_name || '',
          instructions: item.instructions || '',
          status: item.status || 'planned',
        };
        if (item_id) {
          await base44.asServiceRole.entities.ModerationRunItem.update(item_id, data);
          await logAudit(base44, user, 'run_item_changed', 'ModerationRunItem', item_id, `Séquence modifiée: ${data.title}`);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.ModerationRunItem.create(data);
          await logAudit(base44, user, 'run_item_changed', 'ModerationRunItem', created.id, `Séquence créée: ${data.title}`);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'delete_run_item': {
        await base44.asServiceRole.entities.ModerationRunItem.delete(item_id);
        await logAudit(base44, user, 'delete', 'ModerationRunItem', item_id, 'Séquence supprimée');
        return Response.json({ success: true });
      }
      case 'reorder_run_items': {
        // item = { items: [{ id, order_index }] }
        const items = item.items || [];
        for (const it of items) {
          await base44.asServiceRole.entities.ModerationRunItem.update(it.id, { order_index: it.order_index });
        }
        await logAudit(base44, user, 'run_item_changed', 'ModerationRunItem', '', 'Conducteur réordonné');
        return Response.json({ success: true });
      }
      case 'update_run_item_status': {
        await base44.asServiceRole.entities.ModerationRunItem.update(item_id, { status: item.status });
        return Response.json({ success: true });
      }

      // === ANNOUNCEMENTS ===
      case 'save_announcement': {
        const data = {
          department_id: deptId,
          title: item.title,
          text: item.text || '',
          event_id: item.event_id || null,
          active_from: item.active_from || null,
          active_until: item.active_until || null,
          priority: item.priority || 'medium',
          status: item.status || 'draft',
          created_by: userId,
        };
        if (item_id) {
          await base44.asServiceRole.entities.ModerationAnnouncement.update(item_id, data);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.ModerationAnnouncement.create(data);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'delete_announcement': {
        await base44.asServiceRole.entities.ModerationAnnouncement.update(item_id, { status: 'archived' });
        return Response.json({ success: true });
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
        const existing = await base44.asServiceRole.entities.ModerationMemberProfile.filter({
          department_id: deptId, user_id: item.user_id,
        });
        if (existing && existing[0]) {
          await base44.asServiceRole.entities.ModerationMemberProfile.update(existing[0].id, data);
          return Response.json({ success: true, id: existing[0].id });
        } else {
          const created = await base44.asServiceRole.entities.ModerationMemberProfile.create(data);
          return Response.json({ success: true, id: created.id });
        }
      }

      // === MODERATOR ASSIGNMENT ===
      case 'assign_moderator': {
        const data = {
          moderator_user_id: item.user_id || null,
          moderator_name: item.full_name || '',
        };
        await base44.asServiceRole.entities.ModerationServicePlan.update(item_id, data);
        await logAudit(base44, user, 'moderation_assignment_changed', 'ModerationServicePlan', item_id, `Modérateur assigné: ${data.moderator_name}`);
        return Response.json({ success: true });
      }
      case 'assign_co_moderator': {
        const data = {
          co_moderator_user_id: item.user_id || null,
          co_moderator_name: item.full_name || '',
        };
        await base44.asServiceRole.entities.ModerationServicePlan.update(item_id, data);
        await logAudit(base44, user, 'moderation_assignment_changed', 'ModerationServicePlan', item_id, `Co-modérateur assigné: ${data.co_moderator_name}`);
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