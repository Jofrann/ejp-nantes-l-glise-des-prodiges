import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import {
  generateUniqueIdentifier,
  isAdminUser,
} from '../../shared/identityUtils.ts';

/**
 * adminManageUser — Fonction backend d'administration des utilisateurs.
 *
 * Actions supportées :
 * - create : invite un utilisateur + configure son profil + crée les appartenances
 * - update : met à jour le profil, badges, appartenances
 * - suspend : suspend le compte
 * - activate : active le compte
 * - archive : archive le compte (conserve l'historique)
 * - migrate : génère l'internal_identifier pour les utilisateurs existants sans un
 *
 * Toutes les actions nécessitent un compte admin.
 */
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const admin = await base44.auth.me();
    if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isAdminUser(admin)) return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'create':
        return await handleCreate(base44, admin, body);
      case 'update':
        return await handleUpdate(base44, admin, body);
      case 'suspend':
        return await handleStatusChange(base44, admin, body, 'suspended');
      case 'activate':
        return await handleStatusChange(base44, admin, body, 'active');
      case 'archive':
        return await handleStatusChange(base44, admin, body, 'archived');
      case 'migrate':
        return await handleMigrate(base44, admin);
      case 'update_badges':
        return await handleUpdateBadges(base44, admin, body);
      case 'add_membership':
        return await handleAddMembership(base44, admin, body);
      case 'remove_membership':
        return await handleRemoveMembership(base44, admin, body);
      case 'change_role':
        return await handleChangeRole(base44, admin, body);
      case 'assign_fij_pilot':
        return await handleAssignFijPilot(base44, admin, body);
      default:
        return Response.json({ error: 'Action non supportée' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function handleCreate(base44: any, admin: any, body: any): Promise<Response> {
  const { first_name, last_name, email, phone, badges, department_memberships } = body;

  if (!first_name || !last_name || !email) {
    return Response.json({ error: 'Prénom, nom et email sont requis' }, { status: 400 });
  }

  // 1. Vérifier que l'utilisateur n'existe pas déjà
  const existing = await base44.asServiceRole.entities.User.filter({ email });
  if (existing && existing.length > 0) {
    return Response.json({ error: 'Un utilisateur avec cet email existe déjà' }, { status: 409 });
  }

  // 2. Inviter l'utilisateur via le système Base44
  try {
    await base44.users.inviteUser(email, 'user');
  } catch (inviteErr) {
    return Response.json({ error: `Échec de l'invitation: ${inviteErr.message}` }, { status: 500 });
  }

  // 3. Récupérer l'utilisateur créé
  const users = await base44.asServiceRole.entities.User.filter({ email });
  const user = users && users[0];
  if (!user) {
    return Response.json({ error: 'Utilisateur non trouvé après invitation' }, { status: 500 });
  }

  // 4. Générer l'identifiant interne
  const internal_identifier = await generateUniqueIdentifier(base44, first_name, last_name);

  // 5. Mettre à jour le profil
  await base44.asServiceRole.entities.User.update(user.id, {
    first_name,
    last_name,
    phone: phone || null,
    internal_identifier,
    badges: badges || [],
    account_status: 'pending',
    first_login: true,
    roles: ['serviteur'],
    role: 'serviteur',
  });

  // 6. Créer les appartenances départementales
  if (department_memberships && Array.isArray(department_memberships)) {
    for (const dm of department_memberships) {
      await base44.asServiceRole.entities.DepartmentMember.create({
        user_id: user.id,
        department_id: dm.department_id,
        full_name: `${first_name} ${last_name}`,
        role_in_dept: dm.role_in_dept || 'serviteur',
        status: 'active',
        joined_at: new Date().toISOString().split('T')[0],
        is_active: true,
      });
    }
  }

  // 7. Journalisation
  await base44.asServiceRole.entities.AuditLog.create({
    action: 'user_create',
    entity_type: 'User',
    entity_id: user.id,
    details: `Création du compte ${internal_identifier} (${email}) — badges: ${(badges || []).join(', ') || 'aucun'}`,
    performed_by_id: admin.id,
    performed_by_name: admin.full_name || admin.email,
    performed_by_role: admin.role || (admin.roles || []).join(','),
  });

  return Response.json({
    success: true,
    user_id: user.id,
    internal_identifier,
    message: `Utilisateur ${internal_identifier} créé. Un email d'invitation a été envoyé à ${email}.`,
  });
}

async function handleUpdate(base44: any, admin: any, body: any): Promise<Response> {
  const { user_id, first_name, last_name, phone, badges, account_status, department_memberships } = body;

  if (!user_id) return Response.json({ error: 'user_id requis' }, { status: 400 });

  const user = await base44.asServiceRole.entities.User.get(user_id);
  if (!user) return Response.json({ error: 'Utilisateur introuvable' }, { status: 404 });

  const updates: any = {};
  if (first_name !== undefined) updates.first_name = first_name;
  if (last_name !== undefined) updates.last_name = last_name;
  if (phone !== undefined) updates.phone = phone;
  if (badges !== undefined) updates.badges = badges;
  if (account_status !== undefined) updates.account_status = account_status;

  // Régénérer l'identifiant si le nom change
  if (first_name || last_name) {
    const newFirst = first_name || user.first_name;
    const newLast = last_name || user.last_name;
    const newIdentifier = await generateUniqueIdentifier(base44, newFirst, newLast, user_id);
    if (newIdentifier !== user.internal_identifier) {
      updates.internal_identifier = newIdentifier;
    }
  }

  await base44.asServiceRole.entities.User.update(user_id, updates);

  // Gérer les appartenances départementales
  if (department_memberships && Array.isArray(department_memberships)) {
    // Récupérer les appartenances existantes
    const existingMemberships = await base44.asServiceRole.entities.DepartmentMember.filter({
      user_id,
    });

    // Archiver les appartenances qui ne sont plus dans la nouvelle liste
    const newDeptIds = department_memberships.map((dm: any) => dm.department_id);
    for (const existing of existingMemberships) {
      if (!newDeptIds.includes(existing.department_id) && existing.status === 'active') {
        await base44.asServiceRole.entities.DepartmentMember.update(existing.id, {
          status: 'archived',
          is_active: false,
          ended_at: new Date().toISOString().split('T')[0],
        });
      }
    }

    // Créer ou mettre à jour les nouvelles appartenances
    for (const dm of department_memberships) {
      const existing = existingMemberships.find((m: any) => m.department_id === dm.department_id);
      if (existing) {
        await base44.asServiceRole.entities.DepartmentMember.update(existing.id, {
          role_in_dept: dm.role_in_dept || existing.role_in_dept,
          status: 'active',
          is_active: true,
          ended_at: null,
        });
      } else {
        await base44.asServiceRole.entities.DepartmentMember.create({
          user_id,
          department_id: dm.department_id,
          full_name: `${updates.first_name || user.first_name} ${updates.last_name || user.last_name}`,
          role_in_dept: dm.role_in_dept || 'serviteur',
          status: 'active',
          joined_at: new Date().toISOString().split('T')[0],
          is_active: true,
        });
      }
    }
  }

  await base44.asServiceRole.entities.AuditLog.create({
    action: 'user_update',
    entity_type: 'User',
    entity_id: user_id,
    details: `Mise à jour du profil — champs: ${Object.keys(updates).join(', ')}`,
    performed_by_id: admin.id,
    performed_by_name: admin.full_name || admin.email,
    performed_by_role: admin.role || (admin.roles || []).join(','),
  });

  return Response.json({ success: true });
}

async function handleStatusChange(base44: any, admin: any, body: any, newStatus: string): Promise<Response> {
  const { user_id } = body;
  if (!user_id) return Response.json({ error: 'user_id requis' }, { status: 400 });

  const user = await base44.asServiceRole.entities.User.get(user_id);
  if (!user) return Response.json({ error: 'Utilisateur introuvable' }, { status: 404 });

  await base44.asServiceRole.entities.User.update(user_id, { account_status: newStatus });

  await base44.asServiceRole.entities.AuditLog.create({
    action: `user_${newStatus}`,
    entity_type: 'User',
    entity_id: user_id,
    details: `Statut du compte passé à '${newStatus}'`,
    performed_by_id: admin.id,
    performed_by_name: admin.full_name || admin.email,
    performed_by_role: admin.role || (admin.roles || []).join(','),
  });

  return Response.json({ success: true, account_status: newStatus });
}

async function handleMigrate(base44: any, admin: any): Promise<Response> {
  // Liste tous les utilisateurs
  const users = await base44.asServiceRole.entities.User.list();
  let migrated = 0;
  let skipped = 0;

  for (const user of users) {
    const updates: any = {};

    // Génère l'internal_identifier si manquant
    if (!user.internal_identifier && user.first_name && user.last_name) {
      updates.internal_identifier = await generateUniqueIdentifier(base44, user.first_name, user.last_name, user.id);
    }

    // Initialise les badges si manquant
    if (!Array.isArray(user.badges) || user.badges.length === 0) {
      const { legacyRolesToBadges } = await import('../../shared/identityUtils.ts');
      updates.badges = legacyRolesToBadges(user);
    }

    // Initialise first_login si manquant
    if (user.first_login === undefined || user.first_login === null) {
      updates.first_login = true;
    }

    if (Object.keys(updates).length > 0) {
      await base44.asServiceRole.entities.User.update(user.id, updates);
      migrated++;
    } else {
      skipped++;
    }
  }

  await base44.asServiceRole.entities.AuditLog.create({
    action: 'user_migration',
    entity_type: 'User',
    entity_id: null,
    details: `Migration de ${migrated} utilisateur(s), ${skipped} ignoré(s)`,
    performed_by_id: admin.id,
    performed_by_name: admin.full_name || admin.email,
    performed_by_role: admin.role || (admin.roles || []).join(','),
  });

  return Response.json({ success: true, migrated, skipped, total: users.length });
}

// === Lot 2 — Opérations granulaires Annuaire ===

async function handleUpdateBadges(base44: any, admin: any, body: any): Promise<Response> {
  const { user_id, badges } = body;
  if (!user_id) return Response.json({ error: 'user_id requis' }, { status: 400 });
  if (!Array.isArray(badges)) return Response.json({ error: 'badges doit être un tableau' }, { status: 400 });

  const user = await base44.asServiceRole.entities.User.get(user_id);
  if (!user) return Response.json({ error: 'Utilisateur introuvable' }, { status: 404 });

  const oldBadges = Array.isArray(user.badges) ? user.badges : [];
  await base44.asServiceRole.entities.User.update(user_id, { badges });

  await base44.asServiceRole.entities.AuditLog.create({
    action: 'badges_update',
    entity_type: 'User',
    entity_id: user_id,
    details: `Badges: ${oldBadges.join(', ') || 'aucun'} → ${badges.join(', ') || 'aucun'}`,
    performed_by_id: admin.id,
    performed_by_name: admin.full_name || admin.email,
    performed_by_role: admin.role || (admin.roles || []).join(','),
  });

  return Response.json({ success: true, badges });
}

async function handleAddMembership(base44: any, admin: any, body: any): Promise<Response> {
  const { user_id, department_id, role_in_dept, joined_at } = body;
  if (!user_id || !department_id) return Response.json({ error: 'user_id et department_id requis' }, { status: 400 });

  const validRoles = ['serviteur', 'responsable', 'adjoint', 'coordinateur', 'referent', 'pilote', 'membre'];
  const role = role_in_dept || 'serviteur';
  if (!validRoles.includes(role)) return Response.json({ error: 'Rôle invalide' }, { status: 400 });

  // Vérifier qu'une membership active identique n'existe pas déjà
  const existing = await base44.asServiceRole.entities.DepartmentMember.filter({
    user_id,
    department_id,
  });
  const activeExisting = (existing || []).find(m => m.status === 'active' || m.is_active !== false);
  if (activeExisting) {
    return Response.json({ error: 'Cette personne fait déjà partie de ce département', existing: activeExisting }, { status: 409 });
  }

  const user = await base44.asServiceRole.entities.User.get(user_id);
  if (!user) return Response.json({ error: 'Utilisateur introuvable' }, { status: 404 });

  const dept = await base44.asServiceRole.entities.Department.get(department_id);
  if (!dept) return Response.json({ error: 'Département introuvable' }, { status: 404 });

  const membership = await base44.asServiceRole.entities.DepartmentMember.create({
    user_id,
    department_id,
    full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.full_name || user.email,
    role_in_dept: role,
    status: 'active',
    joined_at: joined_at || new Date().toISOString().split('T')[0],
    is_active: true,
  });

  await base44.asServiceRole.entities.AuditLog.create({
    action: 'membership_add',
    entity_type: 'DepartmentMember',
    entity_id: membership.id,
    details: `Ajout à ${dept.name} comme ${role}`,
    performed_by_id: admin.id,
    performed_by_name: admin.full_name || admin.email,
    performed_by_role: admin.role || (admin.roles || []).join(','),
  });

  return Response.json({ success: true, membership });
}

async function handleRemoveMembership(base44: any, admin: any, body: any): Promise<Response> {
  const { membership_id } = body;
  if (!membership_id) return Response.json({ error: 'membership_id requis' }, { status: 400 });

  const membership = await base44.asServiceRole.entities.DepartmentMember.get(membership_id);
  if (!membership) return Response.json({ error: 'Appartenance introuvable' }, { status: 404 });

  const dept = await base44.asServiceRole.entities.Department.get(membership.department_id);

  await base44.asServiceRole.entities.DepartmentMember.update(membership_id, {
    status: 'archived',
    is_active: false,
    ended_at: new Date().toISOString().split('T')[0],
  });

  await base44.asServiceRole.entities.AuditLog.create({
    action: 'membership_remove',
    entity_type: 'DepartmentMember',
    entity_id: membership_id,
    details: `Retrait de ${dept?.name || 'département'} (rôle: ${membership.role_in_dept})`,
    performed_by_id: admin.id,
    performed_by_name: admin.full_name || admin.email,
    performed_by_role: admin.role || (admin.roles || []).join(','),
  });

  return Response.json({ success: true });
}

async function handleChangeRole(base44: any, admin: any, body: any): Promise<Response> {
  const { membership_id, new_role } = body;
  if (!membership_id) return Response.json({ error: 'membership_id requis' }, { status: 400 });

  const validRoles = ['serviteur', 'responsable', 'adjoint', 'coordinateur', 'referent', 'pilote', 'membre'];
  if (!validRoles.includes(new_role)) return Response.json({ error: 'Rôle invalide' }, { status: 400 });

  const membership = await base44.asServiceRole.entities.DepartmentMember.get(membership_id);
  if (!membership) return Response.json({ error: 'Appartenance introuvable' }, { status: 404 });

  const dept = await base44.asServiceRole.entities.Department.get(membership.department_id);
  const oldRole = membership.role_in_dept;

  await base44.asServiceRole.entities.DepartmentMember.update(membership_id, {
    role_in_dept: new_role,
  });

  await base44.asServiceRole.entities.AuditLog.create({
    action: 'membership_role_change',
    entity_type: 'DepartmentMember',
    entity_id: membership_id,
    details: `${dept?.name || 'Département'}: ${oldRole} → ${new_role}`,
    performed_by_id: admin.id,
    performed_by_name: admin.full_name || admin.email,
    performed_by_role: admin.role || (admin.roles || []).join(','),
  });

  return Response.json({ success: true, old_role: oldRole, new_role });
}

async function handleAssignFijPilot(base44: any, admin: any, body: any): Promise<Response> {
  const { user_id, fij_id, role } = body;
  if (!user_id || !fij_id) return Response.json({ error: 'user_id et fij_id requis' }, { status: 400 });

  const fij = await base44.asServiceRole.entities.FIJ.get(fij_id);
  if (!fij) return Response.json({ error: 'FIJ introuvable' }, { status: 404 });

  const user = await base44.asServiceRole.entities.User.get(user_id);
  if (!user) return Response.json({ error: 'Utilisateur introuvable' }, { status: 404 });

  const update: any = {};
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;

  if (role === 'pilot') {
    update.pilot_user_id = user_id;
    update.pilot_name = fullName;
    update.pilot_email = user.email;
  } else if (role === 'copilot') {
    update.copilot_user_id = user_id;
    update.copilot_name = fullName;
    update.copilot_email = user.email;
  } else {
    return Response.json({ error: 'Rôle FIJ invalide (pilot ou copilot)' }, { status: 400 });
  }

  await base44.asServiceRole.entities.FIJ.update(fij_id, update);

  await base44.asServiceRole.entities.AuditLog.create({
    action: 'fij_pilot_assign',
    entity_type: 'FIJ',
    entity_id: fij_id,
    details: `${role === 'pilot' ? 'Pilote' : 'Copilote'} ${fullName} → ${fij.name}`,
    performed_by_id: admin.id,
    performed_by_name: admin.full_name || admin.email,
    performed_by_role: admin.role || (admin.roles || []).join(','),
  });

  return Response.json({ success: true, fij_id, role });
}