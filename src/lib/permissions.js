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

// Direction = Bergère, Bureau ou Admin (décideurs / vision globale)
export function isDirection(user) {
  return hasAnyRole(user, ['bergere', 'bureau', 'admin']);
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

// === Helpers Département ===

// Retourne les IDs de départements visibles par l'utilisateur
export function getVisibleDepartmentIds(user, memberships = []) {
  if (!user) return [];
  if (isBureauLike(user)) return null; // null = tous visibles
  return memberships
    .filter(m => m.user_id === user.id && m.is_active !== false)
    .map(m => m.department_id);
}

export function canReadDepartment(user, departmentId, memberships = []) {
  if (!user) return false;
  if (isBureauLike(user)) return true;
  return memberships.some(m => m.user_id === user.id && m.department_id === departmentId && m.is_active !== false);
}

export function canManageDepartment(user, departmentId, memberships = []) {
  if (!user) return false;
  if (isAdmin(user)) return true;
  if (hasRole(user, 'bergere')) return true;
  // Référent du département
  return memberships.some(m =>
    m.user_id === user.id &&
    m.department_id === departmentId &&
    m.role_in_dept === 'referent' &&
    m.is_active !== false
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
    m.is_active !== false
  );
}

export function canUpdateDepartmentData(user, departmentId, record, memberships = []) {
  if (!user) return false;
  if (isBureauLike(user)) return true;
  // Référent ou auteur de la donnée
  if (record?.submitted_by === user.id) return true;
  return canManageDepartment(user, departmentId, memberships);
}

export function canDeleteDepartmentData(user, departmentId, record, memberships = []) {
  if (!user) return false;
  if (isAdmin(user)) return true;
  if (hasRole(user, 'bergere')) return true;
  return canManageDepartment(user, departmentId, memberships);
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

export function isFijPilotOf(user, fij) {
  if (!user || !fij) return false;
  return fij.pilot_user_id === user.id || (fij.co_pilot_user_ids || []).includes(user.id);
}

export function getFijAccessLevel(user, fijs) {
  if (isFijDirection(user)) return 'direction';
  if (isFijCoordination(user)) return 'coordination';
  if (isFijPilot(user, fijs)) return 'pilot';
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
  return false; // Pilote ne modifie pas les infos FIJ
}

export function canDeleteFij(user, fij) {
  if (!user) return false;
  return isAdmin(user) || hasRole(user, 'bergere');
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

// Filtrage des FIJ selon le rôle — ne charge que ce qui est autorisé
export function getVisibleFijsForUser(user, allFijs) {
  if (!user || !allFijs) return [];
  if (isFijCoordination(user)) return allFijs.filter(f => f.is_active !== false);
  return allFijs.filter(f =>
    f.is_active !== false &&
    (f.pilot_user_id === user.id || (f.co_pilot_user_ids || []).includes(user.id))
  );
}

// Retourne les IDs de FIJ visibles par l'utilisateur (pour filtrer les données liées)
export function getVisibleFijIds(user, allFijs) {
  return getVisibleFijsForUser(user, allFijs).map(f => f.id);
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