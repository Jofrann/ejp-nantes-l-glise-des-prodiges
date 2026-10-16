// base44/shared/pilotagePermissions.ts
import { canAccessEJPPilotage,hasEJPGrant } from '../../src/lib/ejpAccess.js';
// Permissions pour l'espace Pilotage global — couche transversale de direction.
//
// IMPORTANT :
// - Pilotage n'est PAS un département.
// - L'appartenance à un département ne donne PAS accès au Pilotage.
// - L'accès dépend exclusivement des habilitations nominatives ejp_permissions.
// - Un responsable de département seul n'a PAS accès automatiquement.
// - Un membre Coordination seul n'a PAS accès automatiquement.
// - Un Pilote FIJ seul n'a PAS accès automatiquement.
// - Un membre du département Leaders seul n'a PAS accès automatiquement.

/**
 * Vérifie si un utilisateur a accès au Pilotage global.
 *
 * Accès accordé à :
 * - canViewAllEJPData : consultation globale.
 * - canManagePilotageDecisions : décisions uniquement si absence de lecture globale.
 *
 * Accès REFUSÉ sinon, quelle que soit l'appartenance départementale.
 */
export function canAccessPilotage(user: any): boolean {
  return canAccessEJPPilotage(user);
}

/**
 * Vérifie si l'utilisateur peut gérer les décisions Pilotage (créer, modifier, résoudre).
 * Mêmes permissions que l'accès Pilotage.
 */
export function canManagePilotageDecisions(user: any): boolean {
  return hasEJPGrant(user,'canManagePilotageDecisions');
}

/**
 * Vérifie si l'utilisateur peut masquer une alerte Pilotage.
 * Mêmes permissions que l'accès Pilotage.
 */
export function canDismissPilotageAlerts(user: any): boolean {
  return canManagePilotageDecisions(user);
}
