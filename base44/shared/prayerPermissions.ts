/**
 * prayerPermissions.ts — Utilitaires partagés pour les permissions MPI.
 *
 * Vérifie l'appartenance au département MPI, le statut responsable,
 * et le filtrage de confidentialité des demandes de prière.
 *
 * CONFIDENTIALITÉ ABSOLUE :
 * - GENERAL_MPI     → tous les membres MPI actifs
 * - RESTRICTED_MPI  → responsables MPI + admins
 * - LEADERS_ONLY    → leadership (bureau, bergere, admin) — PAS responsables MPI ordinaires
 * - PRIVATE_ASSIGNEES → uniquement personnes explicitement assignées + demandeur + admins
 */

const RESPONSABLE_ROLES = ['responsable', 'coordinateur', 'referent'];
const LEADER_ROLES = ['bureau', 'bergere', 'admin'];
const LEADER_BADGES = ['BUREAU', 'BERGERE'];

export interface PrayerAccessResult {
  granted: boolean;
  access_denied?: boolean;
  not_found?: boolean;
  error?: string;
  department?: any;
  membership?: any;
  isAdmin?: boolean;
  isResponsable?: boolean;
  isLeader?: boolean;
  roleInDept?: string;
  userId?: string;
}

/**
 * Vérifie l'accès de l'utilisateur au département MPI.
 */
export async function checkPrayerAccess(
  base44: any,
  departmentSlug: string
): Promise<PrayerAccessResult> {
  // 1. Trouver le département par slug
  const depts = await base44.asServiceRole.entities.Department.filter({
    slug: departmentSlug,
  });
  const department = depts && depts[0];
  if (!department) {
    return { granted: false, not_found: true };
  }

  // 2. Utilisateur courant
  const user = await base44.auth.me();
  if (!user) {
    return { granted: false, access_denied: true, error: 'Unauthorized' };
  }

  const isAdmin = hasAdminRole(user);
  const isLeader = hasLeaderRole(user);

  // 3. Vérifier l'appartenance (sauf admin)
  let membership = null;
  if (!isAdmin) {
    const memberships = await base44.asServiceRole.entities.DepartmentMember.filter({
      user_id: user.id,
      department_id: department.id,
    });
    membership = (memberships || []).find(
      (m: any) => m.status === 'active' || (!m.status && m.is_active === true)
    );
    if (!membership) {
      return { granted: false, access_denied: true, department };
    }
  }

  const roleInDept = isAdmin ? 'admin' : membership?.role_in_dept || 'membre';
  const isResponsable = isAdmin || RESPONSABLE_ROLES.includes(roleInDept);

  return {
    granted: true,
    department,
    membership,
    isAdmin,
    isResponsable,
    isLeader,
    roleInDept,
    userId: user.id,
  };
}

/**
 * Détermine si un utilisateur peut lire une demande de prière selon son niveau de confidentialité.
 * Le filtrage se fait côté BACKEND — jamais côté frontend.
 */
export function canReadRequest(
  request: any,
  assigneeUserIds: string[],
  user: any,
  isResponsable: boolean,
  isAdmin: boolean,
  isLeader: boolean
): boolean {
  if (isAdmin) return true;

  switch (request.confidentiality) {
    case 'GENERAL_MPI':
      return true; // Tous les membres MPI actifs (déjà vérifié par checkPrayerAccess)

    case 'RESTRICTED_MPI':
      return isResponsable;

    case 'LEADERS_ONLY':
      return isLeader;

    case 'PRIVATE_ASSIGNEES':
      // Uniquement les personnes explicitement assignées + le demandeur
      return (
        assigneeUserIds.includes(user.id) ||
        request.requester_user_id === user.id
      );

    default:
      return false;
  }
}

/**
 * Détermine si un utilisateur peut lire un sujet d'intercession selon sa visibilité.
 */
export function canReadTopic(
  topic: any,
  isResponsable: boolean,
  isAdmin: boolean,
  isLeader: boolean
): boolean {
  if (isAdmin) return true;

  switch (topic.visibility) {
    case 'mpi':
      return true; // Tous les membres MPI actifs
    case 'leaders':
      return isLeader;
    case 'restricted':
      return isResponsable;
    default:
      return false;
  }
}

// === Helpers de rôles (cohérents avec src/lib/permissions.js) ===

function getRoles(user: any): string[] {
  if (!user) return [];
  if (Array.isArray(user.roles) && user.roles.length > 0) return user.roles;
  if (user.role) return [user.role];
  return ['serviteur'];
}

function getBadges(user: any): string[] {
  if (!user) return [];
  return Array.isArray(user.badges) ? user.badges : [];
}

function hasAdminRole(user: any): boolean {
  return getRoles(user).includes('admin') || getBadges(user).includes('ADMIN');
}

function hasLeaderRole(user: any): boolean {
  const roles = getRoles(user);
  const badges = getBadges(user);
  return (
    LEADER_ROLES.some(r => roles.includes(r)) ||
    LEADER_BADGES.some(b => badges.includes(b))
  );
}