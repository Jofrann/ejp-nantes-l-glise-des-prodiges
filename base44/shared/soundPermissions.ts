/**
 * soundPermissions.ts — Utilitaires partagés pour les permissions Sonorisation.
 *
 * Vérifie l'appartenance au département Sonorisation et le statut responsable.
 * Utilisé par getSoundData et manageSoundItem.
 */

const RESPONSABLE_ROLES = ['responsable', 'coordinateur', 'referent'];

export interface SoundAccessResult {
  granted: boolean;
  access_denied?: boolean;
  not_found?: boolean;
  error?: string;
  department?: any;
  membership?: any;
  isAdmin?: boolean;
  isResponsable?: boolean;
  roleInDept?: string;
}

/**
 * Vérifie l'accès de l'utilisateur au département Sonorisation.
 * Retourne le département, l'appartenance, et les flags de permission.
 */
export async function checkSoundAccess(
  base44: any,
  departmentSlug: string
): Promise<SoundAccessResult> {
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

  const isAdmin = user.role === 'admin';

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
    roleInDept,
  };
}