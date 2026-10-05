/**
 * logisticsConstants.js — Constantes et labels pour les modules Intendance (frontend).
 */

export const LOG_PLAN_STATUS_LABELS = {
  draft: 'Brouillon',
  preparing: 'En préparation',
  ready: 'Prêt',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

export const LOG_PLAN_STATUS_COLORS = {
  draft: 'bg-surface text-muted-foreground border-border',
  preparing: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
  ready: 'bg-blue-500/10 text-blue-600 border-blue-400/20',
  completed: 'bg-green-500/10 text-green-600 border-green-400/20',
  cancelled: 'bg-red-500/10 text-red-600 border-red-400/20',
};

export const TASK_STATUS_LABELS = {
  todo: 'À faire',
  in_progress: 'En cours',
  done: 'Terminé',
  blocked: 'Bloqué',
};

export const TASK_STATUS_COLORS = {
  todo: 'bg-surface text-muted-foreground border-border',
  in_progress: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
  done: 'bg-green-500/10 text-green-600 border-green-400/20',
  blocked: 'bg-red-500/10 text-red-600 border-red-400/20',
};

export const TASK_STATUS_OPTIONS = [
  { value: 'todo', label: 'À faire' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'done', label: 'Terminé' },
  { value: 'blocked', label: 'Bloqué' },
];

export const TASK_PRIORITY_LABELS = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
};

export const TASK_PRIORITY_COLORS = {
  low: 'bg-surface text-muted-foreground border-border',
  medium: 'bg-blue-500/10 text-blue-600 border-blue-400/20',
  high: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
};

export const TASK_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Basse' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Haute' },
];

export const NEED_CATEGORY_LABELS = {
  materiel: 'Matériel',
  mobilier: 'Mobilier',
  consommable: 'Consommable',
  transport: 'Transport',
  installation: 'Installation',
  autre: 'Autre',
};

export const NEED_CATEGORY_OPTIONS = [
  { value: 'materiel', label: 'Matériel' },
  { value: 'mobilier', label: 'Mobilier' },
  { value: 'consommable', label: 'Consommable' },
  { value: 'transport', label: 'Transport' },
  { value: 'installation', label: 'Installation' },
  { value: 'autre', label: 'Autre' },
];

export const NEED_STATUS_LABELS = {
  requested: 'Demandé',
  approved: 'Approuvé',
  in_progress: 'En cours',
  fulfilled: 'Satisfait',
  cancelled: 'Annulé',
};

export const NEED_STATUS_COLORS = {
  requested: 'bg-blue-500/10 text-blue-600 border-blue-400/20',
  approved: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
  in_progress: 'bg-purple-500/10 text-purple-600 border-purple-400/20',
  fulfilled: 'bg-green-500/10 text-green-600 border-green-400/20',
  cancelled: 'bg-surface text-muted-foreground border-border',
};

export const NEED_STATUS_OPTIONS = [
  { value: 'requested', label: 'Demandé' },
  { value: 'approved', label: 'Approuvé' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'fulfilled', label: 'Satisfait' },
  { value: 'cancelled', label: 'Annulé' },
];

export const EQUIPMENT_CATEGORY_LABELS = {
  tables: 'Tables',
  chaises: 'Chaises',
  barrieres: 'Barrières',
  rallonges: 'Rallonges',
  signaletique: 'Signalétique',
  nappes: 'Nappes',
  supports: 'Supports',
  caisses: 'Caisses',
  petit_materiel: 'Petit matériel',
  autre: 'Autre',
};

export const EQUIPMENT_CATEGORY_OPTIONS = [
  { value: 'tables', label: 'Tables' },
  { value: 'chaises', label: 'Chaises' },
  { value: 'barrieres', label: 'Barrières' },
  { value: 'rallonges', label: 'Rallonges' },
  { value: 'signaletique', label: 'Signalétique' },
  { value: 'nappes', label: 'Nappes' },
  { value: 'supports', label: 'Supports' },
  { value: 'caisses', label: 'Caisses' },
  { value: 'petit_materiel', label: 'Petit matériel' },
  { value: 'autre', label: 'Autre' },
];

export const EQUIPMENT_STATUS_LABELS = {
  available: 'Disponible',
  in_use: 'En usage',
  maintenance: 'Maintenance',
  missing: 'Manquant',
  retired: 'Retiré',
};

export const EQUIPMENT_STATUS_COLORS = {
  available: 'bg-green-500/10 text-green-600 border-green-400/20',
  in_use: 'bg-blue-500/10 text-blue-600 border-blue-400/20',
  maintenance: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
  missing: 'bg-red-500/10 text-red-600 border-red-400/20',
  retired: 'bg-surface text-muted-foreground border-border',
};

export const PROFILE_FUNCTION_LABELS = {
  installation: 'Installation',
  rangement: 'Rangement',
  materiel: 'Matériel',
  transport: 'Transport',
  consommables: 'Consommables',
  responsable_logistique: 'Responsable logistique',
  autre: 'Autre',
};

export const PROFILE_FUNCTION_SHORT = {
  installation: 'Installation',
  rangement: 'Rangement',
  materiel: 'Matériel',
  transport: 'Transport',
  consommables: 'Consommables',
  responsable_logistique: 'Resp. logistique',
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