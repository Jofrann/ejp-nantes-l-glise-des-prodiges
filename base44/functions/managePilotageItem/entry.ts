import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { canAccessPilotage, canDismissPilotageAlerts } from '../../shared/pilotagePermissions.ts';

/**
 * managePilotageItem — Gestion des décisions et alertes Pilotage.
 *
 * Opérations :
 * - create_decision : crée une PilotageDecision
 * - update_decision : modifie une décision (titre, description, priorité, statut, assignation, échéance)
 * - resolve_decision : marque une décision comme résolue
 * - cancel_decision : annule une décision
 * - delete_decision : supprime une décision
 * - dismiss_alert : masque une alerte (crée un PilotageAlertDismissal)
 * - restore_alert : restaure une alerte masquée (supprime le PilotageAlertDismissal)
 *
 * Accès : canAccessPilotage(user) pour toutes les opérations.
 */
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (!canAccessPilotage(user)) {
      return Response.json({ access_denied: true, message: 'Accès Pilotage non autorisé.' }, { status: 403 });
    }

    const body = await req.json();
    const { operation, ...params } = body;

    const userName = user.full_name || user.email;

    // === CRÉATION DE DÉCISION ===
    if (operation === 'create_decision') {
      const { title, description, source_type, source_id, source_department_id, source_department_slug, priority, assigned_user_id, assigned_to_name, due_date } = params;
      if (!title) return Response.json({ error: 'title requis' }, { status: 400 });

      const decision = await base44.asServiceRole.entities.PilotageDecision.create({
        title,
        description: description || null,
        source_type: source_type || 'manual',
        source_id: source_id || null,
        source_department_id: source_department_id || null,
        source_department_slug: source_department_slug || null,
        priority: priority || 'normal',
        status: 'open',
        assigned_user_id: assigned_user_id || null,
        assigned_to_name: assigned_to_name || null,
        due_date: due_date || null,
        created_by: user.id,
        created_by_name: userName,
      });

      await base44.asServiceRole.entities.AuditLog.create({
        action: 'create',
        entity_type: 'PilotageDecision',
        entity_id: decision.id,
        details: `Décision créée : ${title}`,
        performed_by_id: user.id,
        performed_by_name: userName,
        performed_by_role: user.role || (user.roles || []).join(','),
      });

      return Response.json({ success: true, decision });
    }

    // === MODIFICATION DE DÉCISION ===
    if (operation === 'update_decision') {
      const { decision_id, ...updates } = params;
      if (!decision_id) return Response.json({ error: 'decision_id requis' }, { status: 400 });

      const allowed: any = {};
      ['title', 'description', 'priority', 'status', 'assigned_user_id', 'assigned_to_name', 'due_date'].forEach((f) => {
        if (updates[f] !== undefined) allowed[f] = updates[f];
      });

      const updated = await base44.asServiceRole.entities.PilotageDecision.update(decision_id, allowed);

      await base44.asServiceRole.entities.AuditLog.create({
        action: 'update',
        entity_type: 'PilotageDecision',
        entity_id: decision_id,
        details: `Décision modifiée : ${allowed.title || ''}`,
        performed_by_id: user.id,
        performed_by_name: userName,
        performed_by_role: user.role || (user.roles || []).join(','),
      });

      return Response.json({ success: true, decision: updated });
    }

    // === RÉSOUDRE UNE DÉCISION ===
    if (operation === 'resolve_decision') {
      const { decision_id, resolution_notes } = params;
      if (!decision_id) return Response.json({ error: 'decision_id requis' }, { status: 400 });

      const today = new Date().toISOString().split('T')[0];
      const updated = await base44.asServiceRole.entities.PilotageDecision.update(decision_id, {
        status: 'resolved',
        resolved_at: today,
        resolution_notes: resolution_notes || null,
      });

      await base44.asServiceRole.entities.AuditLog.create({
        action: 'resolve',
        entity_type: 'PilotageDecision',
        entity_id: decision_id,
        details: `Décision résolue`,
        performed_by_id: user.id,
        performed_by_name: userName,
        performed_by_role: user.role || (user.roles || []).join(','),
      });

      return Response.json({ success: true, decision: updated });
    }

    // === ANNULER UNE DÉCISION ===
    if (operation === 'cancel_decision') {
      const { decision_id } = params;
      if (!decision_id) return Response.json({ error: 'decision_id requis' }, { status: 400 });

      const updated = await base44.asServiceRole.entities.PilotageDecision.update(decision_id, {
        status: 'cancelled',
      });

      await base44.asServiceRole.entities.AuditLog.create({
        action: 'cancel',
        entity_type: 'PilotageDecision',
        entity_id: decision_id,
        details: `Décision annulée`,
        performed_by_id: user.id,
        performed_by_name: userName,
        performed_by_role: user.role || (user.roles || []).join(','),
      });

      return Response.json({ success: true, decision: updated });
    }

    // === SUPPRIMER UNE DÉCISION ===
    if (operation === 'delete_decision') {
      const { decision_id } = params;
      if (!decision_id) return Response.json({ error: 'decision_id requis' }, { status: 400 });

      await base44.asServiceRole.entities.PilotageDecision.delete(decision_id);

      await base44.asServiceRole.entities.AuditLog.create({
        action: 'delete',
        entity_type: 'PilotageDecision',
        entity_id: decision_id,
        details: `Décision supprimée`,
        performed_by_id: user.id,
        performed_by_name: userName,
        performed_by_role: user.role || (user.roles || []).join(','),
      });

      return Response.json({ success: true });
    }

    // === MASQUER UNE ALERTE ===
    if (operation === 'dismiss_alert') {
      if (!canDismissPilotageAlerts(user)) {
        return Response.json({ access_denied: true }, { status: 403 });
      }
      const { alert_key, alert_title, source_type, source_id, reason } = params;
      if (!alert_key) return Response.json({ error: 'alert_key requis' }, { status: 400 });

      // Vérifier qu'il n'existe pas déjà
      const existing = await base44.asServiceRole.entities.PilotageAlertDismissal.filter({ alert_key });
      if (existing && existing.length > 0) {
        return Response.json({ success: true, already_dismissed: true });
      }

      const dismissal = await base44.asServiceRole.entities.PilotageAlertDismissal.create({
        alert_key,
        alert_title: alert_title || null,
        source_type: source_type || null,
        source_id: source_id || null,
        dismissed_by: user.id,
        dismissed_by_name: userName,
        reason: reason || null,
      });

      await base44.asServiceRole.entities.AuditLog.create({
        action: 'dismiss_alert',
        entity_type: 'PilotageAlert',
        entity_id: alert_key,
        details: `Alerte masquée : ${alert_title || alert_key}`,
        performed_by_id: user.id,
        performed_by_name: userName,
        performed_by_role: user.role || (user.roles || []).join(','),
      });

      return Response.json({ success: true, dismissal });
    }

    // === RESTAURER UNE ALERTE ===
    if (operation === 'restore_alert') {
      const { alert_key } = params;
      if (!alert_key) return Response.json({ error: 'alert_key requis' }, { status: 400 });

      const existing = await base44.asServiceRole.entities.PilotageAlertDismissal.filter({ alert_key });
      if (existing && existing.length > 0) {
        await base44.asServiceRole.entities.PilotageAlertDismissal.delete(existing[0].id);
      }

      await base44.asServiceRole.entities.AuditLog.create({
        action: 'restore_alert',
        entity_type: 'PilotageAlert',
        entity_id: alert_key,
        details: `Alerte restaurée : ${alert_key}`,
        performed_by_id: user.id,
        performed_by_name: userName,
        performed_by_role: user.role || (user.roles || []).join(','),
      });

      return Response.json({ success: true });
    }

    return Response.json({ error: 'Opération non reconnue' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}