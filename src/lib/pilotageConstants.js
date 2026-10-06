// src/lib/pilotageConstants.js
// Constantes pour l'espace Pilotage global

export const PILOTAGE_TABS = [
  { id: 'overview', label: 'Vue globale', icon: 'LayoutDashboard' },
  { id: 'departments', label: 'Départements', icon: 'Building2' },
  { id: 'people', label: 'Personnes', icon: 'Users' },
  { id: 'growth', label: 'Croissance', icon: 'TrendingUp' },
  { id: 'ministry', label: 'Vie du ministère', icon: 'Calendar' },
  { id: 'alerts', label: 'Alertes', icon: 'AlertCircle' },
  { id: 'decisions', label: 'Décisions & suivis', icon: 'CheckSquare' },
];

export const ALERT_LEVEL_META = {
  INFO: { label: 'Info', color: 'text-info', bg: 'bg-info/10', border: 'border-info/20', dot: 'bg-info' },
  ATTENTION: { label: 'Attention', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20', dot: 'bg-warning' },
  IMPORTANT: { label: 'Important', color: 'text-orange-600', bg: 'bg-orange-500/10', border: 'border-orange-400/20', dot: 'bg-orange-500' },
  CRITIQUE: { label: 'Critique', color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20', dot: 'bg-danger' },
};

export const ALERT_LEVEL_ORDER = { CRITIQUE: 0, IMPORTANT: 1, ATTENTION: 2, INFO: 3 };

export const HEALTH_META = {
  stable: { label: 'Stable', color: 'text-success', bg: 'bg-success/10', dot: 'bg-success' },
  watch: { label: 'Suivi nécessaire', color: 'text-warning', bg: 'bg-warning/10', dot: 'bg-warning' },
  attention: { label: 'Attention requise', color: 'text-danger', bg: 'bg-danger/10', dot: 'bg-danger' },
};

export const PRIORITY_META = {
  low: { label: 'Basse', color: 'text-muted-foreground', bg: 'bg-muted/10', border: 'border-border' },
  normal: { label: 'Normale', color: 'text-info', bg: 'bg-info/10', border: 'border-info/20' },
  high: { label: 'Haute', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
  urgent: { label: 'Urgente', color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20' },
};

export const DECISION_STATUS_META = {
  open: { label: 'Ouverte', color: 'text-info', bg: 'bg-info/10', border: 'border-info/20' },
  in_progress: { label: 'En cours', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
  resolved: { label: 'Résolue', color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
  cancelled: { label: 'Annulée', color: 'text-muted-foreground', bg: 'bg-muted/10', border: 'border-border' },
};

export const SOURCE_TYPE_LABELS = {
  logistics_task: 'Tâche logistique',
  sound_incident: 'Incident sono',
  coordination_followup: 'Suivi coordination',
  coordination_attention: "Point d'attention",
  prayer_request: 'Demande de prière',
  welcome_visitor: 'Visiteur',
  fij_alert: 'Alerte FIJ',
  event: 'Événement',
  department: 'Département',
  manual: 'Manuel',
};