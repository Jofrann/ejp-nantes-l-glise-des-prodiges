import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import PageBreadcrumb from '@/components/navigation/PageBreadcrumb';
import {
  Home as HomeIcon, BarChart3, Users, FileText, Plus, Heart,
  PauseCircle, UserCheck, Mail, TrendingUp, FolderOpen, AlertTriangle,
  ArrowLeftRight
} from 'lucide-react';

export const FIJ_NAV = [
  { to: '/app/departements/fij', label: 'Accueil', icon: HomeIcon, roles: 'all' },
  { to: '/app/departements/fij/tableau-de-bord', label: 'Tableau de bord', icon: BarChart3, roles: ['coordination', 'direction'] },
  { to: '/app/departements/fij/mes-fij', label: 'Mes FIJ', icon: Users, roles: ['pilot', 'coordination', 'direction'] },
  { to: '/app/departements/fij/registre', label: 'Registre', icon: Users, roles: ['coordination', 'direction'] },
  { to: '/app/departements/fij/cr-hebdomadaires', label: 'CR', icon: FileText, roles: 'all' },
  { to: '/app/departements/fij/ouvertures', label: 'Ouvertures', icon: Plus, roles: ['coordination', 'direction'] },
  { to: '/app/departements/fij/consecrations', label: 'Consécrations', icon: Heart, roles: ['coordination', 'direction'] },
  { to: '/app/departements/fij/pause', label: 'Pause', icon: PauseCircle, roles: ['coordination', 'direction'] },
  { to: '/app/departements/fij/pilotes', label: 'Pilotes', icon: UserCheck, roles: ['coordination', 'direction'] },
  { to: '/app/departements/fij/communications', label: 'Comms', icon: Mail, roles: 'all' },
  { to: '/app/departements/fij/reporting', label: 'Reporting', icon: TrendingUp, roles: ['coordination', 'direction'] },
  { to: '/app/departements/fij/documents', label: 'Docs', icon: FolderOpen, roles: 'all' },
  { to: '/app/departements/fij/alertes', label: 'Alertes', icon: AlertTriangle, roles: 'all' },
  { to: '/app/departements/fij/transferts', label: 'Transferts', icon: ArrowLeftRight, roles: ['coordination', 'direction'] },
];

export function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-white/15 border-t-amber-400/80 rounded-full animate-spin" />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mb-4">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
      <p className="text-sm font-medium text-white mb-1">{title}</p>
      {sub && <p className="text-xs text-gray-500 max-w-xs mx-auto">{sub}</p>}
    </div>
  );
}

export default function FijPageShell({ accessLevel, title, subtitle, children, actions, requiredRoles }) {
  const location = useLocation();
  const navItems = FIJ_NAV.filter(item =>
    item.roles === 'all' || item.roles.includes(accessLevel)
  );

  const hasAccess = !requiredRoles || requiredRoles.includes(accessLevel);

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center text-center px-5">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
          <AlertTriangle className="w-6 h-6 text-red-400/60" />
        </div>
        <p className="text-sm font-semibold text-white mb-1">Accès restreint</p>
        <p className="text-xs text-gray-500 mb-5 max-w-xs">Cette page est réservée à la coordination et à la direction.</p>
        <Link to="/app/departements/fij" className="text-amber-400 text-sm">← Retour à l'accueil FIJ</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header sticky avec navigation */}
      <div className="sticky top-14 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4">
          {/* Fil d'Ariane */}
          <PageBreadcrumb
            items={[
              { label: 'Tableau de bord', to: '/app' },
              { label: 'Départements', to: '/app/departements' },
              { label: 'FIJ', to: '/app/departements/fij' },
              { label: title, to: location.pathname },
            ]}
            backTo="/app/departements/fij"
            backLabel="← FIJ"
            rightAction={actions}
          />
          {/* Navigation horizontale scrollable */}
          <div className="flex gap-1 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
            {navItems.map(item => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-amber-400/15 text-amber-400 border border-amber-400/20'
                      : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <item.icon className="w-3 h-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {subtitle && <p className="text-sm text-gray-500 mb-6">{subtitle}</p>}
          {children}
        </motion.div>
      </div>
    </div>
  );
}