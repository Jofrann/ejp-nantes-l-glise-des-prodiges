/**
 * prayerConstants.js — Constantes et labels pour les modules MPI (frontend).
 */

export const SCHEDULE_TYPE_LABELS = {
  intercession: 'Intercession',
  prayer_meeting: 'Réunion de prière',
  pre_service_prayer: 'Prière avant culte',
  special_prayer: 'Prière spéciale',
  other: 'Autre',
};

export const SCHEDULE_TYPE_SHORT = {
  intercession: 'Intercession',
  prayer_meeting: 'Réunion',
  pre_service_prayer: 'Avant culte',
  special_prayer: 'Spéciale',
  other: 'Autre',
};

export const SCHEDULE_TYPE_OPTIONS = [
  { value: 'intercession', label: 'Intercession' },
  { value: 'prayer_meeting', label: 'Réunion de prière' },
  { value: 'pre_service_prayer', label: 'Prière avant culte' },
  { value: 'special_prayer', label: 'Prière spéciale' },
  { value: 'other', label: 'Autre' },
];

export const SCHEDULE_STATUS_LABELS = {
  draft: 'Brouillon',
  scheduled: 'Planifié',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

export const SCHEDULE_STATUS_COLORS = {
  draft: 'bg-surface text-muted-foreground border-border',
  scheduled: 'bg-blue-500/10 text-blue-600 border-blue-400/20',
  completed: 'bg-green-500/10 text-green-600 border-green-400/20',
  cancelled: 'bg-red-500/10 text-red-600 border-red-400/20',
};

export const ASSIGNMENT_ROLE_LABELS = {
  intercesseur: 'Intercesseur',
  leader: 'Leader',
  animateur: 'Animateur',
  support: 'Support',
  autre: 'Autre',
};

export const ASSIGNMENT_ROLE_SHORT = {
  intercesseur: 'Intercesseur',
  leader: 'Leader',
  animateur: 'Animateur',
  support: 'Support',
  autre: 'Autre',
};

export const ASSIGNMENT_ROLE_OPTIONS = [
  { value: 'intercesseur', label: 'Intercesseur' },
  { value: 'leader', label: 'Leader' },
  { value: 'animateur', label: 'Animateur' },
  { value: 'support', label: 'Support' },
  { value: 'autre', label: 'Autre' },
];

export const ASSIGNMENT_STATUS_LABELS = {
  assigned: 'À confirmer',
  confirmed: 'Confirmé',
  declined: 'Décliné',
};

export const ASSIGNMENT_STATUS_COLORS = {
  assigned: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
  confirmed: 'bg-green-500/10 text-green-600 border-green-400/20',
  declined: 'bg-red-500/10 text-red-600 border-red-400/20',
};

export const AVAILABILITY_STATUS_LABELS = {
  available: 'Disponible',
  unavailable: 'Indisponible',
  maybe: 'Peut-être',
};

export const AVAILABILITY_STATUS_COLORS = {
  available: 'bg-green-500/10 text-green-600 border-green-400/20',
  unavailable: 'bg-red-500/10 text-red-600 border-red-400/20',
  maybe: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
};

export const AVAILABILITY_STATUS_OPTIONS = [
  { value: 'available', label: 'Disponible' },
  { value: 'unavailable', label: 'Indisponible' },
  { value: 'maybe', label: 'Peut-être' },
];

export const TOPIC_CATEGORY_LABELS = {
  EJP: 'EJP',
  evenement: 'Événement',
  jeunesse: 'Jeunesse',
  etudes: 'Études',
  familles: 'Familles',
  mission: 'Mission',
  eglise: 'Église',
  autre: 'Autre',
};

export const TOPIC_CATEGORY_OPTIONS = [
  { value: 'EJP', label: 'EJP' },
  { value: 'evenement', label: 'Événement' },
  { value: 'jeunesse', label: 'Jeunesse' },
  { value: 'etudes', label: 'Études' },
  { value: 'familles', label: 'Familles' },
  { value: 'mission', label: 'Mission' },
  { value: 'eglise', label: 'Église' },
  { value: 'autre', label: 'Autre' },
];

export const TOPIC_PRIORITY_LABELS = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
};

export const TOPIC_PRIORITY_COLORS = {
  low: 'bg-surface text-muted-foreground border-border',
  medium: 'bg-blue-500/10 text-blue-600 border-blue-400/20',
  high: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
};

