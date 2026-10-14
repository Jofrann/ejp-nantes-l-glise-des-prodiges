import { db, entities } from './store.mjs';

// One-time bootstrap supplied by the operator, never a bundled default credential.
export async function initializeAdmin({ identifier, passwordHash } = {}) {
  if (!identifier || !passwordHash) return false;
  if (!/^[^\s@]+@prodiges?$/.test(identifier) || !/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(passwordHash)) throw new Error('Invalid initial administrator configuration');
  if (db.prepare('SELECT id FROM credentials LIMIT 1').get()) return false;
  db.exec('BEGIN IMMEDIATE');
  try {
    const user = await entities.User.create({ email: 'admin@ejp.local', internal_identifier: identifier, full_name: 'Administration EJP', first_name: 'Admin', role: 'admin', roles: ['admin'], badges: ['ADMIN'], account_status: 'active', first_login: false });
    db.prepare('INSERT INTO credentials VALUES(?,?)').run(user.id, passwordHash);
    db.exec('COMMIT');
    return true;
  } catch (error) { db.exec('ROLLBACK'); throw error; }
}
