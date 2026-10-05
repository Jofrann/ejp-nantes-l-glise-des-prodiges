/**
 * coordinationConstants.js — Constantes et labels pour les modules Coordination (frontend).
 */

export const COORD_PLAN_TYPE_LABELS = {
  meeting: 'Réunion',
  follow_up: 'Suivi',
  deadline: 'Échéance',
  coordination: 'Coordination',
  other: 'Autre',
};

export const COORD_PLAN_TYPE_SHORT = {
  meeting: 'Réunion',
  follow_up: 'Suivi',
  deadline: 'Échéance',
  coordination: 'Coord.',
  other: 'Autre',
};

export const COORD_PLAN_STATUS_LABELS = {
  draft: 'Brouillon',
  planned: 'Planifié',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

export const COORD_PLAN_STATUS_COLORS = {
  draft: 'bg-surface text-muted-foreground border-border',
  planned: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
  confirmed: 'bg-blue-500/10 text-blue-600 border-blue-400/20',
  completed: 'bg-green-500/10 text-green-600 border-green-400/20',
  cancelled: 'bg-red-500/10 text-red-600 border-red-400/20',
};

export const FOLLOWUP_STATUS_LABELS = {
  todo: 'À faire',
  in_progress: 'En cours',
  waiting: 'En attente',
  done: 'Terminé',
  cancelled: 'Annulé',
};

export const FOLLOWUP_STATUS_COLORS = {
  todo: 'bg-surface text-muted-foreground border-border',
  in_progress: 'bg-blue-500/10 text-blue-600 border-blue-400/20',
  waiting: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
  done: 'bg-green-500/10 text-green-600 border-green-400/20',
  cancelled: 'bg-red-500/10 text-red-600 border-red-400/20',
};

export const FOLLOWUP_PRIORITY_LABELS = {
  low: 'Basse',
  normal: 'Normale',
  high: 'Haute',
  urgent: 'Urgente',
};

export const FOLLOWUP_PRIORITY_COLORS = {
  low: 'bg-surface text-muted-foreground border-border',
  normal: 'bg-blue-500/10 text-blue-600 border-blue-400/20',
  high: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
  urgent: 'bg-red-500/10 text-red-600 border-red-400/20',
};

export const FOLLOWUP_SOURCE_LABELS = {
  meeting: 'Réunion',
  request: 'Demande',
  decision: 'Décision',
  event: 'Événement',
  internal: 'Interne',
  other: 'Autre',
};

export const ATTENTION_SEVERITY_LABELS = {
  info: 'Info',
  watch: 'À surveiller',
  action: 'Action',
  urgent: 'Urgent',
};

export const ATTENTION_SEVERITY_COLORS = {
  info: 'bg-blue-500/10 text-blue-600 border-blue-400/20',
  watch: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
  action: 'bg-orange-500/10 text-orange-600 border-orange-400/20',
  urgent: 'bg-red-500/10 text-red-600 border-red-400/20',
};

export const ATTENTION_STATUS_LABELS = {
  open: 'Ouvert',
  in_progress: 'En cours',
  resolved: 'Résolu',
  dismissed: 'Écarté',
};

export const ATTENTION_STATUS_COLORS = {
  open: 'bg-red-500/10 text-red-600 border-red-400/20',
  in_progress: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
  resolved: 'bg-green-500/10 text-green-600 border-green-400/20',
  dismissed: 'bg-surface text-muted-foreground border-border',
};

export const MEETING_STATUS_LABELS = {
  planned: 'Planifiée',
  completed: 'Terminée',
  cancelled: 'Annulée',
};

export const MEETING_STATUS_COLORS = {
  planned: 'bg-blue-500/10 text-blue-600 border-blue-400/20',
  completed: 'bg-green-500/10 text-green-600 border-green-400/20',
  cancelled: 'bg-red-500/10 text-red-600 border-red-400/20',
};

export const REPORT_STATUS_LABELS = {
  draft: 'Brouillon',
  submitted: 'Soumis',
  validated: 'Validé',
  correction_required: 'Correction requise',
};

export const REPORT_STATUS_COLORS = {
  draft: 'bg-surface text-muted-foreground border-border',
  submitted: 'bg-blue-500/10 text-blue-600 border-blue-400/20',
  validated: 'bg-green-500/10 text-green-600 border-green-400/20',
  correction_required: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
};

export const PROFILE_FUNCTION_LABELS = {
  coordinateur: 'Coordinateur',
  referent_coordination: 'Référent coordination',
  secretaire: 'Secrétaire',
  membre_coordination: 'Membre coordination',
  autre: 'Autre',
};

export const PROFILE_FUNCTION_SHORT = {
  coordinateur: 'Coord.',
  referent_coordination: 'Réf. coord.',
  secretaire: 'Secr.',
  membre_coordination: 'Membre',
  autre: 'Autre',
};

export const PROFILE_FUNCTION_OPTIONS = [
  { value: 'coordinateur', label: 'Coordinateur' },
  { value: 'referent_coordination', label: 'Référent coordination' },
  { value: 'secretaire', label: 'Secrétaire' },
  { value: 'membre_coordination', label: 'Membre coordination' },
  { value: 'autre', label: 'Autre' },
];

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

export function isOverdue(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d < today;
}