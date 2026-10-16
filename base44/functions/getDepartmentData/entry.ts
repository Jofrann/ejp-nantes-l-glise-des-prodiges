import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { isAdmin } from '../../../src/lib/permissions.js';
import { findOfficialStructure } from '../../../src/lib/officialStructures.js';
import { canViewAllEJPData, departmentManager } from '../../../src/lib/ejpAccess.js';

/**
 * getDepartmentData — Fonction backend pour l'accès aux données d'un ministère.
 *
 * Vérifie l'appartenance de l'utilisateur au ministère au niveau backend,
 * puis renvoie les données autorisées (membres, messages, etc.).
 *
 * La sécurité ne repose PAS sur l'interface — cette fonction est le gardien backend.
 *
 * Paramètres :
 * - department_slug : slug du ministère à charger
 *
 * Retour :
 * - access_denied si l'utilisateur n'appartient pas au ministère
 * - department + members + messages si autorisé
 */
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.account_status !== 'active') return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { department_slug } = body;

    if (!department_slug) {
      return Response.json({ error: 'department_slug requis' }, { status: 400 });
    }

    // 1. Trouver le ministère par slug
    const depts = await base44.asServiceRole.entities.Department.filter({ slug: department_slug });
    const canonical = findOfficialStructure({ slug: department_slug });
    const department = depts?.[0]
      || (await base44.asServiceRole.entities.Department.filter({ id: department_slug }))?.[0]
      || (canonical ? (await base44.asServiceRole.entities.Department.filter({ slug: canonical.slug }))?.[0] : null);
    if (!department) {
      return Response.json({ not_found: true, error: 'Ministère introuvable' });
    }

    // 2. Vérifier l'accès
    const admin = isAdmin(user);
    const globalReader = canViewAllEJPData(user);
    if (department.is_active === false && !admin) return Response.json({ access_denied: true, message: 'Ce ministère est archivé.' });
    let membership = null;

    if (!admin && !globalReader) {
      const memberships = await base44.asServiceRole.entities.DepartmentMember.filter({
        user_id: user.id,
        department_id: department.id,
      });
      membership = (memberships || []).find((m: any) => m.status === 'active' || (!m.status && m.is_active !== false));

      if (!membership) {
        // Accès refusé — ne renvoyer AUCUNE donnée du ministère
        await base44.asServiceRole.entities.AuditLog.create({
          action: 'access_denied',
          entity_type: 'Department',
          entity_id: department.id,
          details: `Tentative d'accès refusée au ministère '${department.name}' (${department_slug})`,
          performed_by_id: user.id,
          performed_by_name: user.full_name || user.email,
          performed_by_role: user.role || (user.roles || []).join(','),
        });
        return Response.json({
          access_denied: true,
          message: 'Tu ne fais pas partie de ce ministère.',
        });
      }
    }

    // 3. Déterminer le rôle dans le ministère
    const roleInDept = admin ? 'admin' : (membership?.role_in_dept || 'membre');
    // can_manage = admin uniquement (gestion des membres, paramètres)
    // Les responsables ne reçoivent PAS les droits admin dans ce lot.
    const canManage = admin;
    // is_responsable = admin ou rôle de direction dans le ministère (peut poster des messages)
    const isResponsable = admin || ['responsable', 'referent', 'coordinateur'].includes(roleInDept);

    // 4. Charger les membres actifs
    // Filtrer par status='active' OU is_active=true (legacy), exclure archived/suspended/inactive
    const allMembers = await base44.asServiceRole.entities.DepartmentMember.filter({
      department_id: department.id,
    });
    const members = (allMembers || []).filter((m: any) =>
      m.status === 'active' || (!m.status && m.is_active === true)
    );

    const messages = await base44.asServiceRole.entities.DeptMessage.filter({
      department_id: department.id,
    }, '-created_date', 50);

    // 5. Enrichir les membres avec internal_identifier (depuis User)
    // DepartmentMember ne stocke que full_name ; on récupère internal_identifier
    // depuis User pour l'affichage équipe sans exposer le vrai email.
    const memberUserIds = (members || []).map((m: any) => m.user_id).filter(Boolean);
    let userMap: Record<string, any> = {};
    if (memberUserIds.length > 0) {
      const users = await base44.asServiceRole.entities.User.filter({
        id: { $in: memberUserIds },
      });
      (users || []).forEach((u: any) => {
        userMap[u.id] = u;
      });
    }
    const enrichedMembers = (members || []).map((m: any) => ({
      ...m,
      internal_identifier: m.user_id ? (userMap[m.user_id]?.internal_identifier || '') : '',
    }));

    return Response.json({
      access_granted: true,
      department,
      role_in_dept: roleInDept,
      can_manage: canManage,
      can_analyze: canViewAllEJPData(user) || departmentManager(user, department.id, membership ? [membership] : (await base44.asServiceRole.entities.DepartmentMember.filter({ user_id: user.id, department_id: department.id }))),
      is_responsable: isResponsable,
      members: enrichedMembers,
      messages: messages || [],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
