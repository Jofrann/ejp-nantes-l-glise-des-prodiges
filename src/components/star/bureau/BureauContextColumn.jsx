import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Briefcase, Shield, Sparkles, Calendar, CheckCircle, Target, CalendarClock, BookOpen } from 'lucide-react';
import BureauAgendaCourt from './BureauAgendaCourt';
import { isBureauLike, isAdmin } from '@/lib/permissions';

const DEFAULT_SHORTCUTS = [
  { key: 'agenda', icon: Calendar, label: 'Agenda', to: '/app/agenda' },
  { key: 'presences', icon: CheckCircle, label: 'Présences', to: '/app/presences' },
  { key: 'objectifs', icon: Target, label: 'Objectifs', to: '/app/objectifs' },
  { key: 'rendez-vous', icon: CalendarClock, label: 'Rendez-vous', to: '/app/rendez-vous' },
  { key: 'ressources', icon: BookOpen, label: 'Ressources', to: '/app/ressources' },
];

export default function BureauContextColumn({ events = [], user, favoriteShortcuts = [], showRightPanel = true, pref, departments = [], showAgenda = true }) {
  if (!showRightPanel) return null;

  const shortcuts = favoriteShortcuts.length > 0
    ? DEFAULT_SHORTCUTS.filter(s => favoriteShortcuts.includes(s.key))
    : DEFAULT_SHORTCUTS;

  const showDirection = isBureauLike(user) || isAdmin(user);

  return (
    <aside className="private-context-column w-72 flex-shrink-0 space-y-4">
      {showAgenda && <BureauAgendaCourt events={events} />}
      <div className="glass-card rounded-2xl p-4"><h2>Mon département</h2>{departments.length ? departments.map(department=><Link key={department.id} to={`/app/departements/${department.slug || department.id}`} className="private-department-link"><span className="private-department-icon"><Briefcase aria-hidden="true"/></span><span><b>{department.name}</b><small>Retrouver mon équipe</small></span><ChevronRight aria-hidden="true"/></Link>) : <><p className="text-sm text-muted-foreground mt-3">Aucun département rattaché pour le moment.</p><Link to="/app/service" className="private-inline-link">Mon service <ChevronRight/></Link></>}</div>
      <div className="glass-card private-personal-verse rounded-2xl p-4"><p className="private-eyebrow">MON VERSET</p><p>{pref?.personal_verse_text || "Chacun selon le don qu’il a reçu, employez-le à vous servir les uns les autres."}</p><small>{pref?.personal_verse_reference || '1 Pierre 4:10'}</small>{pref?.season_phrase&&<p className="mt-3">{pref.season_phrase}</p>}<Link to="/app/espace-personnel?section=verset" className="private-inline-link">Personnaliser mon verset <ChevronRight/></Link></div>

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
              <Link to="/app/pilotage" className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-surface transition-colors">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-foreground">Pilotage</span>
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