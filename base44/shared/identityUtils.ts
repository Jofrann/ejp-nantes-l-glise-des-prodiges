// base44/shared/identityUtils.ts
// Utilitaires partagés pour la génération d'identifiants internes @prodiges

/**
 * Normalise un nom pour un identifiant : minuscules, sans accents, sans espaces.
 */
export function normalizeName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // supprime les accents
    .replace(/[^a-z0-9]/g, '') // supprime tout sauf alphanumériques
    .trim();
}

/** Nouveaux comptes : prenom@prodiges. Les anciens identifiants restent acceptés. */
export function generateBaseIdentifier(first_name: string, _last_name: string): string {
  const f = normalizeName(first_name);
  return f ? `${f}@prodiges` : null;
}

export async function generateUniqueIdentifier(base44: any, first_name: string, last_name: string, excludeUserId?: string): Promise<string> {
  const base = generateBaseIdentifier(first_name, last_name);
  if (!base) return null;
  const users = await base44.asServiceRole.entities.User.list(null, 100000);
  const canonical = (value: string) => (value || '').toLowerCase().replace(/@prodiges$/, '@prodige');
  const taken = (candidate: string) => users.some((user: any) => user.id !== excludeUserId && canonical(user.internal_identifier) === canonical(candidate));
  if (!taken(base)) return base;
  const prefix = base.replace(/@prodiges?$/, '');
  const last = normalizeName(last_name);
  if (last && !taken(`${prefix}.${last}@prodiges`)) return `${prefix}.${last}@prodiges`;
  let counter = 2;
  while (taken(`${prefix}${counter}@prodiges`)) counter++;
  return `${prefix}${counter}@prodiges`;
}

/**
 * Vérifie qu'un utilisateur est admin (rôle système ou badge).
 */
export function isAdminUser(user: any): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (Array.isArray(user.roles) && user.roles.includes('admin')) return true;
  if (Array.isArray(user.badges) && user.badges.includes('ADMIN')) return true;
  return false;
}

/**
 * Mappe les anciens rôles legacy vers de nouveaux badges.
 * Utilisé pour la migration des utilisateurs existants.
 */
export function legacyRolesToBadges(user: any): string[] {
  const badges: string[] = [];
  const roles = Array.isArray(user.roles) && user.roles.length > 0
    ? user.roles
    : user.role ? [user.role] : ['serviteur'];

  if (roles.includes('admin')) badges.push('ADMIN');
  if (roles.includes('bergere')) badges.push('BERGERE');
  if (roles.includes('bureau')) badges.push('BUREAU');
  if (roles.includes('referent')) badges.push('RESPONSABLE');

  // STAR est attribué à tous les serviteurs actifs
  if (roles.includes('serviteur') || roles.includes('referent')) {
    badges.push('STAR');
  }

  return [...new Set(badges)];
}
