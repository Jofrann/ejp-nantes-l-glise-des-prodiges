import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Home, ChevronRight, Users } from 'lucide-react';

const EVENT_TYPE_LABELS = {
  culte: 'Culte',
  ejp: 'EJP',
  formation: 'Formation',
  rendez_vous: 'Rendez-vous',
  reunion: 'Réunion',
  service: 'Service',
  special: 'Temps fort',
  autre: 'Autre',
};

export default function PilotageMinistryLifeTab({ data }) {
  const { ministry_life } = data;
  const events = ministry_life?.upcoming_events || [];
  const fijSummary = ministry_life?.fij_summary || null;
  const deptActivities = ministry_life?.department_activities || [];

  return (
    <div className="space-y-6">
      {/* Événements à venir */}
      <div>
        <h2 className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">Événements à venir</h2>
        <div className="glass-card border border-border rounded-2xl p-5">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Aucun événement programmé.</p>
          ) : (
            <div className="space-y-2.5">
              {events.slice(0, 10).map((ev) => (
                <Link
                  key={ev.id}
                  to="/app/agenda"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{ev.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{ev.date}</span>
                      {ev.time && <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{ev.time}</span>}
                      {ev.location && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{ev.location}</span>}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground bg-surface border border-border rounded px-1.5 py-0.5">
                    {EVENT_TYPE_LABELS[ev.event_type] || ev.event_type}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Synthèse FIJ */}
      {fijSummary && fijSummary.total > 0 && (
        <div>
          <h2 className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">Familles d'Impact Jeune</h2>
          <div className="glass-card border border-border rounded-2xl p-5">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <p className="text-xl font-heading font-bold text-foreground">{fijSummary.active}</p>
                <p className="text-[10px] text-muted-foreground">Actives</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-heading font-bold text-warning">{fijSummary.paused}</p>
                <p className="text-[10px] text-muted-foreground">En pause</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-heading font-bold text-secondary">{fijSummary.total_members}</p>
                <p className="text-[10px] text-muted-foreground">Membres</p>
              </div>
            </div>
            <div className="space-y-2">
              {fijSummary.fijs.slice(0, 6).map((f) => (
                <Link
                  key={f.id}
                  to="/app/responsabilites/fij-coordination"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface transition-colors"
                >
                  <Home className="w-4 h-4 text-secondary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.city} · {f.member_count} membres</p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    f.status === 'active' ? 'bg-success/10 text-success' :
                    f.status === 'paused' ? 'bg-warning/10 text-warning' :
                    'bg-muted/10 text-muted-foreground'
                  }`}>
                    {f.status === 'active' ? 'Active' : f.status === 'paused' ? 'En pause' : f.status === 'opening' ? 'Ouverture' : 'Fermée'}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Activités par département */}
      <div>
        <h2 className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">Prochaines activités</h2>
        <div className="glass-card border border-border rounded-2xl p-5">
          <div className="space-y-2">
            {deptActivities.filter(d => d.next_activity_title).map((d, i) => (
              <Link
                key={i}
                to={`/app/pilotage/departements/${d.slug}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface transition-colors"
              >
                <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{d.next_activity_title}</p>
                  <p className="text-xs text-muted-foreground">{d.department_name} · {d.next_activity_date}</p>
                </div>
              </Link>
            ))}
            {deptActivities.filter(d => d.next_activity_title).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune activité programmée.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}