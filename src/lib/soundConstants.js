/**
 * soundConstants.js — Constantes et labels pour les modules Sonorisation (frontend).
 */

export const POSITION_LABELS = {
  foh: 'Console façade (FOH)',
  monitors: 'Console retours',
  stage: 'Plateau',
  mics: 'Micros',
  setup: 'Installation',
  cabling: 'Câblage',
  broadcast: 'Diffusion',
  streaming: 'Streaming / Broadcast',
  tech_assist: 'Assistance technique',
  autre: 'Autre',
};

export const POSITION_SHORT = {
  foh: 'FOH',
  monitors: 'Retours',
  stage: 'Plateau',
  mics: 'Micros',
  setup: 'Installation',
  cabling: 'Câblage',
  broadcast: 'Diffusion',
  streaming: 'Streaming',
  tech_assist: 'Assistance',
  autre: 'Autre',
};

export const POSITION_OPTIONS = [
  { value: 'foh', label: 'Console façade (FOH)' },
  { value: 'monitors', label: 'Console retours' },
  { value: 'stage', label: 'Plateau' },
  { value: 'mics', label: 'Micros' },
  { value: 'setup', label: 'Installation' },
  { value: 'cabling', label: 'Câblage' },
  { value: 'broadcast', label: 'Diffusion' },
  { value: 'streaming', label: 'Streaming / Broadcast' },
  { value: 'tech_assist', label: 'Assistance technique' },
  { value: 'autre', label: 'Autre' },
];

export const PLAN_STATUS_LABELS = {
  draft: 'Brouillon',
  preparing: 'Préparation',
  ready: 'Prêt',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

export const PLAN_STATUS_COLORS = {
  draft: 'bg-surface text-muted-foreground border-border',
  preparing: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
  ready: 'bg-green-500/10 text-green-600 border-green-400/20',
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

export const EQUIPMENT_CATEGORY_LABELS = {
  console: 'Console',
  mic: 'Micro',
  speaker: 'Enceinte',
  cable: 'Câble',
  di: 'DI',
  computer: 'Ordinateur',
  audio_interface: 'Interface audio',
  headphone: 'Casque',
  stand: 'Pied',
  adapter: 'Adaptateur',
  other: 'Autre',
};

export const EQUIPMENT_STATUS_LABELS = {
  available: 'Disponible',
  in_use: 'En utilisation',
  maintenance: 'Maintenance',
  broken: 'En panne',
  missing: 'Introuvable',
  retired: 'Retiré',
};

export const EQUIPMENT_STATUS_COLORS = {
  available: 'bg-green-500/10 text-green-600 border-green-400/20',
  in_use: 'bg-blue-500/10 text-blue-600 border-blue-400/20',
  maintenance: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
  broken: 'bg-red-500/10 text-red-600 border-red-400/20',
  missing: 'bg-orange-500/10 text-orange-600 border-orange-400/20',
  retired: 'bg-surface text-muted-foreground border-border',
};

export const INCIDENT_SEVERITY_LABELS = {
  info: 'Information',
  low: 'Mineur',
  medium: 'Modéré',
  high: 'Important',
  critical: 'Critique',
};

export const INCIDENT_SEVERITY_COLORS = {
  info: 'bg-blue-500/10 text-blue-600 border-blue-400/20',
  low: 'bg-green-500/10 text-green-600 border-green-400/20',
  medium: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
  high: 'bg-orange-500/10 text-orange-600 border-orange-400/20',
  critical: 'bg-red-500/10 text-red-600 border-red-400/20',
};

export const INCIDENT_STATUS_LABELS = {
  open: 'Ouvert',
  in_progress: 'En cours',
  resolved: 'Résolu',
  closed: 'Clôturé',
};

export const INCIDENT_STATUS_COLORS = {
  open: 'bg-red-500/10 text-red-600 border-red-400/20',
  in_progress: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
  resolved: 'bg-green-500/10 text-green-600 border-green-400/20',
  closed: 'bg-surface text-muted-foreground border-border',
};

export const CHECKLIST_ITEM_STATE_LABELS = {
  todo: 'À faire',
  done: 'Terminé',
  problem: 'Problème',
};

export const CHECKLIST_ITEM_STATE_COLORS = {
  todo: 'bg-surface text-muted-foreground border-border',
  done: 'bg-green-500/10 text-green-600 border-green-400/20',
  problem: 'bg-red-500/10 text-red-600 border-red-400/20',
};

export const CHECKLIST_RUN_STATUS_LABELS = {
  in_progress: 'En cours',
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