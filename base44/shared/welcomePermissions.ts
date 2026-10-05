/**
 * welcomePermissions.ts — Utilitaires partagés pour les permissions Accueil.
 *
 * Vérifie l'appartenance au département Accueil, le statut responsable,
 * et le filtrage d'accès aux fiches visiteurs.
 *
 * CONFIDENTIALITÉ VISITEURS :
 * - consent_to_contact = false → pas de suivi nominatif détaillé
 * - Les membres Accueil voient les infos opérationnelles
 * - Les responsables Accueil gèrent le suivi visiteurs/intégration
 */

const RESPONSABLE_ROLES = ['responsable', 'coordinateur', 'referent'];

export interface WelcomeAccessResult {
  granted: boolean;
  access_denied?: boolean;
  not_found?: boolean;
  error?: string;
  department?: any;
  membership?: any;
  isAdmin?: boolean;
  isResponsable?: boolean;
  roleInDept?: string;
  userId?: string;
}

/**
 * Vérifie l'accès de l'utilisateur au département Accueil.
 */
export async function checkWelcomeAccess(
  base44: any,
  departmentSlug: string
): Promise<WelcomeAccessResult> {
  const depts = await base44.asServiceRole.entities.Department.filter({
    slug: departmentSlug,
  });
  const department = depts && depts[0];
  if (!department) {
    return { granted: false, not_found: true };
  }

  const user = await base44.auth.me();
  if (!user) {
    return { granted: false, access_denied: true, error: 'Unauthorized' };
  }

  const isAdmin = hasAdminRole(user);

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
    roleInDept,
    userId: user.id,
  };
}

/**
 * Détermine si un utilisateur peut modifier une fiche visiteur.
 * Seuls les responsables Accueil (et admins) peuvent modifier les fiches.
 */
export function canEditVisitor(
  isResponsable: boolean,
  isAdmin: boolean
): boolean {
  return isAdmin || isResponsable;
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