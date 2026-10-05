import React from 'react';
import { Calendar, Clock, MapPin, Users, Check, X, AlertCircle, UserCheck } from 'lucide-react';
import { formatDate, isUpcoming, WELCOME_PLAN_STATUS_LABELS, WELCOME_PLAN_STATUS_COLORS, WELCOME_POSITION_SHORT, WELCOME_ASSIGNMENT_STATUS_LABELS, WELCOME_ASSIGNMENT_STATUS_COLORS, VISITOR_STATUS_LABELS, VISITOR_STATUS_COLORS } from '@/lib/welcomeConstants';

export default function WelcomeOverviewTab({ welcomeData, isResponsable, currentUserId, colors, onNavigateTab }) {
  const { plans = [], assignments_by_plan = {}, visitors = [] } = welcomeData;

  const upcoming = (plans || []).filter(p => isUpcoming(p.date) && p.status !== 'cancelled' && p.status !== 'completed');
  const nextPlan = upcoming[0];
  const nextAssignments = nextPlan ? (assignments_by_plan[nextPlan.id] || []) : [];
  const myAssignments = nextAssignments.filter(a => a.user_id === currentUserId);
  const confirmedCount = nextAssignments.filter(a => a.status === 'confirmed').length;
  const vacantCount = nextAssignments.filter(a => a.status !== 'confirmed' && a.status !== 'declined').length;
  const visitorsToFollow = (visitors || []).filter(v => v.status === 'new' || v.status === 'contacted' || v.status === 'in_progress');

  if (!nextPlan) {
    return (
      <div className="text-center py-12">
        <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Aucun service d'accueil planifié.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* MEMBRE : Ton prochain service */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Ton prochain service</p>
        <p className="text-sm font-semibold text-foreground mb-1">{formatDate(nextPlan.date)}</p>
        {nextPlan.call_time && (
          <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Présence demandée : {nextPlan.call_time}
          </p>
        )}

        {myAssignments.length > 0 ? (
          <div className="space-y-2">
            {myAssignments.map(a => (
              <div key={a.id} className="flex items-center justify-between bg-surface/50 rounded-xl p-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Poste</p>
                  <p className="text-sm font-medium text-foreground">{WELCOME_POSITION_SHORT[a.position] || a.position}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Statut</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${WELCOME_ASSIGNMENT_STATUS_COLORS[a.status] || ''}`}>{WELCOME_ASSIGNMENT_STATUS_LABELS[a.status] || a.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Tu n'es pas encore affecté à ce service.</p>
        )}

        {nextPlan.instructions && (
          <div className="mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-400/20">
            <p className="text-[10px] uppercase tracking-widest text-amber-700 font-medium mb-1">Consigne</p>
            <p className="text-xs text-foreground">{nextPlan.instructions}</p>
          </div>
        )}
      </div>

      {/* RESPONSABLE : Vue de gestion */}
      {isResponsable && (
        <>
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Prochain service — vue responsable</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{confirmedCount}</p>
                <p className="text-[10px] text-muted-foreground">confirmés</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{vacantCount}</p>
                <p className="text-[10px] text-muted-foreground">à compléter</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{nextAssignments.length}</p>
                <p className="text-[10px] text-muted-foreground">postes</p>
              </div>
            </div>
            <button onClick={() => onNavigateTab?.('welcome_planning')} className={`mt-3 w-full text-xs ${colors.bg} ${colors.text} border ${colors.border} py-2 rounded-xl`}>
              Gérer le planning
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Visiteurs à suivre</p>
              <span className="text-xs text-muted-foreground">{visitorsToFollow.length}</span>
            </div>
            {visitorsToFollow.length === 0 ? (
              <p className="text-xs text-muted-foreground">Aucun visiteur à suivre.</p>
            ) : (
              <div className="space-y-2">
                {visitorsToFollow.slice(0, 5).map(v => (
                  <div key={v.id} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{v.first_name} {v.last_name || ''}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${VISITOR_STATUS_COLORS[v.status] || ''}`}>{VISITOR_STATUS_LABELS[v.status] || v.status}</span>
                  </div>
                ))}
                <button onClick={() => onNavigateTab?.('welcome_visitors')} className={`mt-2 text-xs ${colors.text}`}>Voir tout →</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}