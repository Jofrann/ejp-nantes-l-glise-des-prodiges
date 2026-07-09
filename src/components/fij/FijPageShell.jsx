import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import PageBreadcrumb from '@/components/navigation/PageBreadcrumb';

// Navigation par rôle — chaque rôle a son propre espace
export const PILOTE_NAV = [
  { to: '/app/departements/fij/pilote', label: 'Accueil', end: true },
  { to: '/app/departements/fij/pilote/mes-fij', label: 'Mes FIJ' },
  { to: '/app/departements/fij/pilote/cr', label: 'Comptes rendus' },
  { to: '/app/departements/fij/pilote/communications', label: 'Communications' },
  { to: '/app/departements/fij/pilote/documents', label: 'Documents' },
  { to: '/app/departements/fij/pilote/alertes', label: 'Alertes' },
  { to: '/app/departements/fij/coordination/pilotes', label: 'Pilotes' },
];

export const COORDINATION_NAV = [
  { to: '/app/departements/fij/coordination', label: 'Tableau', end: true },
  { to: '/app/departements/fij/coordination/registre', label: 'Registre' },
  { to: '/app/departements/fij/coordination/cr-jeudi', label: 'CR Jeudi' },
  { to: '/app/departements/fij/coordination/relances', label: 'Relances' },
  { to: '/app/departements/fij/coordination/ouvertures', label: 'Ouvertures' },
  { to: '/app/departements/fij/coordination/consecrations', label: 'Consécrations' },
  { to: '/app/departements/fij/coordination/pause', label: 'Pause' },
  { to: '/app/departements/fij/coordination/pilotes', label: 'Pilotes' },
  { to: '/app/departements/fij/coordination/communications', label: 'Comms' },
  { to: '/app/departements/fij/coordination/documents', label: 'Docs' },
  { to: '/app/departements/fij/coordination/alertes', label: 'Alertes' },
  { to: '/app/departements/fij/coordination/reporting', label: 'Reporting' },
  { to: '/app/departements/fij/coordination/transferts', label: 'Transferts' },
];

// L'espace Direction FIJ a été supprimé — les leaders consultent les indicateurs dans /app/direction

export function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-surface border border-border mb-4">
        {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
      {sub && <p className="text-xs text-muted-foreground max-w-xs mx-auto">{sub}</p>}
    </div>
  );
}

export function RoleShell({ role, title, subtitle, children, actions, requiredRoles, breadcrumbLabel }) {
  const location = useLocation();

  // Dérive la navigation de la route, pas du rôle utilisateur.
  // Permet à la direction d'utiliser l'espace coordination avec la bonne navigation.
  const routeRole = location.pathname.includes('/pilote') ? 'pilot'
    : location.pathname.includes('/coordination') ? 'coordination'
    : role;

  const navItems = routeRole === 'pilot' ? PILOTE_NAV
    : routeRole === 'coordination' ? COORDINATION_NAV
    : [];

  const hubPath = routeRole === 'pilot' ? '/app/departements/fij/pilote'
    : routeRole === 'coordination' ? '/app/departements/fij/coordination'
    : '/app/departements/fij';

  const hubLabel = routeRole === 'pilot' ? '← Espace pilote'
    : routeRole === 'coordination' ? '← Coordination'
    : '← FIJ';

  // Le contrôle d'accès utilise le rôle réel de l'utilisateur
  const hasAccess = !requiredRoles || requiredRoles.includes(role);

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center text-center px-5">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-5">
          <AlertTriangle className="w-6 h-6 text-destructive/60" />
        </div>
        <p className="text-sm font-semibold mb-1">Accès restreint</p>
        <p className="text-xs text-muted-foreground mb-5 max-w-xs">Cette page est réservée à la coordination et à la direction.</p>
        <Link to="/app/departements/fij" className="text-secondary text-sm font-medium">← Retour à l'accueil FIJ</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header sticky avec navigation */}
      <div className="sticky top-14 z-30 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4">
          {/* Fil d'Ariane */}
          <PageBreadcrumb
            items={[
              { label: 'Tableau de bord', to: '/app' },
              { label: 'Départements', to: '/app/departements' },
              { label: 'FIJ', to: '/app/departements/fij' },
              { label: breadcrumbLabel || title, to: location.pathname },
            ]}
            backTo={hubPath}
            backLabel={hubLabel}
            rightAction={actions}
          />
          {/* Navigation horizontale scrollable */}
          {navItems.length > 0 && (
            <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none">
              {navItems.map(item => {
                const active = item.end
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-surface'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {title && <h1 className="text-xl font-heading font-bold text-foreground mb-1">{title}</h1>}
          {subtitle && <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>}
          {children}
        </motion.div>
      </div>
    </div>
  );
}

// Compatibilité rétro : les pages existantes importent le default FijPageShell
export default function FijPageShell({ accessLevel, ...props }) {
  return <RoleShell role={accessLevel} {...props} />;
}