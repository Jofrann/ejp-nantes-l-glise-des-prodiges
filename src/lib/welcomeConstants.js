/**
 * welcomeConstants.js — Constantes et labels pour les modules Accueil (frontend).
 */

export const WELCOME_POSITION_LABELS = {
  accueil_entree: 'Accueil entrée',
  orientation: 'Orientation',
  placement: 'Placement',
  informations: 'Informations',
  nouveaux_visiteurs: 'Nouveaux / visiteurs',
  emargement: 'Émargement',
  responsable_accueil: 'Responsable accueil',
  autre: 'Autre',
};

export const WELCOME_POSITION_SHORT = {
  accueil_entree: 'Entrée',
  orientation: 'Orientation',
  placement: 'Placement',
  informations: 'Infos',
  nouveaux_visiteurs: 'Nouveaux',
  emargement: 'Émargement',
  responsable_accueil: 'Resp. accueil',
  autre: 'Autre',
};

export const WELCOME_POSITION_OPTIONS = [
  { value: 'accueil_entree', label: 'Accueil entrée' },
  { value: 'orientation', label: 'Orientation' },
  { value: 'placement', label: 'Placement' },
  { value: 'informations', label: 'Informations' },
  { value: 'nouveaux_visiteurs', label: 'Nouveaux / visiteurs' },
  { value: 'emargement', label: 'Émargement' },
  { value: 'responsable_accueil', label: 'Responsable accueil' },
  { value: 'autre', label: 'Autre' },
];

export const WELCOME_PLAN_STATUS_LABELS = {
  draft: 'Brouillon',
  preparing: 'En préparation',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

export const WELCOME_PLAN_STATUS_COLORS = {
  draft: 'bg-surface text-muted-foreground border-border',
  preparing: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
  confirmed: 'bg-blue-500/10 text-blue-600 border-blue-400/20',
  completed: 'bg-green-500/10 text-green-600 border-green-400/20',
  cancelled: 'bg-red-500/10 text-red-600 border-red-400/20',
};

export const WELCOME_ASSIGNMENT_STATUS_LABELS = {
  assigned: 'À confirmer',
  confirmed: 'Confirmé',
  declined: 'Décliné',
  replaced: 'Remplacé',
};

export const WELCOME_ASSIGNMENT_STATUS_COLORS = {
  assigned: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
  confirmed: 'bg-green-500/10 text-green-600 border-green-400/20',
  declined: 'bg-red-500/10 text-red-600 border-red-400/20',
  replaced: 'bg-surface text-muted-foreground border-border',
};

export const VISITOR_STATUS_LABELS = {
  new: 'Nouveau',
  contacted: 'Contacté',
  in_progress: 'En cours',
  integrated: 'Intégré',
  closed: 'Clôturé',
};

export const VISITOR_STATUS_COLORS = {
  new: 'bg-blue-500/10 text-blue-600 border-blue-400/20',
  contacted: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
  in_progress: 'bg-purple-500/10 text-purple-600 border-purple-400/20',
  integrated: 'bg-green-500/10 text-green-600 border-green-400/20',
  closed: 'bg-surface text-muted-foreground border-border',
};

export const VISITOR_STATUS_OPTIONS = [
  { value: 'new', label: 'Nouveau' },
  { value: 'contacted', label: 'Contacté' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'integrated', label: 'Intégré' },
  { value: 'closed', label: 'Clôturé' },
];

export const PROFILE_FUNCTION_LABELS = {
  accueil_entree: 'Accueil entrée',
  orientation: 'Orientation',
  placement: 'Placement',
  informations: 'Informations',
  nouveaux_visiteurs: 'Nouveaux / visiteurs',
  emargement: 'Émargement',
  responsable_accueil: 'Responsable accueil',
  autre: 'Autre',
};

export const PROFILE_FUNCTION_SHORT = {
  accueil_entree: 'Entrée',
  orientation: 'Orientation',
  placement: 'Placement',
  informations: 'Infos',
  nouveaux_visiteurs: 'Nouveaux',
  emargement: 'Émargement',
  responsable_accueil: 'Resp. accueil',
  autre: 'Autre',
};

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export function isUpcoming(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d >= today;
}