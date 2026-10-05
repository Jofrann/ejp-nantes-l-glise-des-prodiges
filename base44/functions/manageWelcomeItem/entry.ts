import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { checkWelcomeAccess, canEditVisitor } from '../../shared/welcomePermissions.ts';

/**
 * manageWelcomeItem — Fonction backend pour les écritures Accueil.
 *
 * Opérations responsable uniquement :
 *   save_plan, delete_plan, save_assignment, delete_assignment, save_profile,
 *   save_visitor, update_visitor_status, delete_visitor
 *
 * Opérations utilisateur (soi-même ou responsable) :
 *   confirm_assignment, decline_assignment
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

    const access = await checkWelcomeAccess(base44, department_slug);
    if (access.not_found) return Response.json({ not_found: true });
    if (access.access_denied) return Response.json({ access_denied: true }, { status: 403 });

    const deptId = access.department.id;
    const isResponsable = access.isResponsable;
    const isAdmin = access.isAdmin;
    const userId = user.id;

    const RESPONSABLE_OPS = [
      'save_plan', 'delete_plan',
      'save_assignment', 'delete_assignment',
      'save_profile',
      'save_visitor', 'update_visitor_status', 'delete_visitor',
    ];

    if (RESPONSABLE_OPS.includes(operation) && !isResponsable) {
      return Response.json({ error: 'Seul un responsable Accueil peut effectuer cette action.' }, { status: 403 });
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
          status: item.status || 'draft',
          instructions: item.instructions || '',
          created_by: userId,
        };
        if (item_id) {
          await base44.asServiceRole.entities.WelcomeServicePlan.update(item_id, data);
          await logAudit(base44, user, 'update', 'WelcomeServicePlan', item_id, `Plan d'accueil modifié: ${data.title}`);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.WelcomeServicePlan.create(data);
          await logAudit(base44, user, 'create', 'WelcomeServicePlan', created.id, `Plan d'accueil créé: ${data.title}`);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'delete_plan': {
        await base44.asServiceRole.entities.WelcomeAssignment.deleteMany({ service_plan_id: item_id });
        await base44.asServiceRole.entities.WelcomeServicePlan.delete(item_id);
        await logAudit(base44, user, 'delete', 'WelcomeServicePlan', item_id, 'Plan d\'accueil supprimé');
        return Response.json({ success: true });
      }

      // === ASSIGNMENTS ===
      case 'save_assignment': {
        const data = {
          service_plan_id: item.service_plan_id,
          department_id: deptId,
          user_id: item.user_id,
          full_name: item.full_name || '',
          position: item.position || 'accueil_entree',
          status: item.status || 'assigned',
          notes: item.notes || '',
        };
        if (item_id) {
          await base44.asServiceRole.entities.WelcomeAssignment.update(item_id, data);
          await logAudit(base44, user, 'welcome_assignment_changed', 'WelcomeAssignment', item_id, `Affectation modifiée: ${data.full_name}`);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.WelcomeAssignment.create(data);
          await logAudit(base44, user, 'welcome_assignment_changed', 'WelcomeAssignment', created.id, `Affectation: ${data.full_name}`);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'delete_assignment': {
        await base44.asServiceRole.entities.WelcomeAssignment.delete(item_id);
        await logAudit(base44, user, 'delete', 'WelcomeAssignment', item_id, 'Affectation supprimée');
        return Response.json({ success: true });
      }
      case 'confirm_assignment': {
        const assignment = await base44.asServiceRole.entities.WelcomeAssignment.get(item_id);
        if (!assignment) return Response.json({ error: 'Affectation introuvable' }, { status: 404 });
        if (!isResponsable && assignment.user_id !== userId) {
          return Response.json({ error: 'Tu ne peux confirmer que ta propre affectation.' }, { status: 403 });
        }
        await base44.asServiceRole.entities.WelcomeAssignment.update(item_id, { status: 'confirmed' });
        return Response.json({ success: true });
      }
      case 'decline_assignment': {
        const assignment = await base44.asServiceRole.entities.WelcomeAssignment.get(item_id);
        if (!assignment) return Response.json({ error: 'Affectation introuvable' }, { status: 404 });
        if (!isResponsable && assignment.user_id !== userId) {
          return Response.json({ error: 'Tu ne peux décliner que ta propre affectation.' }, { status: 403 });
        }
        await base44.asServiceRole.entities.WelcomeAssignment.update(item_id, { status: 'declined' });
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
        const existing = await base44.asServiceRole.entities.WelcomeMemberProfile.filter({
          department_id: deptId, user_id: item.user_id,
        });
        if (existing && existing[0]) {
          await base44.asServiceRole.entities.WelcomeMemberProfile.update(existing[0].id, data);
          return Response.json({ success: true, id: existing[0].id });
        } else {
          const created = await base44.asServiceRole.entities.WelcomeMemberProfile.create(data);
          return Response.json({ success: true, id: created.id });
        }
      }

      // === VISITORS ===
      case 'save_visitor': {
        // Respecter le consentement : si pas de consentement, on crée la fiche
        // mais elle ne sera pas en suivi détaillé (le frontend le gère)
        const data = {
          department_id: deptId,
          first_name: item.first_name,
          last_name: item.last_name || '',
          phone: item.phone || '',
          contact_channel: item.contact_channel || '',
          first_visit_date: item.first_visit_date || '',
          source_event_id: item.source_event_id || null,
          consent_to_contact: item.consent_to_contact === true,
          status: item.status || 'new',
          assigned_to: item.assigned_to || null,
          assigned_to_name: item.assigned_to_name || '',
          notes: item.notes || '',
        };
        if (item_id) {
          await base44.asServiceRole.entities.VisitorContact.update(item_id, data);
          await logAudit(base44, user, 'visitor_status_changed', 'VisitorContact', item_id, `Fiche visiteur modifiée: ${data.first_name}`);
          return Response.json({ success: true, id: item_id });
        } else {
          const created = await base44.asServiceRole.entities.VisitorContact.create(data);
          await logAudit(base44, user, 'visitor_followup_created', 'VisitorContact', created.id, `Fiche visiteur créée: ${data.first_name}`);
          return Response.json({ success: true, id: created.id });
        }
      }
      case 'update_visitor_status': {
        await base44.asServiceRole.entities.VisitorContact.update(item_id, { status: item.status });
        await logAudit(base44, user, 'visitor_status_changed', 'VisitorContact', item_id, `Statut visiteur → ${item.status}`);
        return Response.json({ success: true });
      }
      case 'delete_visitor': {
        await base44.asServiceRole.entities.VisitorContact.delete(item_id);
        await logAudit(base44, user, 'delete', 'VisitorContact', item_id, 'Fiche visiteur supprimée');
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