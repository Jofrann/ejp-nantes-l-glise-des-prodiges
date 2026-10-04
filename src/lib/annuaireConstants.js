// Constantes partagées pour l'Annuaire EJP

export const BADGES = [
  { id: 'STAR', label: 'STAR', description: 'Serviteur actif', color: 'amber' },
  { id: 'ETUDIANT', label: 'Étudiant', description: 'Étudiant', color: 'blue' },
  { id: 'LEADER', label: 'Leader', description: 'Leader', color: 'purple' },
  { id: 'BERGERE', label: 'Bergère', description: 'Bergère', color: 'rose' },
  { id: 'ADMIN', label: 'Administratrice', description: 'Admin', color: 'green' },
];

export const BADGE_LABELS = {
  STAR: 'STAR',
  ETUDIANT: 'Étudiant',
  LEADER: 'Leader',
  BERGERE: 'Bergère',
  ADMIN: 'Administratrice',
  RESPONSABLE: 'Responsable',
  PILOTE_FIJ: 'Pilote FIJ',
  COORDINATION_FIJ: 'Coordination FIJ',
  BUREAU: 'Bureau',
};

export const DEPT_ROLES = [
  { id: 'serviteur', label: 'Serviteur' },
  { id: 'responsable', label: 'Responsable' },
  { id: 'adjoint', label: 'Adjoint' },
  { id: 'coordinateur', label: 'Coordinateur' },
  { id: 'referent', label: 'Référent' },
  { id: 'pilote', label: 'Pilote' },
  { id: 'membre', label: 'Membre' },
];

export const DEPT_ROLE_LABELS = {
  serviteur: 'Serviteur',
  responsable: 'Responsable',
  adjoint: 'Adjoint',
  coordinateur: 'Coordinateur',
  referent: 'Référent',
  pilote: 'Pilote',
  membre: 'Membre',
};

export const STATUS_LABELS = {
  pending: { label: 'En attente', cls: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
  active: { label: 'Actif', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
  suspended: { label: 'Suspendu', cls: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-400' },
  archived: { label: 'Archivé', cls: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-400' },
  rejected: { label: 'Refusé', cls: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-400' },
};

export function getInitials(first, last) {
  const f = (first || '').trim()[0] || '';
  const l = (last || '').trim()[0] || '';
  return (f + l).toUpperCase() || '?';
}

export function getBadgeLabel(badge) {
  return BADGE_LABELS[badge] || badge;
}

export function getRoleLabel(role) {
  return DEPT_ROLE_LABELS[role] || role;
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}