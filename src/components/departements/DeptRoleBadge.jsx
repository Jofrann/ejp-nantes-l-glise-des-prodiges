import React from 'react';
import { Crown, Star, User, Compass, Shield, Network } from 'lucide-react';

const ROLE_META = {
  responsable:  { label: 'Responsable',  icon: Crown,  cls: 'bg-secondary/15 text-secondary border-secondary/30' },
  referent:     { label: 'Référent',     icon: Star,   cls: 'bg-secondary/15 text-secondary border-secondary/30' },
  coordinateur: { label: 'Coordinateur', icon: Network, cls: 'bg-indigo-500/10 text-indigo-600 border-indigo-400/20' },
  adjoint:      { label: 'Adjoint',      icon: Shield, cls: 'bg-blue-500/10 text-blue-600 border-blue-400/20' },
  pilote:       { label: 'Pilote',       icon: Compass, cls: 'bg-rose-500/10 text-rose-600 border-rose-400/20' },
  serviteur:    { label: 'Serviteur',    icon: User,   cls: 'bg-surface text-muted-foreground border-border' },
  membre:       { label: 'Membre',       icon: User,   cls: 'bg-surface text-muted-foreground border-border' },
  admin:        { label: 'Admin',        icon: Crown,  cls: 'bg-danger/10 text-danger border-danger/20' },
};

export default function DeptRoleBadge({ role, size = 'sm' }) {
  const meta = ROLE_META[role] || ROLE_META.serviteur;
  const Icon = meta.icon;
  const sizeCls = size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span className={`inline-flex items-center ${meta.cls} border rounded-full font-medium uppercase tracking-wider ${sizeCls}`}>
      <Icon className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      {meta.label}
    </span>
  );
}