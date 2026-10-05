/**
 * musicConstants.js — Constantes et labels pour les modules musicaux (frontend).
 */

export const POSITION_LABELS = {
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

export const POSITION_OPTIONS = [
  { value: 'chant_lead', label: 'Chant Lead' },
  { value: 'choriste', label: 'Choriste' },
  { value: 'clavier', label: 'Clavier' },
  { value: 'piano', label: 'Piano' },
  { value: 'guitare', label: 'Guitare' },
  { value: 'basse', label: 'Basse' },
  { value: 'batterie', label: 'Batterie' },
  { value: 'percussions', label: 'Percussions' },
  { value: 'direction_musicale', label: 'Direction musicale' },
  { value: 'autre', label: 'Autre' },
];

export const PLAN_STATUS_LABELS = {
  draft: 'Brouillon',
  preparing: 'Préparation',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

export const PLAN_STATUS_COLORS = {
  draft: 'bg-surface text-muted-foreground border-border',
  preparing: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
  confirmed: 'bg-green-500/10 text-green-600 border-green-400/20',
  completed: 'bg-blue-500/10 text-blue-600 border-blue-400/20',
  cancelled: 'bg-red-500/10 text-red-600 border-red-400/20',
};

export const ASSIGNMENT_STATUS_LABELS = {
  assigned: 'À confirmer',
  confirmed: 'Confirmé',
  declined: 'Décliné',
  replaced: 'Remplacé',
};

export const ASSIGNMENT_STATUS_COLORS = {
  assigned: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
  confirmed: 'bg-green-500/10 text-green-600 border-green-400/20',
  declined: 'bg-red-500/10 text-red-600 border-red-400/20',
  replaced: 'bg-surface text-muted-foreground border-border',
};

export const AVAILABILITY_LABELS = {
  available: 'Disponible',
  unavailable: 'Indisponible',
  unsure: 'Incertain',
};

export const AVAILABILITY_COLORS = {
  available: 'bg-green-500/10 text-green-600 border-green-400/20',
  unavailable: 'bg-red-500/10 text-red-600 border-red-400/20',
  unsure: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
};

export const SONG_CATEGORY_LABELS = {
  louange: 'Louange',
  adoration: 'Adoration',
  celebration: 'Célébration',
  offrande: 'Offrande',
  autre: 'Autre',
};

export const REHEARSAL_STATUS_LABELS = {
  scheduled: 'Planifiée',
  completed: 'Terminée',
  cancelled: 'Annulée',
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