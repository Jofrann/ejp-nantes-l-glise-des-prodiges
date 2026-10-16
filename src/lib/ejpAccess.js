// Explicit grants are independent of system roles, badges and memberships.
export const activeMembership = m => m.status ? m.status === 'active' : m.is_active !== false;
export const hasEJPGrant = (user, key) => user?.account_status === 'active' && user?.ejp_permissions?.[key] === true;
export const canViewAllEJPData = user => hasEJPGrant(user, 'canViewAllEJPData');
export const canViewSensitiveEJPData = user => canViewAllEJPData(user) && hasEJPGrant(user, 'canViewSensitiveEJPData');
export const canAccessEJPPilotage = user => canViewAllEJPData(user) || hasEJPGrant(user,'canManagePilotageDecisions');
export const departmentManager = (user, id, memberships) => user?.account_status === 'active' && memberships.some(m => m.user_id === user.id && m.department_id === id && activeMembership(m) && ['referent','responsable','coordinateur'].includes(m.role_in_dept));
