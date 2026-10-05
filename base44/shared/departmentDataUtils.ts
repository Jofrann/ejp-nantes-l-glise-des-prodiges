/**
 * departmentDataUtils.ts — Utilitaires partagés pour les fonctions backend départementales.
 *
 * Fonctions communes de chargement et d'enrichissement des données départementales
 * (membres, affectations, utilisateurs). Utilisé par getMusicData et getSoundData.
 */

/**
 * Filtre les membres actifs d'une liste DepartmentMember.
 */
export function filterActiveMembers(members: any[]): any[] {
  return (members || []).filter(
    (m: any) => m.status === 'active' || (!m.status && m.is_active === true)
  );
}

/**
 * Charge une carte user_id → User pour une liste d'IDs.
 */
export async function loadUserMap(
  base44: any,
  userIds: string[]
): Promise<Record<string, any>> {
  const userMap: Record<string, any> = {};
  const validIds = (userIds || []).filter(Boolean);
  if (validIds.length === 0) return userMap;
  const uniqueIds = [...new Set(validIds)];
  const users = await base44.asServiceRole.entities.User.filter({
    id: { $in: uniqueIds },
  });
  (users || []).forEach((u: any) => {
    userMap[u.id] = u;
  });
  return userMap;
}

/**
 * Enrichit les membres avec internal_identifier et un profil optionnel.
 */
export function enrichMembers(
  members: any[],
  userMap: Record<string, any>,
  profileMap: Record<string, any>,
  profileKey: string
): any[] {
  return members.map((m: any) => ({
    ...m,
    internal_identifier: m.user_id ? userMap[m.user_id]?.internal_identifier || '' : '',
    [profileKey]: m.user_id ? profileMap[m.user_id] || null : null,
  }));
}

/**
 * Enrichit les assignments avec full_name depuis la userMap si manquant.
 */
export function enrichAssignments(
  assignments: any[],
  userMap: Record<string, any>
): any[] {
  return (assignments || []).map((a: any) => ({
    ...a,
    full_name: a.full_name || userMap[a.user_id]?.full_name || '',
  }));
}

/**
 * Groupe une liste d'éléments par une clé.
 */
export function groupBy(items: any[], key: string): Record<string, any[]> {
  const result: Record<string, any[]> = {};
  (items || []).forEach((item: any) => {
    const k = item[key];
    if (!result[k]) result[k] = [];
    result[k].push(item);
  });
  return result;
}

/**
 * Charge les assignments pour une liste de plan IDs.
 */
export async function loadAssignmentsForPlans(
  base44: any,
  entityName: string,
  planIds: string[]
): Promise<any[]> {
  if (!planIds || planIds.length === 0) return [];
  return await base44.asServiceRole.entities[entityName].filter({
    service_plan_id: { $in: planIds },
  });
}