/**
 * coordFijUtils.js — Helper pour la logique de Coordination FIJ.
 *
 * Source principale : DepartmentMember actif dans le département "Coordination FIJ" (slug: coordination-fij).
 * Fallback temporaire : badge COORDINATION_FIJ / role fij_coordination (legacy).
 */

import { base44 } from '@/api/base44Client';

const COORD_FIJ_SLUG = 'coordination-fij';

let _coordFijDeptId = null;
let _coordFijDeptPromise = null;

/**
 * Retourne l'ID du département Coordination FIJ (mis en cache après le premier appel).
 */
export async function getCoordFijDeptId() {
  if (_coordFijDeptId) return _coordFijDeptId;
  if (_coordFijDeptPromise) return _coordFijDeptPromise;

  _coordFijDeptPromise = base44.entities.Department
    .filter({ slug: COORD_FIJ_SLUG }, { limit: 1 })
    .then((res) => {
      const items = res?.items || res || [];
      const dept = items[0];
      _coordFijDeptId = dept?.id || null;
      return _coordFijDeptId;
    })
    .catch(() => {
      _coordFijDeptId = null;
      return null;
    });

  return _coordFijDeptPromise;
}

/**
 * Charge les memberships du user courant + l'ID du département Coordination FIJ.
 * Retourne { memberships, coordFijDeptId }.
 */
export async function loadCoordFijContext() {
  const [membershipsRes, coordFijDeptId] = await Promise.all([
    base44.entities.DepartmentMember.filter({}, { limit: 500 }).catch(() => []),
    getCoordFijDeptId(),
  ]);
  const memberships = membershipsRes?.items || membershipsRes || [];
  return { memberships, coordFijDeptId };
}