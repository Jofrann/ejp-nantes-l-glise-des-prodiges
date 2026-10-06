// base44/shared/pilotagePermissions.ts
// Permissions pour l'espace Pilotage global — couche transversale de direction.
//
// IMPORTANT :
// - Pilotage n'est PAS un département.
// - L'appartenance à un département ne donne PAS accès au Pilotage.
// - L'accès est explicite : Bergère, Bureau (leader autorisé), Admin, ou badge PILOTAGE.
// - Un responsable de département seul n'a PAS accès automatiquement.
// - Un membre Coordination seul n'a PAS accès automatiquement.
// - Un Pilote FIJ seul n'a PAS accès automatiquement.
// - Un membre du département Leaders seul n'a PAS accès automatiquement.

/**
 * Vérifie si un utilisateur a accès au Pilotage global.
 *
 * Accès accordé à :
 * - Rôle 'admin' ou badge 'ADMIN' (administration technique)
 * - Rôle 'bergere' ou badge 'BERGERE' (Bergère)
 * - Rôle 'bureau' ou badge 'BUREAU' (Leader autorisé)
 * - Badge 'PILOTAGE' (attribution explicite)
 *
 * Accès REFUSÉ sinon, quelle que soit l'appartenance départementale.
 */
export function canAccessPilotage(user: any): boolean {
  if (!user) return false;

  // Compte bloqué (suspended/archived) — refus même avec badge historique
  const accountStatus = user.account_status;
  if (accountStatus === 'suspended' || accountStatus === 'archived') return false;

  // Rôles
  const roles = Array.isArray(user.roles) && user.roles.length > 0
    ? user.roles
    : user.role ? [user.role] : [];

  if (roles.includes('admin')) return true;
  if (roles.includes('bergere')) return true;
  if (roles.includes('bureau')) return true;

  // Badges
  const badges = Array.isArray(user.badges) ? user.badges : [];
  if (badges.includes('ADMIN')) return true;
  if (badges.includes('BERGERE')) return true;
  if (badges.includes('BUREAU')) return true;
  if (badges.includes('PILOTAGE')) return true;

  return false;
}

/**
 * Vérifie si l'utilisateur peut gérer les décisions Pilotage (créer, modifier, résoudre).
 * Mêmes permissions que l'accès Pilotage.
 */
export function canManagePilotageDecisions(user: any): boolean {
  return canAccessPilotage(user);
}

/**
 * Vérifie si l'utilisateur peut masquer une alerte Pilotage.
 * Mêmes permissions que l'accès Pilotage.
 */
export function canDismissPilotageAlerts(user: any): boolean {
  return canAccessPilotage(user);
}