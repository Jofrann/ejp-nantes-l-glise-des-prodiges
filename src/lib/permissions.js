// Helpers de rôles cumulables — compatibles avec l'ancien champ `role` et le nouveau `roles`
// Valeurs possibles : serviteur, referent, bureau, bergere, admin

export function getRoles(user) {
  if (!user) return [];
  if (Array.isArray(user.roles) && user.roles.length > 0) return user.roles;
  if (user.role) return [user.role];
  return ['serviteur'];
}

export function hasRole(user, role) {
  return getRoles(user).includes(role);
}

export function hasAnyRole(user, roles) {
  const userRoles = getRoles(user);
  return roles.some(r => userRoles.includes(r));
}

export function isAdmin(user) {
  return hasRole(user, 'admin');
}

// bureau, bergere ou admin — tous ont un accès de niveau bureau
export function isBureauLike(user) {
  return hasAnyRole(user, ['bureau', 'bergere', 'admin']);
}

export function getRedirectPath(user) {
  return '/app';
}

export function isAccountActive(user) {
  return !user?.account_status || user?.account_status === 'active';
}

export function isAccountPending(user) {
  return user?.account_status === 'pending';
}

export function isAccountSuspended(user) {
  return user?.account_status === 'suspended';
}

// === Helpers FIJ ===

// Direction = Bergère ou Admin (décideurs finaux)
export function isFijDirection(user) {
  return hasAnyRole(user, ['bergere', 'admin']);
}

// Coordination = bureau, bergere ou admin (voient toutes les FIJ)
export function isFijCoordination(user) {
  return isBureauLike(user);
}

// Pilote = utilisateur rattaché comme pilot ou co-pilot sur au moins une FIJ
export function isFijPilot(user, fijs) {
  if (!user || !fijs) return false;
  return fijs.some(f => f.pilot_user_id === user.id || (f.co_pilot_user_ids || []).includes(user.id));
}

export function getFijAccessLevel(user, fijs) {
  if (isFijDirection(user)) return 'direction';
  if (isFijCoordination(user)) return 'coordination';
  if (isFijPilot(user, fijs)) return 'pilot';
  return 'none';
}

// Retourne le rôle le plus élevé pour l'affichage
export function getPrimaryRoleLabel(user) {
  const roles = getRoles(user);
  if (roles.includes('admin')) return 'Admin';
  if (roles.includes('bergere')) return 'Bergère';
  if (roles.includes('bureau')) return 'Bureau';
  if (roles.includes('referent')) return 'Référent';
  return 'Serviteur';
}