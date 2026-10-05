/**
 * musicPermissions.ts — Utilitaires partagés pour les permissions musicales.
 *
 * Vérifie l'appartenance au département Prodiges Musique et le statut responsable.
 * Utilisé par getMusicData et manageMusicItem.
 */

const RESPONSABLE_ROLES = ['responsable', 'coordinateur', 'referent'];

export interface MusicAccessResult {
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
 * Vérifie l'accès de l'utilisateur au département Prodiges Musique.
 * Retourne le département, l'appartenance, et les flags de permission.
 */
export async function checkMusicAccess(
  base44: any,
  departmentSlug: string
): Promise<MusicAccessResult> {
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

/**
 * Labels d'affichage pour les postes musicaux.
 */
export const POSITION_LABELS: Record<string, string> = {
  chant_lead: 'Chant Lead',
  choriste: 'Choriste',
  clavier: 'Clavier',
  piano: 'Piano',
  guitare: 'Guitare',
  basse: 'Basse',
  batterie: 'Batterie',
  percussions: 'Percussions',
  direction_musicale: 'Direction musicale',
  autre: 'Autre',
};

/**
 * Labels pour les statuts de plan de service.
 */
export const PLAN_STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  preparing: 'Préparation',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

/**
 * Labels pour les statuts d'affectation.
 */
export const ASSIGNMENT_STATUS_LABELS: Record<string, string> = {
  assigned: 'À confirmer',
  confirmed: 'Confirmé',
  declined: 'Décliné',
  replaced: 'Remplacé',
};

/**
 * Labels pour les disponibilités.
 */
export const AVAILABILITY_LABELS: Record<string, string> = {
  available: 'Disponible',
  unavailable: 'Indisponible',
  unsure: 'Incertain',
};

/**
 * Labels pour les catégories de chants.
 */
export const SONG_CATEGORY_LABELS: Record<string, string> = {
  louange: 'Louange',
  adoration: 'Adoration',
  celebration: 'Célébration',
  offrande: 'Offrande',
  autre: 'Autre',
};