export const TOPIC_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Basse' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Haute' },
];

export const TOPIC_STATUS_LABELS = {
  active: 'Actif',
  closed: 'Clôturé',
  archived: 'Archivé',
};

export const TOPIC_STATUS_COLORS = {
  active: 'bg-green-500/10 text-green-600 border-green-400/20',
  closed: 'bg-surface text-muted-foreground border-border',
  archived: 'bg-surface text-muted-foreground border-border',
};

export const TOPIC_VISIBILITY_LABELS = {
  mpi: 'MPI',
  leaders: 'Leadership',
  restricted: 'Restreint',
};

export const TOPIC_VISIBILITY_COLORS = {
  mpi: 'bg-blue-500/10 text-blue-600 border-blue-400/20',
  leaders: 'bg-purple-500/10 text-purple-600 border-purple-400/20',
  restricted: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
};

export const TOPIC_VISIBILITY_OPTIONS = [
  { value: 'mpi', label: 'MPI (tous les membres)' },
  { value: 'leaders', label: 'Leadership uniquement' },
  { value: 'restricted', label: 'Restreint (responsables + autorisés)' },
];

export const REQUEST_CATEGORY_LABELS = {
  general: 'Générale',
  sante: 'Santé',
  famille: 'Famille',
  orientation: 'Orientation',
  deliverance: 'Délivrance',
  autre: 'Autre',
};

export const REQUEST_CATEGORY_OPTIONS = [
  { value: 'general', label: 'Générale' },
  { value: 'sante', label: 'Santé' },
  { value: 'famille', label: 'Famille' },
  { value: 'orientation', label: 'Orientation' },
  { value: 'deliverance', label: 'Délivrance' },
  { value: 'autre', label: 'Autre' },
];

export const REQUEST_STATUS_LABELS = {
  new: 'Nouvelle',
  active: 'Active',
  follow_up: 'Suivi',
  closed: 'Clôturée',
  archived: 'Archivée',
};

export const REQUEST_STATUS_COLORS = {
  new: 'bg-blue-500/10 text-blue-600 border-blue-400/20',
  active: 'bg-green-500/10 text-green-600 border-green-400/20',
  follow_up: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
  closed: 'bg-surface text-muted-foreground border-border',
  archived: 'bg-surface text-muted-foreground border-border',
};

export const REQUEST_STATUS_OPTIONS = [
  { value: 'new', label: 'Nouvelle' },
  { value: 'active', label: 'Active' },
  { value: 'follow_up', label: 'Suivi' },
  { value: 'closed', label: 'Clôturée' },
  { value: 'archived', label: 'Archivée' },
];

export const CONFIDENTIALITY_LABELS = {
  GENERAL_MPI: 'MPI',
  RESTRICTED_MPI: 'Restreint',
  LEADERS_ONLY: 'Leadership',
  PRIVATE_ASSIGNEES: 'Privé',
};

export const CONFIDENTIALITY_COLORS = {
  GENERAL_MPI: 'bg-blue-500/10 text-blue-600 border-blue-400/20',
  RESTRICTED_MPI: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
  LEADERS_ONLY: 'bg-purple-500/10 text-purple-600 border-purple-400/20',
  PRIVATE_ASSIGNEES: 'bg-red-500/10 text-red-600 border-red-400/20',
};

export const CONFIDENTIALITY_OPTIONS = [
  { value: 'GENERAL_MPI', label: 'MPI — Tous les membres actifs' },
  { value: 'RESTRICTED_MPI', label: 'Restreint — Responsables MPI + autorisés' },
  { value: 'LEADERS_ONLY', label: 'Leadership uniquement' },
  { value: 'PRIVATE_ASSIGNEES', label: 'Privé — Personnes explicitement assignées' },
];

export const PROFILE_FUNCTION_LABELS = {
  referent_priere: 'Référent prière',
  coordinateur_planning: 'Coordinateur planning',
  intercesseur: 'Intercesseur',
  animateur: 'Animateur',
  autre: 'Autre',
};

export const PROFILE_FUNCTION_SHORT = {
  referent_priere: 'Réf. prière',
  coordinateur_planning: 'Coord. planning',
  intercesseur: 'Intercesseur',
  animateur: 'Animateur',
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