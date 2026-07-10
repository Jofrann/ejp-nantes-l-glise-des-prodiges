/**
 * Helper central pour le routage des départements.
 * Aucune page ne doit construire manuellement une URL de département.
 */

export function isFijDepartment(dept) {
  if (!dept) return false;

  const slug = String(dept.slug || '').toLowerCase().trim();
  const name = String(dept.name || '').toLowerCase().trim();
  const moduleKey = String(dept.module_key || dept.module || dept.type || '').toLowerCase().trim();

  return (
    moduleKey === 'fij' ||
    slug === 'fij' ||
    slug === 'coordination-fij' ||
    slug === 'familles-impact-jeunes' ||
    slug === 'foyers-intercession-jeune' ||
    name.includes('fij') ||
    name.includes("famille d'impact") ||
    name.includes("familles d'impact") ||
    name.includes("foyer d'intercession")
  );
}

export function getDepartmentRoute(dept) {
  if (!dept) return '/app/departements';

  if (isFijDepartment(dept)) {
    return '/app/responsabilites';
  }

  return `/app/departements/${dept.slug || dept.id}`;
}