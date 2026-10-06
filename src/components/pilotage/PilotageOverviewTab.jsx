import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, Calendar, AlertCircle, Activity, ChevronRight,
  Clock, MapPin, AlertTriangle, Users
} from 'lucide-react';
import { HEALTH_META, ALERT_LEVEL_META } from '@/lib/pilotageConstants';

export default function PilotageOverviewTab({ data, onNavigateTab }) {
  const { overview } = data;
  const deptHealth = overview?.department_health || [];
  const deadlines = overview?.upcoming_deadlines || [];
  const attentionPoints = overview?.attention_points || [];
  const recentActivity = overview?.recent_activity || [];

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* A. Santé générale des départements */}
      <div>
        <h2 className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">Santé des départements</h2>
        <div className="glass-card border border-border rounded-2xl p-5">
          {deptHealth.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Pas encore suffisamment de données.</p>
          ) : (
            <div className="space-y-2.5">
              {deptHealth.slice(0, 10).map((dept) => {
                const meta = HEALTH_META[dept.health_status] || HEALTH_META.stable;
                return (
                  <Link
                    key={dept.id}
                    to={`/app/pilotage/departements/${dept.slug}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface transition-colors group"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${meta.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{dept.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {dept.member_count} membre{dept.member_count > 1 ? 's' : ''}
                        {dept.responsible_name ? ` · ${dept.responsible_name}` : ' · sans responsable'}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${meta.bg} ${meta.color}`}>
                      {dept.health_label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* B. Échéances importantes */}
      <div>
        <h2 className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">Échéances importantes</h2>
        <div className="glass-card border border-border rounded-2xl p-5">
          {deadlines.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Aucune échéance proche.</p>
          ) : (
            <div className="space-y-2.5">
              {deadlines.slice(0, 8).map((d, i) => {
                const isOverdue = d.date < today;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface/50">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isOverdue ? 'bg-danger/10' : 'bg-primary/10'
                    }`}>
                      {d.type === 'event' ? <Calendar className={`w-4 h-4 ${isOverdue ? 'text-danger' : 'text-primary'}`} /> :
                       d.type === 'meeting' ? <Users className={`w-4 h-4 ${isOverdue ? 'text-danger' : 'text-primary'}`} /> :
                       <Clock className={`w-4 h-4 ${isOverdue ? 'text-danger' : 'text-primary'}`} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{d.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {isOverdue ? 'En retard' : d.date}
                        {d.time ? ` · ${d.time}` : ''}
                        {d.location ? ` · ${d.location}` : ''}
                      </p>
                    </div>
                    {isOverdue && (
                      <span className="text-[10px] font-bold text-danger bg-danger/10 px-2 py-0.5 rounded-full">RETARD</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* C. Points d'attention */}
      <div>
        <h2 className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">Points d'attention</h2>
        {attentionPoints.length === 0 ? (
          <div className="glass-card border border-border rounded-2xl p-5 text-center">
            <p className="text-sm text-muted-foreground py-4">Aucun point d'attention critique. Tout est sous contrôle.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {attentionPoints.map((ap, i) => {
              const meta = ALERT_LEVEL_META[ap.level] || ALERT_LEVEL_META.ATTENTION;
              return (
                <button
                  key={i}
                  onClick={() => onNavigateTab?.('alerts')}
                  className="w-full glass-card border border-border rounded-xl p-4 text-left hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                      <AlertTriangle className={`w-4 h-4 ${meta.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{ap.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{ap.description}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color} ${meta.border} border`}>
                      {meta.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* D. Activité récente */}
      <div>
        <h2 className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">Activité récente</h2>
        <div className="glass-card border border-border rounded-2xl p-5">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Pas d'activité significative récente.</p>
          ) : (
            <div className="space-y-2.5">
              {recentActivity.map((act, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface/50">
                  <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{act.title}</p>
                    <p className="text-xs text-muted-foreground">{act.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}