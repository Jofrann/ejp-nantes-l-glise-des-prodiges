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
  return hasRole(user, 'admin') || hasBadge(user, 'ADMIN');
}

// bureau, bergere ou admin — tous ont un accès de niveau bureau
export function isBureauLike(user) {
  return hasAnyRole(user, ['bureau', 'bergere', 'admin']) || hasBadge(user, 'BUREAU') || hasBadge(user, 'BERGERE');
}

// Direction = Bergère, Bureau ou Admin (décideurs / vision globale)
export function isDirection(user) {
  return hasAnyRole(user, ['bergere', 'bureau', 'admin']) || hasBadge(user, 'BERGERE') || hasBadge(user, 'BUREAU');
}

// === BADGES GLOBAUX ===

export function getBadges(user) {
  if (!user) return [];
  return Array.isArray(user.badges) ? user.badges : [];
}

export function hasBadge(user, badge) {
  return getBadges(user).includes(badge);
}

export function hasAnyBadge(user, badges) {
  const userBadges = getBadges(user);
  return badges.some(b => userBadges.includes(b));
}

// === STATUT COMPTE ===

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

export function isAccountArchived(user) {
  return user?.account_status === 'archived';
}

// Un compte est bloqué si suspended ou archived
export function isAccountBlocked(user) {
  return isAccountSuspended(user) || isAccountArchived(user);
}

// === HELPERS IDENTIFIANT INTERNE ===

export function getInternalIdentifier(user) {
  return user?.internal_identifier || user?.email || '';
}

export function getDisplayName(user) {
  if (user?.first_name && user?.last_name) return `${user.first_name} ${user.last_name}`;
  return user?.full_name || user?.email || '';
}

// === HELPERS DÉPARTEMENT ===

// Retourne les IDs de départements visibles par l'utilisateur
export function getVisibleDepartmentIds(user, memberships = []) {
  if (!user) return [];
  if (isBureauLike(user)) return null; // null = tous visibles
  return memberships
    .filter(m => m.user_id === user.id && (m.status === 'active' || m.is_active !== false))
    .map(m => m.department_id);
}

export function canReadDepartment(user, departmentId, memberships = []) {
  if (!user) return false;
  if (isBureauLike(user)) return true;
  return memberships.some(m => m.user_id === user.id && m.department_id === departmentId && (m.status === 'active' || m.is_active !== false));
}

export function canManageDepartment(user, departmentId, memberships = []) {
  if (!user) return false;
  if (isAdmin(user)) return true;
  if (hasRole(user, 'bergere') || hasBadge(user, 'BERGERE')) return true;
  // Responsable, référent ou coordinateur du département
  return memberships.some(m =>
    m.user_id === user.id &&
    m.department_id === departmentId &&
    ['responsable', 'referent', 'coordinateur'].includes(m.role_in_dept) &&
    (m.status === 'active' || m.is_active !== false)
  );
}

export function canManageDepartmentMembers(user, departmentId, memberships = []) {
  return canManageDepartment(user, departmentId, memberships);
}

export function canReadDepartmentData(user, departmentId, memberships = []) {
  return canReadDepartment(user, departmentId, memberships);
}

export function canCreateDepartmentData(user, departmentId, memberships = []) {
  if (!user) return false;
  if (isBureauLike(user)) return true;
  return memberships.some(m =>
    m.user_id === user.id &&
    m.department_id === departmentId &&
    (m.status === 'active' || m.is_active !== false)
  );
}

export function canUpdateDepartmentData(user, departmentId, record, memberships = []) {
  if (!user) return false;
  if (isBureauLike(user)) return true;
  // Auteur de la donnée
  if (record?.submitted_by === user.id) return true;
  return canManageDepartment(user, departmentId, memberships);
}

export function canDeleteDepartmentData(user, departmentId, record, memberships = []) {
  if (!user) return false;
  if (isAdmin(user)) return true;
  if (hasRole(user, 'bergere') || hasBadge(user, 'BERGERE')) return true;
  return canManageDepartment(user, departmentId, memberships);
}

