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

/**
 * Génère l'identifiant de base au format prenom@prodiges
 * @prodiges n'est PAS une adresse email — c'est un identifiant interne EJP.
 */
export function generateBaseIdentifier(first_name: string, last_name: string): string {
  const f = normalizeName(first_name);
  if (!f) return null;
  return `${f}@prodiges`;
}

/**
 * Génère un identifiant interne unique.
 * Si prenom.nom@prodiges.com existe déjà, propose prenom.nom2@prodiges.com, etc.
 * @param base44 - client Base44 (avec asServiceRole)
 * @param first_name
 * @param last_name
 * @param excludeUserId - ID d'utilisateur à exclure (pour les updates)
 */
export async function generateUniqueIdentifier(
  base44: any,
  first_name: string,
  last_name: string,
  excludeUserId?: string
): Promise<string> {
  const base = generateBaseIdentifier(first_name, last_name);
  if (!base) return null;

  // Vérifie si l'identifiant de base existe déjà
  const existing = await base44.asServiceRole.entities.User.filter({
    internal_identifier: base,
  });

  const baseTaken = (existing || []).some((u: any) => u.id !== excludeUserId);
  if (!baseTaken) return base;

  // Cherche une variante disponible : d'abord prenom.nom@prodiges, puis prenom2@prodiges
  const f = normalizeName(first_name);
  const l = normalizeName(last_name);

  // Variante 1 : prenom.nom@prodiges
  if (l) {
    const candidate1 = `${f}.${l}@prodiges`;
    const exists1 = await base44.asServiceRole.entities.User.filter({
      internal_identifier: candidate1,
    });
    const taken1 = (exists1 || []).some((u: any) => u.id !== excludeUserId);
    if (!taken1) return candidate1;
  }

  // Variante 2+ : prenom2@prodiges, prenom3@prodiges...
  const basePrefix = base.replace('@prodiges', '');
  let counter = 2;
  while (counter < 100) {
    const candidate = `${basePrefix}${counter}@prodiges`;
    const exists = await base44.asServiceRole.entities.User.filter({
      internal_identifier: candidate,
    });
    const taken = (exists || []).some((u: any) => u.id !== excludeUserId);
    if (!taken) return candidate;
    counter++;
  }

  // Fallback improbable
  return `${basePrefix}${Date.now()}@prodiges`;
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