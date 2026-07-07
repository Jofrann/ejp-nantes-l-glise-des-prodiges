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

// Retourne le rôle le plus élevé pour l'affichage
export function getPrimaryRoleLabel(user) {
  const roles = getRoles(user);
  if (roles.includes('admin')) return 'Admin';
  if (roles.includes('bergere')) return 'Bergère';
  if (roles.includes('bureau')) return 'Bureau';
  if (roles.includes('referent')) return 'Référent';
  return 'Serviteur';
}