// Retourne le rôle de l'utilisateur dans un département spécifique
export function getRoleInDepartment(user, departmentId, memberships = []) {
  if (!user || !departmentId) return null;
  if (isAdmin(user)) return 'admin';
  const membership = memberships.find(m =>
    m.user_id === user.id &&
    m.department_id === departmentId &&
    (m.status === 'active' || m.is_active !== false)
  );
  return membership?.role_in_dept || null;
}

// === HELPERS FIJ ===

// Direction globale = Bureau, Bergère ou Admin (voient les indicateurs dans /app/direction)
export function isFijDirection(user) {
  return isBureauLike(user);
}

// Coordination FIJ = rôle spécifique fij_coordination ou admin (gestion opérationnelle)
export function isFijCoordination(user) {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return hasRole(user, 'fij_coordination') || hasBadge(user, 'COORDINATION_FIJ');
}

// Pilote = utilisateur rattaché comme pilot, copilot ou co-pilot sur au moins une FIJ
export function isFijPilot(user, fijs) {
  if (!user || !fijs) return false;
  return fijs.some(f =>
    f.pilot_user_id === user.id ||
    f.copilot_user_id === user.id ||
    (f.co_pilot_user_ids || []).includes(user.id)
  );
}

export function isFijPilotOf(user, fij) {
  if (!user || !fij) return false;
  return (
    fij.pilot_user_id === user.id ||
    fij.copilot_user_id === user.id ||
    (fij.co_pilot_user_ids || []).includes(user.id)
  );
}

export function getFijAccessLevel(user, fijs) {
  if (isFijCoordination(user)) return 'coordination';
  if (isFijPilot(user, fijs)) return 'pilot';
  if (isFijDirection(user)) return 'direction';
  return 'none';
}

// === Permissions CRUD FIJ ===

export function canReadFij(user, fij) {
  if (!user || !fij) return false;
  if (isFijCoordination(user)) return true;
  return isFijPilotOf(user, fij);
}

export function canCreateFij(user) {
  return isFijCoordination(user);
}

export function canUpdateFij(user, fij) {
  if (!user || !fij) return false;
  if (isFijCoordination(user)) return true;
  return false;
}

export function canDeleteFij(user, fij) {
  if (!user) return false;
  return isAdmin(user) || hasRole(user, 'bergere') || hasBadge(user, 'BERGERE');
}

export function canCreateFijReport(user, fij) {
  if (!user || !fij) return false;
  if (isFijCoordination(user)) return true;
  return isFijPilotOf(user, fij);
}

export function canValidateFijReport(user, report) {
  if (!user) return false;
  return isFijCoordination(user);
}

export function canReadFijReport(user, report, fij) {
  if (!user) return false;
  if (isFijCoordination(user)) return true;
  if (!fij) return false;
  return isFijPilotOf(user, fij);
}

// Filtrage des FIJ selon le rôle
export function getVisibleFijsForUser(user, allFijs) {
  if (!user || !allFijs) return [];
  if (isFijCoordination(user)) return allFijs.filter(f => f.is_active !== false);
  return allFijs.filter(f =>
    f.is_active !== false &&
    (f.pilot_user_id === user.id || f.copilot_user_id === user.id || (f.co_pilot_user_ids || []).includes(user.id))
  );
}

export function getVisibleFijIds(user, allFijs) {
  return getVisibleFijsForUser(user, allFijs).map(f => f.id);
}

// Retourne le rôle le plus élevé pour l'affichage
export function getPrimaryRoleLabel(user) {
  const roles = getRoles(user);
  const badges = getBadges(user);
  if (roles.includes('admin') || badges.includes('ADMIN')) return 'Admin';
  if (roles.includes('bergere') || badges.includes('BERGERE')) return 'Bergère';
  if (roles.includes('bureau') || badges.includes('BUREAU')) return 'Bureau';
  if (roles.includes('referent') || badges.includes('RESPONSABLE')) return 'Référent';
  return 'Serviteur';
}