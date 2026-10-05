import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { checkMusicAccess } from '../../shared/musicPermissions.ts';

/**
 * manageMusicItem — Fonction backend pour les écritures musicales.
 *
 * Toutes les écritures passent par cette fonction qui vérifie :
 * 1. L'appartenance au département Prodiges Musique
 * 2. Le statut responsable pour les opérations de gestion
 * 3. La propriété pour les opérations personnelles (confirmer affectation, disponibilité)
 *
 * Paramètres :
 * - department_slug : slug du département
 * - operation : type d'opération (voir switch ci-dessous)
 * - item : données de l'élément à créer/modifier
 * - item_id : ID de l'élément à modifier/supprimer
 *
 * Opérations responsable uniquement :
 *   save_plan, delete_plan, save_assignment, delete_assignment,
 *   save_rehearsal, delete_rehearsal, save_song, delete_song,
 *   save_setlist_item, delete_setlist_item, reorder_setlist, save_profile
 *
 * Opérations utilisateur (soi-même ou responsable) :
 *   confirm_assignment, decline_assignment, save_availability
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
    const access = await checkMusicAccess(base44, department_slug);
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
      'save_rehearsal', 'delete_rehearsal',
      'save_song', 'delete_song',
      'save_setlist_item', 'delete_setlist_item', 'reorder_setlist',
      'save_profile',
    ];

    if (RESPONSABLE_OPS.includes(operation) && !isResponsable) {
      return Response.json({
        error: 'Seul un responsable de Prodiges Musique peut effectuer cette action.',
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
          start_time: item.start_time || '',
          status: item.status || 'draft',
          notes: item.notes || '',
        };
        if (item_id) {
          await base44.asServiceRole.entities.MusicServicePlan.update(item_id, data);
          await logAudit(base44, user, 'update', 'MusicServicePlan', item_id, `Plan modifié: ${data.title}`);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.MusicServicePlan.create(data);
          await logAudit(base44, user, 'create', 'MusicServicePlan', created.id, `Plan créé: ${data.title}`);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'delete_plan': {
        // Supprimer aussi les assignments et setlist items associés
        await base44.asServiceRole.entities.MusicAssignment.deleteMany({
          service_plan_id: item_id,
        });
        await base44.asServiceRole.entities.MusicSetlistItem.deleteMany({
          service_plan_id: item_id,
        });
        await base44.asServiceRole.entities.MusicServicePlan.delete(item_id);
        await logAudit(base44, user, 'delete', 'MusicServicePlan', item_id, 'Plan supprimé');
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
        };
        if (item_id) {
          await base44.asServiceRole.entities.MusicAssignment.update(item_id, data);
          await logAudit(base44, user, 'update', 'MusicAssignment', item_id, `Affectation modifiée: ${data.full_name} → ${data.position}`);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.MusicAssignment.create(data);
          await logAudit(base44, user, 'create', 'MusicAssignment', created.id, `Affectation: ${data.full_name} → ${data.position}`);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'delete_assignment': {
        await base44.asServiceRole.entities.MusicAssignment.delete(item_id);
        await logAudit(base44, user, 'delete', 'MusicAssignment', item_id, 'Affectation supprimée');
        return Response.json({ success: true });
      }
      case 'confirm_assignment': {
        // L'utilisateur confirme SA propre affectation (ou responsable)
        const assignment = await base44.asServiceRole.entities.MusicAssignment.get(item_id);
        if (!assignment) return Response.json({ error: 'Affectation introuvable' }, { status: 404 });
        if (!isResponsable && assignment.user_id !== userId) {
          return Response.json({ error: 'Tu ne peux confirmer que ta propre affectation.' }, { status: 403 });
        }
        await base44.asServiceRole.entities.MusicAssignment.update(item_id, { status: 'confirmed' });
        await logAudit(base44, user, 'update', 'MusicAssignment', item_id, 'Affectation confirmée');
        return Response.json({ success: true });
      }
      case 'decline_assignment': {
        const assignment = await base44.asServiceRole.entities.MusicAssignment.get(item_id);
        if (!assignment) return Response.json({ error: 'Affectation introuvable' }, { status: 404 });
        if (!isResponsable && assignment.user_id !== userId) {
          return Response.json({ error: 'Tu ne peux décliner que ta propre affectation.' }, { status: 403 });
        }
        await base44.asServiceRole.entities.MusicAssignment.update(item_id, { status: 'declined' });
        await logAudit(base44, user, 'update', 'MusicAssignment', item_id, 'Affectation déclinée');
        return Response.json({ success: true });
      }

      // === REHEARSALS ===
      case 'save_rehearsal': {
        const data = {
          department_id: deptId,
          service_plan_id: item.service_plan_id || null,
          title: item.title,
          date: item.date,
          start_time: item.start_time || '',
          end_time: item.end_time || '',
          location: item.location || '',
          notes: item.notes || '',
          status: item.status || 'scheduled',
        };
        if (item_id) {
          await base44.asServiceRole.entities.MusicRehearsal.update(item_id, data);
          await logAudit(base44, user, 'update', 'MusicRehearsal', item_id, `Répétition modifiée: ${data.title}`);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.MusicRehearsal.create(data);
          await logAudit(base44, user, 'create', 'MusicRehearsal', created.id, `Répétition créée: ${data.title}`);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'delete_rehearsal': {
        await base44.asServiceRole.entities.MusicRehearsal.delete(item_id);
        await logAudit(base44, user, 'delete', 'MusicRehearsal', item_id, 'Répétition supprimée');
        return Response.json({ success: true });
      }

      // === SONGS ===
      case 'save_song': {
        const data = {
          department_id: deptId,
          title: item.title,
          artist: item.artist || '',
          default_key: item.default_key || '',
          bpm: item.bpm || null,
          category: item.category || 'louange',
          link: item.link || '',
          active: item.active !== false,
          notes: item.notes || '',
        };
        if (item_id) {
          await base44.asServiceRole.entities.MusicSong.update(item_id, data);
          await logAudit(base44, user, 'update', 'MusicSong', item_id, `Chant modifié: ${data.title}`);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.MusicSong.create(data);
          await logAudit(base44, user, 'create', 'MusicSong', created.id, `Chant ajouté: ${data.title}`);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'delete_song': {
        await base44.asServiceRole.entities.MusicSong.delete(item_id);
        await logAudit(base44, user, 'delete', 'MusicSong', item_id, 'Chant supprimé');
        return Response.json({ success: true });
      }

      // === SETLIST ITEMS ===
      case 'save_setlist_item': {
        const data = {
          service_plan_id: item.service_plan_id,
          department_id: deptId,
          song_id: item.song_id || null,
          title: item.title,
          item_key: item.item_key || '',
          item_order: item.item_order || 0,
          notes: item.notes || '',
          lead_user_id: item.lead_user_id || null,
        };
        if (item_id) {
          await base44.asServiceRole.entities.MusicSetlistItem.update(item_id, data);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.MusicSetlistItem.create(data);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'delete_setlist_item': {
        await base44.asServiceRole.entities.MusicSetlistItem.delete(item_id);
        return Response.json({ success: true });
      }
      case 'reorder_setlist': {
        // item = { items: [{id, item_order}, ...] }
        const items = item.items || [];
        for (const it of items) {
          await base44.asServiceRole.entities.MusicSetlistItem.update(it.id, {
            item_order: it.item_order,
          });
        }
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
        // Upsert: find existing profile for this user+dept
        const existing = await base44.asServiceRole.entities.MusicMemberProfile.filter({
          department_id: deptId,
          user_id: item.user_id,
        });
        if (existing && existing[0]) {
          await base44.asServiceRole.entities.MusicMemberProfile.update(existing[0].id, data);
          await logAudit(base44, user, 'update', 'MusicMemberProfile', existing[0].id, `Profil musical modifié: ${data.full_name}`);
          return Response.json({ success: true, id: existing[0].id });
        } else {
          const created = await base44.asServiceRole.entities.MusicMemberProfile.create(data);
          await logAudit(base44, user, 'create', 'MusicMemberProfile', created.id, `Profil musical créé: ${data.full_name}`);
          return Response.json({ success: true, id: created.id });
        }
      }

      // === AVAILABILITY ===
      case 'save_availability': {
        // Un membre gère SA disponibilité ; un responsable peut aussi
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
        // Upsert: find existing for this user+date
        const existing = await base44.asServiceRole.entities.MusicAvailability.filter({
          department_id: deptId,
          user_id: targetUserId,
          date: item.date,
        });
        if (existing && existing[0]) {
          await base44.asServiceRole.entities.MusicAvailability.update(existing[0].id, data);
          return Response.json({ success: true, id: existing[0].id });
        } else {
          const created = await base44.asServiceRole.entities.MusicAvailability.create(data);
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