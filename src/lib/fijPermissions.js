/**
 * fijPermissions.js — Permissions centralisées FIJ Phase 6 V2.
 *
 * Rôles :
 * - pilote_fij / copilote_fij : CRUD limité à ses FI
 * - coordination_fij / referent_fij : CRUD opérationnel sur toutes les FIJ
 * - bureau / bergere / admin : direction (lecture agrégée dans /app/direction)
 * - serviteur hors FIJ : aucune donnée FIJ
 */

import { getRoles, isAdmin, isBureauLike, hasRole, hasAnyRole } from '@/lib/permissions';

// === Rôles FIJ ===

export function isFijPilotRole(user) {
  if (!user) return false;
  const roles = getRoles(user);
  return roles.includes('pilote_fij') || roles.includes('copilote_fij');
}

export function isFijCoordinationRole(user) {
  if (!user) return false;
  if (isAdmin(user)) return true;
  const roles = getRoles(user);
  return roles.includes('coordination_fij') || roles.includes('referent_fij');
}

export function isFijDirectionRole(user) {
  return isBureauLike(user);
}

export function getFijAccessLevelV2(user, fijs = []) {
  if (isFijCoordinationRole(user)) return 'coordination';
  if (isFijPilotRole(user) || isFijPilotOfAnyFi(user, fijs)) return 'pilot';
  if (isFijDirectionRole(user)) return 'direction';
  return 'none';
}

// === Pilote / Copilote sur une FI spécifique ===

export function isPilotOfFij(user, fij) {
  if (!user || !fij) return false;
  return (
    fij.pilot_user_id === user.id ||
    fij.copilot_user_id === user.id ||
    (fij.co_pilot_user_ids || []).includes(user.id)
  );
}

export function isFijPilotOfAnyFi(user, fijs = []) {
  if (!user || !fijs?.length) return false;
  return fijs.some(f => isPilotOfFij(user, f));
}

// === Permissions CRUD FIJ ===

export function canReadFijV2(user, fij) {
  if (!user || !fij) return false;
  if (isFijCoordinationRole(user)) return true;
  if (isFijDirectionRole(user)) return true;
  return isPilotOfFij(user, fij);
}

export function canCreateFijV2(user) {
  return isFijCoordinationRole(user);
}

export function canUpdateFijV2(user, fij) {
  if (!user || !fij) return false;
  if (isFijCoordinationRole(user)) return true;
  return false;
}

export function canDeleteFijV2(user) {
  if (!user) return false;
  return isAdmin(user) || hasRole(user, 'bergere');
}

// === Permissions Membres ===

export function canReadFijMembers(user, fij) {
  if (!user || !fij) return false;
  if (isFijCoordinationRole(user)) return true;
  return isPilotOfFij(user, fij);
}

export function canCreateFijMember(user, fij) {
  if (!user || !fij) return false;
  if (isFijCoordinationRole(user)) return true;
  return isPilotOfFij(user, fij);
}

export function canUpdateFijMember(user, fij) {
  if (!user || !fij) return false;
  if (isFijCoordinationRole(user)) return true;
  return isPilotOfFij(user, fij);
}

export function canDeleteFijMember(user, fij) {
  if (!user || !fij) return false;
  if (isFijCoordinationRole(user)) return true;
  return false;
}

// === Permissions CR du jeudi ===

export function canCreateThursdayReport(user, fij) {
  if (!user || !fij) return false;
  if (isFijCoordinationRole(user)) return true;
  return isPilotOfFij(user, fij);
}

export function canUpdateThursdayReport(user, fij) {
  if (!user || !fij) return false;
  if (isFijCoordinationRole(user)) return true;
  return isPilotOfFij(user, fij);
}

export function canReadThursdayReport(user, fij) {
  if (!user || !fij) return false;
  if (isFijCoordinationRole(user)) return true;
  if (isFijDirectionRole(user)) return true;
  return isPilotOfFij(user, fij);
}

export function canValidateThursdayReport(user) {
  return isFijCoordinationRole(user);
}

// === Permissions Notes ===

export function canCreateMemberNote(user, fij) {
  if (!user || !fij) return false;
  if (isFijCoordinationRole(user)) return true;
  return isPilotOfFij(user, fij);
}

export function canReadMemberNotes(user, fij, note) {
  if (!user || !fij) return false;
  if (isFijCoordinationRole(user)) return true;
  if (note?.visibility === 'coordination_fij' && !isFijCoordinationRole(user)) return false;
  return isPilotOfFij(user, fij);
}

// === Filtrage ===

export function getVisibleFijsV2(user, allFijs = []) {
  if (!user || !allFijs?.length) return [];
  if (isFijCoordinationRole(user) || isFijDirectionRole(user)) {
    return allFijs.filter(f => f.is_active !== false);
  }
  return allFijs.filter(f =>
    f.is_active !== false && isPilotOfFij(user, f)
  );
}

export function getVisibleFijIdsV2(user, allFijs = []) {
  return getVisibleFijsV2(user, allFijs).map(f => f.id);
}

// === Labels ===

export const GROWTH_STATUS_LABELS = {
  passif: 'Passif',
  regulier: 'Régulier',
  disciple: 'Disciple',
  serviteur: 'Serviteur',
  reproducteur: 'Reproducteur',
};

export const GROWTH_STATUS_COLORS = {
  passif: 'text-muted-foreground bg-muted',
  regulier: 'text-blue-600 bg-blue-50',
  disciple: 'text-indigo-600 bg-indigo-50',
  serviteur: 'text-success bg-success/10',
  reproducteur: 'text-secondary bg-secondary/10',
};

export const NOTE_TYPE_LABELS = {
  suivi: 'Suivi',
  appel: 'Appel',
  rencontre: 'Rencontre',
  integration: 'Intégration',
  absence: 'Absence',
  transfert: 'Transfert',
  autre: 'Autre',
};