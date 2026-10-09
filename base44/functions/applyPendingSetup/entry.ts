import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

/**
 * applyPendingSetup — Applique les données du profil en attente à l'utilisateur courant.
 *
 * Quand un admin invite une personne, les données du profil (nom, identifiant EJP,
 * badges, appartenances départementales, assignation FIJ) sont stockées dans
 * PendingUserSetup. L'utilisateur n'existe pas encore dans la base — il est créé
 * quand la personne accepte l'invitation.
 *
 * Cette fonction est appelée automatiquement à la première connexion de l'utilisateur.
 * Elle recherche les données en attente par email, les applique au compte, puis
 * marque l'enregistrement comme traité.
 */
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // 1. Rechercher les données en attente pour cet email
    const pendingRecords = await base44.asServiceRole.entities.PendingUserSetup.filter({
      email: user.email,
      applied: false,
    });

    if (!pendingRecords || pendingRecords.length === 0) {
      return Response.json({ success: true, applied: false, message: 'Aucune configuration en attente' });
    }

    const pending = pendingRecords[0];
    const updates: any = {};

    // 2. Préparer les mises à jour du profil utilisateur
    if (pending.first_name) updates.first_name = pending.first_name;
    if (pending.last_name) updates.last_name = pending.last_name;
    if (pending.phone) updates.phone = pending.phone;
    if (pending.internal_identifier) updates.internal_identifier = pending.internal_identifier;
    if (pending.badges && pending.badges.length > 0) updates.badges = pending.badges;
    updates.account_status = 'pending';
    updates.first_login = true;
    updates.roles = ['serviteur'];
    updates.role = 'serviteur';

    // 3. Appliquer les mises à jour du profil
    await base44.asServiceRole.entities.User.update(user.id, updates);

    // 4. Créer les appartenances départementales
    if (pending.department_memberships && Array.isArray(pending.department_memberships)) {
      for (const dm of pending.department_memberships) {
        if (!dm.department_id) continue;
        // Vérifier qu'une appartenance active n'existe pas déjà
        const existing = await base44.asServiceRole.entities.DepartmentMember.filter({
          user_id: user.id,
          department_id: dm.department_id,
        });
        const activeExisting = (existing || []).find(m => m.status === 'active' || m.is_active !== false);
        if (activeExisting) continue;

        await base44.asServiceRole.entities.DepartmentMember.create({
          user_id: user.id,
          department_id: dm.department_id,
          full_name: `${pending.first_name || ''} ${pending.last_name || ''}`.trim(),
          role_in_dept: dm.role_in_dept || 'serviteur',
          status: 'active',
          joined_at: new Date().toISOString().split('T')[0],
          is_active: true,
        });
      }
    }

    // 5. Appliquer l'assignation FIJ si présente
    if (pending.fij_assignment && pending.fij_assignment.fij_id) {
      const fij = await base44.asServiceRole.entities.FIJ.get(pending.fij_assignment.fij_id);
      if (fij) {
        const fullName = `${pending.first_name || ''} ${pending.last_name || ''}`.trim() || user.email;
        const fijUpdate: any = {};
        if (pending.fij_assignment.role === 'pilot') {
          fijUpdate.pilot_user_id = user.id;
          fijUpdate.pilot_name = fullName;
          fijUpdate.pilot_email = user.email;
        } else if (pending.fij_assignment.role === 'copilot') {
          fijUpdate.copilot_user_id = user.id;
          fijUpdate.copilot_name = fullName;
          fijUpdate.copilot_email = user.email;
        }
        if (Object.keys(fijUpdate).length > 0) {
          await base44.asServiceRole.entities.FIJ.update(pending.fij_assignment.fij_id, fijUpdate);
        }
      }
    }

    // 6. Marquer l'enregistrement comme appliqué
    await base44.asServiceRole.entities.PendingUserSetup.update(pending.id, {
      applied: true,
      applied_at: new Date().toISOString().split('T')[0],
    });

    // 7. Journalisation
    await base44.asServiceRole.entities.AuditLog.create({
      action: 'pending_setup_applied',
      entity_type: 'User',
      entity_id: user.id,
      details: `Profil configuré automatiquement — identifiant: ${pending.internal_identifier || 'N/A'}`,
      performed_by_id: user.id,
      performed_by_name: user.full_name || user.email,
      performed_by_role: 'system',
    });

    return Response.json({
      success: true,
      applied: true,
      internal_identifier: pending.internal_identifier,
      message: 'Profil configuré avec succès',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}