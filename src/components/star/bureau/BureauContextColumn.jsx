import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Briefcase, Shield, Sparkles, Calendar, CheckCircle, Target, CalendarClock, BookOpen } from 'lucide-react';
import { isBureauLike, isAdmin } from '@/lib/permissions';

const DEFAULT_SHORTCUTS = [
  { key: 'agenda', icon: Calendar, label: 'Agenda', to: '/app/agenda' },
  { key: 'presences', icon: CheckCircle, label: 'Présences', to: '/app/presences' },
  { key: 'objectifs', icon: Target, label: 'Objectifs', to: '/app/objectifs' },
  { key: 'rendez-vous', icon: CalendarClock, label: 'Rendez-vous', to: '/app/rendez-vous' },
  { key: 'ressources', icon: BookOpen, label: 'Ressources', to: '/app/ressources' },
];

export default function BureauContextColumn({ events = [], user, favoriteShortcuts = [], showRightPanel = true }) {
  if (!showRightPanel) return null;

  const shortcuts = favoriteShortcuts.length > 0
    ? DEFAULT_SHORTCUTS.filter(s => favoriteShortcuts.includes(s.key))
    : DEFAULT_SHORTCUTS;

  const showDirection = isBureauLike(user) || isAdmin(user);

  return (
    <aside className="hidden xl:block w-72 flex-shrink-0 space-y-4">
      {/* Prochain programme */}
      {events.length > 0 && (
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs font-heading font-semibold text-foreground mb-3">Prochain programme</p>
          <Link to="/app/presences" className="block">
            <p className="text-sm font-semibold text-foreground">{events[0].title}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(events[0].event_date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
              {events[0].event_time && ` · ${events[0].event_time}`}
            </p>
            {events[0].location && (
              <p className="text-xs text-muted-foreground mt-0.5">{events[0].location}</p>
            )}
          </Link>
          <Link
            to="/app/presences"
            className="mt-3 flex items-center justify-center gap-1.5 w-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-medium py-2 rounded-xl hover:bg-secondary/20 transition-all"
          >
            Confirmer ma présence
          </Link>
        </div>
      )}

      {/* Raccourcis */}
      {shortcuts.length > 0 && (
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs font-heading font-semibold text-foreground mb-3">Raccourcis</p>
          <div className="space-y-1">
            {shortcuts.map(({ icon: Icon, label, to }) => (
              <Link key={to} to={to} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-surface transition-colors">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-foreground">{label}</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground/40 ml-auto" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Espace direction */}
      {showDirection && (
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs font-heading font-semibold text-foreground mb-3">Espace direction</p>
          <div className="space-y-1">
            {isBureauLike(user) && (
              <Link to="/app/supervision" className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-surface transition-colors">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-foreground">Supervision</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground/40 ml-auto" />
              </Link>
            )}
            {isAdmin(user) && (
              <Link to="/app/admin" className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-surface transition-colors">
                <Sparkles className="w-3.5 h-3.5 text-danger" />
                <span className="text-xs text-foreground">Administration</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground/40 ml-auto" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Personnaliser */}
      <Link
        to="/app/espace-personnel"
        className="flex items-center gap-2.5 px-3 py-3 glass-card rounded-2xl hover:shadow-sm transition-all"
      >
        <Briefcase className="w-3.5 h-3.5 text-secondary" />
        <span className="text-xs font-medium text-foreground">Personnaliser mon bureau</span>
        <ChevronRight className="w-3 h-3 text-muted-foreground/40 ml-auto" />
      </Link>
    </aside>
  );
}