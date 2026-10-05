// src/lib/ejpAuth.js
// Utilitaire central pour l'authentification interne EJP.
//
// Principe :
//   Identifiant visible EJP  →  prenom@prodiges
//   Adresse technique Base44 →  prenom@<auth_email_domain>
//
// Le domaine technique est lu depuis ChurchConfig.auth_email_domain.
// Tant qu'il n'est pas configuré, le mapping est désactivé (mode fallback email réel).

import { base44 } from '@/api/base44Client';

let _cachedDomain = null;
let _cacheTime = 0;
const CACHE_TTL = 60000; // 1 minute

/**
 * Lit le domaine email technique depuis ChurchConfig.
 * Retourne null si non configuré.
 */
export async function getAuthEmailDomain() {
  const now = Date.now();
  if (_cachedDomain !== null && now - _cacheTime < CACHE_TTL) {
    return _cachedDomain;
  }
  try {
    const configs = await base44.entities.ChurchConfig.list('-created_date', 1);
    const domain = (configs?.[0]?.auth_email_domain || '').trim().toLowerCase() || null;
    _cachedDomain = domain;
    _cacheTime = now;
    return domain;
  } catch {
    return null;
  }
}

/**
 * Vérifie si le système d'authentification interne est configuré.
 */
export async function isAuthConfigured() {
  const domain = await getAuthEmailDomain();
  return !!domain;
}

/**
 * Vérifie qu'un identifiant est au format EJP (terminé par @prodiges).
 */
export function isEjpIdentifier(identifier) {
  if (!identifier) return false;
  return identifier.trim().toLowerCase().endsWith('@prodiges');
}

/**
 * Normalise un identifiant (trim + lowercase).
 */
export function normalizeIdentifier(identifier) {
  return (identifier || '').trim().toLowerCase();
}

/**
 * Extrait le username d'un identifiant EJP (prenom@prodiges → prenom).
 */
export function extractUsername(identifier) {
  const normalized = normalizeIdentifier(identifier);
  return normalized.replace(/@prodiges$/, '');
}

/**
 * Transforme un identifiant EJP (prenom@prodiges) en adresse technique Base44.
 * Retourne null si le domaine n'est pas configuré ou si l'identifiant n'est pas au format EJP.
 */
export async function toTechnicalEmail(identifier) {
  const domain = await getAuthEmailDomain();
  if (!domain) return null;
  const normalized = normalizeIdentifier(identifier);
  if (!isEjpIdentifier(normalized)) return null;
  const username = extractUsername(normalized);
  return `${username}@${domain}`;
}

/**
 * Détermine l'adresse d'authentification à utiliser pour un identifiant saisi.
 *
 * - Si l'identifiant est au format EJP (@prodiges) → transforme vers l'adresse technique.
 * - Sinon (email réel) → retourne l'identifiant tel quel (mode fallback).
 *
 * Retourne { authEmail, error } :
 *   - error = "not_configured" si @prodiges mais domaine non configuré
 *   - error = null si OK
 */
export async function resolveAuthEmail(identifier) {
  const normalized = normalizeIdentifier(identifier);

  if (isEjpIdentifier(normalized)) {
    const technicalEmail = await toTechnicalEmail(normalized);
    if (!technicalEmail) {
      return { authEmail: null, error: 'not_configured' };
    }
    return { authEmail: technicalEmail, error: null };
  }

  // Mode fallback : email réel (admin, comptes existants)
  return { authEmail: normalized, error: null };
}

/**
 * Messages d'erreur humains — ne jamais exposer l'adresse technique.
 */
export function getLoginErrorMessage(error) {
  const msg = (error?.message || error?.toString() || '').toLowerCase();
  if (msg.includes('suspended') || msg.includes('disabled')) {
    return 'Ton accès est actuellement suspendu.';
  }
  if (msg.includes('not found') || msg.includes('404') || msg.includes('does not exist')) {
    return "Cet identifiant EJP n'est pas reconnu.";
  }
  // Message générique — ne distingue pas identifiant vs password
  return 'Identifiant ou mot de passe incorrect.';
}

/**
 * Déclenche la réinitialisation d'accès pour un utilisateur (action admin).
 * Envoie un email de reset vers l'adresse technique contrôlée par l'EJP.
 * Ne crée PAS le password — l'utilisateur recevra un lien pour en choisir un nouveau.
 *
 * Retourne { success, error } :
 *   - error = "not_configured" si le domaine n'est pas configuré
 *   - error = "no_identifier" si l'utilisateur n'a pas d'internal_identifier
 */
export async function resetUserAccess(internalIdentifier) {
  if (!internalIdentifier) {
    return { success: false, error: 'no_identifier' };
  }
  if (!isEjpIdentifier(internalIdentifier)) {
    // Si l'utilisateur a un email réel, on utilise resetPasswordRequest directement
    try {
      await base44.auth.resetPasswordRequest(internalIdentifier);
      return { success: true, error: null };
    } catch {
      return { success: false, error: 'request_failed' };
    }
  }
  const technicalEmail = await toTechnicalEmail(internalIdentifier);
  if (!technicalEmail) {
    return { success: false, error: 'not_configured' };
  }
  try {
    await base44.auth.resetPasswordRequest(technicalEmail);
    return { success: true, error: null };
  } catch {
    return { success: false, error: 'request_failed' };
  }
}