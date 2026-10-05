import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { checkPrayerAccess, canReadRequest } from '../../shared/prayerPermissions.ts';

/**
 * managePrayerItem — Fonction backend pour les écritures MPI.
 *
 * Toutes les écritures passent par cette fonction qui vérifie :
 * 1. L'appartenance au département MPI
 * 2. Le statut responsable pour les opérations de gestion
 * 3. La propriété pour les opérations personnelles (confirmer affectation, disponibilité)
 * 4. Le niveau de confidentialité pour les demandes de prière
 *
 * Opérations responsable uniquement :
 *   save_schedule, delete_schedule, save_assignment, delete_assignment,
 *   save_topic, delete_topic, save_profile,
 *   save_request (RESTRICTED_MPI+), update_request_status, close_request,
 *   add_assignee, remove_assignee, add_update
 *
 * Opérations utilisateur (soi-même ou responsable) :
 *   confirm_assignment, decline_assignment, save_availability
 *
 * Opérations membre (avec restriction de niveau) :
 *   create_request, get_request_detail
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
    const access = await checkPrayerAccess(base44, department_slug);
    if (access.not_found) return Response.json({ not_found: true });
    if (access.access_denied) {
      return Response.json({ access_denied: true }, { status: 403 });
    }

    const deptId = access.department.id;
    const isResponsable = access.isResponsable;
    const isAdmin = access.isAdmin;
    const isLeader = access.isLeader;
    const userId = user.id;

    // Opérations nécessitant le statut responsable
    const RESPONSABLE_OPS = [
      'save_schedule', 'delete_schedule',
      'save_assignment', 'delete_assignment',
      'save_topic', 'delete_topic',
      'save_profile',
      'update_request_status', 'close_request',
      'add_assignee', 'remove_assignee',
    ];

    if (RESPONSABLE_OPS.includes(operation) && !isResponsable) {
      return Response.json({
        error: 'Seul un responsable MPI peut effectuer cette action.',
      }, { status: 403 });
    }

    // 2. Router selon l'opération
    switch (operation) {
      // === SCHEDULES ===
      case 'save_schedule': {
        const data = {
          department_id: deptId,
          title: item.title,
          date: item.date,
          start_time: item.start_time || '',
          end_time: item.end_time || '',
          location: item.location || '',
          type: item.type || 'intercession',
          status: item.status || 'draft',
          notes: item.notes || '',
        };
        if (item_id) {
          await base44.asServiceRole.entities.PrayerSchedule.update(item_id, data);
          await logAudit(base44, user, 'update', 'PrayerSchedule', item_id, `Temps de prière modifié: ${data.title}`);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.PrayerSchedule.create(data);
          await logAudit(base44, user, 'create', 'PrayerSchedule', created.id, `Temps de prière créé: ${data.title}`);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'delete_schedule': {
        await base44.asServiceRole.entities.PrayerAssignment.deleteMany({
          schedule_id: item_id,
        });
        await base44.asServiceRole.entities.PrayerSchedule.delete(item_id);
        await logAudit(base44, user, 'delete', 'PrayerSchedule', item_id, 'Temps de prière supprimé');
        return Response.json({ success: true });
      }

      // === ASSIGNMENTS ===
      case 'save_assignment': {
        const data = {
          schedule_id: item.schedule_id,
          department_id: deptId,
          user_id: item.user_id,
          full_name: item.full_name || '',
          role: item.role || 'intercesseur',
          status: item.status || 'assigned',
          notes: item.notes || '',
        };
        if (item_id) {
          await base44.asServiceRole.entities.PrayerAssignment.update(item_id, data);
          await logAudit(base44, user, 'update', 'PrayerAssignment', item_id, `Affectation modifiée: ${data.full_name}`);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.PrayerAssignment.create(data);
          await logAudit(base44, user, 'create', 'PrayerAssignment', created.id, `Affectation: ${data.full_name}`);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'delete_assignment': {
        await base44.asServiceRole.entities.PrayerAssignment.delete(item_id);
        await logAudit(base44, user, 'delete', 'PrayerAssignment', item_id, 'Affectation supprimée');
        return Response.json({ success: true });
      }
      case 'confirm_assignment': {
        const assignment = await base44.asServiceRole.entities.PrayerAssignment.get(item_id);
        if (!assignment) return Response.json({ error: 'Affectation introuvable' }, { status: 404 });
        if (!isResponsable && assignment.user_id !== userId) {
          return Response.json({ error: 'Tu ne peux confirmer que ta propre affectation.' }, { status: 403 });
        }
        await base44.asServiceRole.entities.PrayerAssignment.update(item_id, { status: 'confirmed' });
        await logAudit(base44, user, 'update', 'PrayerAssignment', item_id, 'Affectation confirmée');
        return Response.json({ success: true });
      }
      case 'decline_assignment': {
        const assignment = await base44.asServiceRole.entities.PrayerAssignment.get(item_id);
        if (!assignment) return Response.json({ error: 'Affectation introuvable' }, { status: 404 });
        if (!isResponsable && assignment.user_id !== userId) {
          return Response.json({ error: 'Tu ne peux décliner que ta propre affectation.' }, { status: 403 });
        }
        await base44.asServiceRole.entities.PrayerAssignment.update(item_id, { status: 'declined' });
        await logAudit(base44, user, 'update', 'PrayerAssignment', item_id, 'Affectation déclinée');
        return Response.json({ success: true });
      }

      // === TOPICS ===
      case 'save_topic': {
        // Les sujets leaders/restricted nécessitent le statut leader
        if (item.visibility === 'leaders' && !isLeader && !isAdmin) {
          return Response.json({ error: 'Seul un leader peut créer un sujet Leadership.' }, { status: 403 });
        }
        const data = {
          department_id: deptId,
          title: item.title,
          description: item.description || '',
          category: item.category || 'autre',
          priority: item.priority || 'medium',
          status: item.status || 'active',
          starts_at: item.starts_at || null,
          ends_at: item.ends_at || null,
          visibility: item.visibility || 'mpi',
        };
        if (item_id) {
          await base44.asServiceRole.entities.PrayerTopic.update(item_id, data);
          await logAudit(base44, user, 'update', 'PrayerTopic', item_id, `Sujet modifié: ${data.title}`);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.PrayerTopic.create(data);
          await logAudit(base44, user, 'create', 'PrayerTopic', created.id, `Sujet créé: ${data.title}`);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'delete_topic': {
        await base44.asServiceRole.entities.PrayerTopic.update(item_id, { status: 'archived' });
        await logAudit(base44, user, 'update', 'PrayerTopic', item_id, 'Sujet archivé');
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
        const existing = await base44.asServiceRole.entities.PrayerMemberProfile.filter({
          department_id: deptId,
          user_id: item.user_id,
        });
        if (existing && existing[0]) {
          await base44.asServiceRole.entities.PrayerMemberProfile.update(existing[0].id, data);
          await logAudit(base44, user, 'update', 'PrayerMemberProfile', existing[0].id, `Profil MPI modifié: ${data.full_name}`);
          return Response.json({ success: true, id: existing[0].id });
        } else {
          const created = await base44.asServiceRole.entities.PrayerMemberProfile.create(data);
          await logAudit(base44, user, 'create', 'PrayerMemberProfile', created.id, `Profil MPI créé: ${data.full_name}`);
          return Response.json({ success: true, id: created.id });
        }
      }

      // === REQUESTS ===
      case 'create_request': {
        // Tout membre MPI peut créer une demande
        // Mais les niveaux RESTRICTED_MPI+ nécessitent responsable
        let confidentiality = item.confidentiality || 'GENERAL_MPI';
        if (!isResponsable && (confidentiality === 'RESTRICTED_MPI' || confidentiality === 'LEADERS_ONLY')) {
          confidentiality = 'GENERAL_MPI'; // Downgrade pour les membres ordinaires
        }
        if (confidentiality === 'LEADERS_ONLY' && !isLeader && !isAdmin) {
          confidentiality = 'RESTRICTED_MPI';
        }
        const data = {
          department_id: deptId,
          requester_user_id: item.requester_user_id || (item.is_self ? userId : null),
          submitted_by: user.full_name || user.email,
          title: item.title,
          request_text: item.request_text || '',
          category: item.category || 'general',
          confidentiality,
          status: 'new',
        };
        const created = await base44.asServiceRole.entities.PrayerRequest.create(data);
        // Log sans le contenu sensible
        await logAudit(base44, user, 'create', 'PrayerRequest', created.id, `Demande de prière créée (${confidentiality})`);
        return Response.json({ success: true, id: created.id });
      }
      case 'get_request_detail': {
        // Retourne le détail d'une demande SEULEMENT si l'utilisateur a accès
        const request = await base44.asServiceRole.entities.PrayerRequest.get(item_id);
        if (!request || request.department_id !== deptId) {
          return Response.json({ not_found: true });
        }
        // Charger les assignees pour vérifier l'accès
        let assigneeIds: string[] = [];
        if (request.confidentiality === 'PRIVATE_ASSIGNEES') {
          const assignees = await base44.asServiceRole.entities.PrayerRequestAssignee.filter({
            prayer_request_id: item_id,
          });
          assigneeIds = (assignees || []).map((a: any) => a.user_id);
        }
        if (!canReadRequest(request, assigneeIds, user, isResponsable, isAdmin, isLeader)) {
          return Response.json({ access_denied: true });
        }
        // Charger les updates
        const updates = await base44.asServiceRole.entities.PrayerRequestUpdate.filter({
          request_id: item_id,
        });
        // Charger les assignees visibles (uniquement pour PRIVATE_ASSIGNEES)
        let assignees: any[] = [];
        if (request.confidentiality === 'PRIVATE_ASSIGNEES') {
          assignees = await base44.asServiceRole.entities.PrayerRequestAssignee.filter({
            prayer_request_id: item_id,
          });
        }
        return Response.json({
          request,
          updates: updates || [],
          assignees: assignees || [],
        });
      }
      case 'update_request_status': {
        const updates: any = { status: item.status };
        if (item.status === 'closed' || item.status === 'archived') {
          updates.closed_at = new Date().toISOString().split('T')[0];
        }
        await base44.asServiceRole.entities.PrayerRequest.update(item_id, updates);
        await logAudit(base44, user, 'update', 'PrayerRequest', item_id, `Statut demande → ${item.status}`);
        return Response.json({ success: true });
      }
      case 'close_request': {
        await base44.asServiceRole.entities.PrayerRequest.update(item_id, {
          status: 'closed',
          closed_at: new Date().toISOString().split('T')[0],
        });
        await logAudit(base44, user, 'update', 'PrayerRequest', item_id, 'Demande clôturée');
        return Response.json({ success: true });
      }
      case 'add_assignee': {
        // Vérifier que la demande existe et est PRIVATE_ASSIGNEES
        const request = await base44.asServiceRole.entities.PrayerRequest.get(item.prayer_request_id);
        if (!request || request.department_id !== deptId) {
          return Response.json({ error: 'Demande introuvable' }, { status: 404 });
        }
        const data = {
          prayer_request_id: item.prayer_request_id,
          department_id: deptId,
          user_id: item.user_id,
          full_name: item.full_name || '',
          role: item.role || 'intercesseur',
        };
        const created = await base44.asServiceRole.entities.PrayerRequestAssignee.create(data);
        await logAudit(base44, user, 'create', 'PrayerRequestAssignee', created.id, `Assigné ajouté à la demande ${item.prayer_request_id}`);
        return Response.json({ success: true, id: created.id });
      }
      case 'remove_assignee': {
        await base44.asServiceRole.entities.PrayerRequestAssignee.delete(item_id);
        await logAudit(base44, user, 'delete', 'PrayerRequestAssignee', item_id, 'Assigné retiré');
        return Response.json({ success: true });
      }
      case 'add_update': {
        // Vérifier que l'utilisateur peut lire la demande avant d'ajouter un update
        const request = await base44.asServiceRole.entities.PrayerRequest.get(item.request_id);
        if (!request || request.department_id !== deptId) {
          return Response.json({ error: 'Demande introuvable' }, { status: 404 });
        }
        let assigneeIds: string[] = [];
        if (request.confidentiality === 'PRIVATE_ASSIGNEES') {
          const assignees = await base44.asServiceRole.entities.PrayerRequestAssignee.filter({
            prayer_request_id: item.request_id,
          });
          assigneeIds = (assignees || []).map((a: any) => a.user_id);
        }
        if (!canReadRequest(request, assigneeIds, user, isResponsable, isAdmin, isLeader)) {
          return Response.json({ error: 'Tu ne peux pas commenter cette demande.' }, { status: 403 });
        }
        const data = {
          request_id: item.request_id,
          department_id: deptId,
          text: item.text,
          created_by: userId,
          created_by_name: user.full_name || user.email,
        };
        const created = await base44.asServiceRole.entities.PrayerRequestUpdate.create(data);
        // Log sans le texte sensible
        await logAudit(base44, user, 'create', 'PrayerRequestUpdate', created.id, `Mise à jour ajoutée à la demande ${item.request_id}`);
        return Response.json({ success: true, id: created.id });
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
          status: item.status || 'maybe',
          reason: item.reason || '',
        };
        const existing = await base44.asServiceRole.entities.PrayerAvailability.filter({
          department_id: deptId,
          user_id: targetUserId,
          date: item.date,
        });
        if (existing && existing[0]) {
          await base44.asServiceRole.entities.PrayerAvailability.update(existing[0].id, data);
          return Response.json({ success: true, id: existing[0].id });
        } else {
          const created = await base44.asServiceRole.entities.PrayerAvailability.create(data);
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