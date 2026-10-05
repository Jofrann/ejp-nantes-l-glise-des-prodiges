import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { checkLogisticsAccess } from '../../shared/logisticsPermissions.ts';

/**
 * manageLogisticsItem — Fonction backend pour les écritures Intendance.
 *
 * Opérations responsable uniquement :
 *   save_plan, delete_plan, save_task, delete_task, save_need, delete_need,
 *   save_equipment, delete_equipment, save_profile
 *
 * Opérations membre (assigné ou responsable) :
 *   update_task_status
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

    const access = await checkLogisticsAccess(base44, department_slug);
    if (access.not_found) return Response.json({ not_found: true });
    if (access.access_denied) return Response.json({ access_denied: true }, { status: 403 });

    const deptId = access.department.id;
    const isResponsable = access.isResponsable;
    const isAdmin = access.isAdmin;
    const userId = user.id;

    const RESPONSABLE_OPS = [
      'save_plan', 'delete_plan',
      'save_task', 'delete_task',
      'save_need', 'delete_need',
      'save_equipment', 'delete_equipment',
      'save_profile',
    ];

    if (RESPONSABLE_OPS.includes(operation) && !isResponsable) {
      return Response.json({ error: 'Seul un responsable Intendance peut effectuer cette action.' }, { status: 403 });
    }

    switch (operation) {
      // === PLANS ===
      case 'save_plan': {
        const data = {
          department_id: deptId,
          event_id: item.event_id || null,
          title: item.title,
          date: item.date,
          setup_time: item.setup_time || '',
          teardown_time: item.teardown_time || '',
          status: item.status || 'draft',
          instructions: item.instructions || '',
          created_by: userId,
        };
        if (item_id) {
          await base44.asServiceRole.entities.LogisticsPlan.update(item_id, data);
          await logAudit(base44, user, 'logistics_plan_created', 'LogisticsPlan', item_id, `Plan logistique modifié: ${data.title}`);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.LogisticsPlan.create(data);
          await logAudit(base44, user, 'logistics_plan_created', 'LogisticsPlan', created.id, `Plan logistique créé: ${data.title}`);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'delete_plan': {
        await base44.asServiceRole.entities.LogisticsTask.deleteMany({ logistics_plan_id: item_id });
        await base44.asServiceRole.entities.LogisticsPlan.delete(item_id);
        await logAudit(base44, user, 'delete', 'LogisticsPlan', item_id, 'Plan logistique supprimé');
        return Response.json({ success: true });
      }

      // === TASKS ===
      case 'save_task': {
        const data = {
          logistics_plan_id: item.logistics_plan_id,
          department_id: deptId,
          title: item.title,
          description: item.description || '',
          assigned_to: item.assigned_to || null,
          assigned_to_name: item.assigned_to_name || '',
          due_at: item.due_at || null,
          priority: item.priority || 'medium',
          status: item.status || 'todo',
          created_by: userId,
        };
        if (item_id) {
          await base44.asServiceRole.entities.LogisticsTask.update(item_id, data);
          await logAudit(base44, user, 'logistics_task_changed', 'LogisticsTask', item_id, `Tâche modifiée: ${data.title}`);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.LogisticsTask.create(data);
          await logAudit(base44, user, 'logistics_task_changed', 'LogisticsTask', created.id, `Tâche créée: ${data.title}`);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'delete_task': {
        await base44.asServiceRole.entities.LogisticsTask.delete(item_id);
        await logAudit(base44, user, 'delete', 'LogisticsTask', item_id, 'Tâche supprimée');
        return Response.json({ success: true });
      }
      case 'update_task_status': {
        // Un membre assigné peut mettre à jour le statut de sa tâche
        if (!isResponsable) {
          const task = await base44.asServiceRole.entities.LogisticsTask.get(item_id);
          if (!task || task.assigned_to !== userId) {
            return Response.json({ error: 'Tu ne peux modifier que tes propres tâches.' }, { status: 403 });
          }
        }
        await base44.asServiceRole.entities.LogisticsTask.update(item_id, { status: item.status });
        await logAudit(base44, user, 'logistics_task_changed', 'LogisticsTask', item_id, `Statut tâche → ${item.status}`);
        return Response.json({ success: true });
      }

      // === NEEDS ===
      case 'save_need': {
        const data = {
          logistics_plan_id: item.logistics_plan_id || null,
          department_id: deptId,
          title: item.title,
          category: item.category || 'materiel',
          quantity: item.quantity || '',
          requested_by: userId,
          requested_by_name: user.full_name || user.email,
          assigned_to: item.assigned_to || null,
          assigned_to_name: item.assigned_to_name || '',
          status: item.status || 'requested',
          notes: item.notes || '',
        };
        if (item_id) {
          await base44.asServiceRole.entities.LogisticsNeed.update(item_id, data);
          await logAudit(base44, user, 'logistics_need_changed', 'LogisticsNeed', item_id, `Besoin modifié: ${data.title}`);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.LogisticsNeed.create(data);
          await logAudit(base44, user, 'logistics_need_changed', 'LogisticsNeed', created.id, `Besoin créé: ${data.title}`);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'delete_need': {
        await base44.asServiceRole.entities.LogisticsNeed.update(item_id, { status: 'cancelled' });
        await logAudit(base44, user, 'logistics_need_changed', 'LogisticsNeed', item_id, 'Besoin annulé');
        return Response.json({ success: true });
      }

      // === EQUIPMENT ===
      case 'save_equipment': {
        const data = {
          department_id: deptId,
          name: item.name,
          category: item.category || 'autre',
          identifier: item.identifier || '',
          location: item.location || '',
          status: item.status || 'available',
          notes: item.notes || '',
          active: item.active !== false,
        };
        if (item_id) {
          await base44.asServiceRole.entities.LogisticsEquipment.update(item_id, data);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.LogisticsEquipment.create(data);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'delete_equipment': {
        await base44.asServiceRole.entities.LogisticsEquipment.update(item_id, { active: false });
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
        const existing = await base44.asServiceRole.entities.LogisticsMemberProfile.filter({
          department_id: deptId, user_id: item.user_id,
        });
        if (existing && existing[0]) {
          await base44.asServiceRole.entities.LogisticsMemberProfile.update(existing[0].id, data);
          return Response.json({ success: true, id: existing[0].id });
        } else {
          const created = await base44.asServiceRole.entities.LogisticsMemberProfile.create(data);
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
  } catch {}
}