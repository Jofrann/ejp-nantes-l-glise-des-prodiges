/**
 * moderationConstants.js — Constantes et labels pour les modules Modération (frontend).
 */

export const MOD_PLAN_STATUS_LABELS = {
  draft: 'Brouillon',
  preparing: 'En préparation',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

export const MOD_PLAN_STATUS_COLORS = {
  draft: 'bg-surface text-muted-foreground border-border',
  preparing: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
  confirmed: 'bg-blue-500/10 text-blue-600 border-blue-400/20',
  completed: 'bg-green-500/10 text-green-600 border-green-400/20',
  cancelled: 'bg-red-500/10 text-red-600 border-red-400/20',
};

export const RUN_ITEM_TYPE_LABELS = {
  opening: 'Ouverture',
  prayer: 'Prière',
  worship: 'Louange',
  announcement: 'Annonce',
  testimony: 'Témoignage',
  offering: 'Offrande',
  teaching: 'Enseignement',
  transition: 'Transition',
  closing: 'Conclusion',
  custom: 'Personnalisé',
};

export const RUN_ITEM_TYPE_SHORT = {
  opening: 'Ouverture',
  prayer: 'Prière',
  worship: 'Louange',
  announcement: 'Annonce',
  testimony: 'Témoignage',
  offering: 'Offrande',
  teaching: 'Enseignement',
  transition: 'Transition',
  closing: 'Conclusion',
  custom: 'Autre',
};

export const RUN_ITEM_TYPE_OPTIONS = [
  { value: 'opening', label: 'Ouverture' },
  { value: 'prayer', label: 'Prière' },
  { value: 'worship', label: 'Louange' },
  { value: 'announcement', label: 'Annonce' },
  { value: 'testimony', label: 'Témoignage' },
  { value: 'offering', label: 'Offrande' },
  { value: 'teaching', label: 'Enseignement' },
  { value: 'transition', label: 'Transition' },
  { value: 'closing', label: 'Conclusion' },
  { value: 'custom', label: 'Personnalisé' },
];

export const RUN_ITEM_STATUS_LABELS = {
  planned: 'Planifié',
  in_progress: 'En cours',
  done: 'Terminé',
  skipped: 'Passé',
};

export const RUN_ITEM_STATUS_COLORS = {
  planned: 'bg-surface text-muted-foreground border-border',
  in_progress: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
  done: 'bg-green-500/10 text-green-600 border-green-400/20',
  skipped: 'bg-red-500/10 text-red-600 border-red-400/20',
};

export const ANNOUNCEMENT_PRIORITY_LABELS = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
};

export const ANNOUNCEMENT_PRIORITY_COLORS = {
  low: 'bg-surface text-muted-foreground border-border',
  medium: 'bg-blue-500/10 text-blue-600 border-blue-400/20',
  high: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
};

export const ANNOUNCEMENT_STATUS_LABELS = {
  draft: 'Brouillon',
  active: 'Active',
  archived: 'Archivée',
};

export const ANNOUNCEMENT_STATUS_COLORS = {
  draft: 'bg-surface text-muted-foreground border-border',
  active: 'bg-green-500/10 text-green-600 border-green-400/20',
  archived: 'bg-surface text-muted-foreground border-border',
};

export const PROFILE_FUNCTION_LABELS = {
  moderateur: 'Modérateur',
  co_moderateur: 'Co-modérateur',
  maitre_ceremonie: 'Maître de cérémonie',
  coordinateur_deroule: 'Coordinateur déroulé',
  autre: 'Autre',
};

export const PROFILE_FUNCTION_SHORT = {
  moderateur: 'Modérateur',
  co_moderateur: 'Co-modérateur',
  maitre_ceremonie: 'Maître cérémonie',
  coordinateur_deroule: 'Coord. déroulé',
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

export function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h${m.toString().padStart(2, '0')}`;
  if (h > 0) return `${h}h`;
  return `${m} min`;
}