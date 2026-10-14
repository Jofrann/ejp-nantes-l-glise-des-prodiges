import { randomBytes } from 'node:crypto';
import { db, entities } from './store.mjs';
import { generateUniqueIdentifier } from '../base44/shared/identityUtils.ts';

// Credentials are returned once to the administrator, never stored in clear text.
export async function provisionAccount(body, admin, hash, fail) {
  const temporary_password = randomBytes(18).toString('base64url');
  db.exec('BEGIN IMMEDIATE');
  try {
    let user;
    if (body.action === 'reset_access') {
      user = await entities.User.get(body.user_id);
      if (user.account_status !== 'active') fail(400, 'Réactive le compte avant de réinitialiser son accès');
      await entities.User.update(user.id, { first_login: true });
    } else {
      const first_name = String(body.first_name || '').trim();
      const last_name = String(body.last_name || '').trim();
      if (!first_name || !last_name) fail(400, 'Prénom et nom requis');
      const internal_identifier = await generateUniqueIdentifier({ asServiceRole: { entities } }, first_name, last_name);
      const domain = (await entities.ChurchConfig.list())[0]?.auth_email_domain || 'ejp.local';
      const email = internal_identifier.toLowerCase().replace(/@prodiges?$/, `@${domain}`);
      user = await entities.User.create({ first_name, last_name, full_name: `${first_name} ${last_name}`, email,
        internal_identifier, contact_email: body.email || null, phone: body.phone || null, badges: body.badges || [],
        role: 'serviteur', roles: ['serviteur'], account_status: 'active', first_login: true });
      for (const dm of body.department_memberships || []) {
        await entities.Department.get(dm.department_id);
        await entities.DepartmentMember.create({ user_id: user.id, department_id: dm.department_id,
          full_name: user.full_name, role_in_dept: dm.role_in_dept || 'serviteur',
          status: 'active', is_active: true, joined_at: new Date().toISOString().slice(0, 10) });
      }
      if (body.fij_assignment?.fij_id) {
        const { fij_id, role } = body.fij_assignment;
        await entities.FIJ.get(fij_id);
        if (!['pilot', 'copilot'].includes(role)) fail(400, 'Responsabilité FIJ invalide');
        await entities.FIJ.update(fij_id, { [`${role}_user_id`]: user.id, [`${role}_name`]: user.full_name, [`${role}_email`]: user.email });
      }
    }
    db.prepare('INSERT INTO credentials VALUES(?,?) ON CONFLICT(id) DO UPDATE SET hash=excluded.hash').run(user.id, hash(temporary_password));
    db.prepare('DELETE FROM sessions WHERE user_id=?').run(user.id);
    await entities.AuditLog.create({ action: body.action === 'create' ? 'user_create' : 'user_reset_access', entity_type: 'User',
      entity_id: user.id, performed_by_id: admin.id, performed_by_name: admin.full_name,
      details: 'Accès provisoire créé ; changement de mot de passe obligatoire' });
    db.exec('COMMIT');
    return { success: true, user_id: user.id, internal_identifier: user.internal_identifier || user.email, temporary_password };
  } catch (error) { db.exec('ROLLBACK'); throw error; }
}
