import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { isAdminUser } from '../../shared/identityUtils.ts';

/**
 * getDepartmentData — Fonction backend pour l'accès aux données d'un département.
 *
 * Vérifie l'appartenance de l'utilisateur au département au niveau backend,
 * puis renvoie les données autorisées (membres, messages, etc.).
 *
 * La sécurité ne repose PAS sur l'interface — cette fonction est le gardien backend.
 *
 * Paramètres :
 * - department_slug : slug du département à charger
 *
 * Retour :
 * - access_denied si l'utilisateur n'appartient pas au département
 * - department + members + messages si autorisé
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

    // 1. Trouver le département par slug
    const depts = await base44.asServiceRole.entities.Department.filter({ slug: department_slug });
    const department = depts && depts[0];
    if (!department) {
      return Response.json({ error: 'Département introuvable' }, { status: 404 });
    }

    // 2. Vérifier l'accès
    const admin = isAdminUser(user);
    let membership = null;

    if (!admin) {
      const memberships = await base44.asServiceRole.entities.DepartmentMember.filter({
        user_id: user.id,
        department_id: department.id,
      });
      membership = (memberships || []).find((m: any) => m.status === 'active' || m.is_active === true);

      if (!membership) {
        // Accès refusé — ne renvoyer AUCUNE donnée du département
        await base44.asServiceRole.entities.AuditLog.create({
          action: 'access_denied',
          entity_type: 'Department',
          entity_id: department.id,
          details: `Tentative d'accès refusée au département '${department.name}' (${department_slug})`,
          performed_by_id: user.id,
          performed_by_name: user.full_name || user.email,
          performed_by_role: user.role || (user.roles || []).join(','),
        });
        return Response.json({
          access_denied: true,
          message: 'Tu ne fais pas partie de ce département.',
        }, { status: 403 });
      }
    }

    // 3. Déterminer le rôle dans le département
    const roleInDept = admin ? 'admin' : (membership?.role_in_dept || 'membre');
    const canManage = admin || ['responsable', 'referent', 'coordinateur'].includes(roleInDept);

    // 4. Charger les données autorisées
    const members = await base44.asServiceRole.entities.DepartmentMember.filter({
      department_id: department.id,
      is_active: true,
    });

    const messages = await base44.asServiceRole.entities.DeptMessage.filter({
      department_id: department.id,
    }, '-created_date', 50);

    return Response.json({
      access_granted: true,
      department,
      role_in_dept: roleInDept,
      can_manage: canManage,
      members: members || [],
      messages: messages || [],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}