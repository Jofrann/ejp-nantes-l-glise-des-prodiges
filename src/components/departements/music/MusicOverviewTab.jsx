import React, { useState } from 'react';
import { Calendar, Clock, Music, AlertCircle, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import {
  POSITION_LABELS, ASSIGNMENT_STATUS_LABELS, ASSIGNMENT_STATUS_COLORS,
  PLAN_STATUS_LABELS, PLAN_STATUS_COLORS, formatDate, isUpcoming
} from '@/lib/musicConstants';

/**
 * MusicOverviewTab — Aperçu spécialisé Prodiges Musique.
 *
 * Vue membre : "Ton prochain service" (poste, répétition, setlist, confirmer).
 * Vue responsable : "Prochain service" (équipe, postes à couvrir, confirmations, alertes).
 */
export default function MusicOverviewTab({
  musicData, isResponsable, currentUserId, colors, onNavigateTab
}) {
  const { plans = [], assignments_by_plan = {}, rehearsals_by_plan = {}, setlist_by_plan = {} } = musicData;

  // Trouver le prochain service à venir
  const upcomingPlans = (plans || [])
    .filter(p => p.status !== 'cancelled' && p.status !== 'completed' && isUpcoming(p.date))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const nextPlan = upcomingPlans[0];

  // Mes affectations à venir
  const myUpcomingAssignments = (plans || [])
    .filter(p => p.status !== 'cancelled' && isUpcoming(p.date))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(p => ({
      plan: p,
      myAssignment: (assignments_by_plan[p.id] || []).find(a => a.user_id === currentUserId),
    }))
    .filter(x => x.myAssignment);

  if (!nextPlan && myUpcomingAssignments.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Aucun service musical n'est encore planifié.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {nextPlan && (
        isResponsable
          ? <ResponsableNextService plan={nextPlan} assignments={assignments_by_plan[nextPlan.id] || []} rehearsal={(rehearsals_by_plan[nextPlan.id] || [])[0]} setlist={setlist_by_plan[nextPlan.id] || []} colors={colors} onNavigateTab={onNavigateTab} />
          : <MemberNextService plan={nextPlan} myAssignment={(assignments_by_plan[nextPlan.id] || []).find(a => a.user_id === currentUserId)} rehearsal={(rehearsals_by_plan[nextPlan.id] || [])[0]} setlist={setlist_by_plan[nextPlan.id] || []} colors={colors} onNavigateTab={onNavigateTab} />
      )}

      {/* Mes prochaines affectations */}
      {myUpcomingAssignments.length > 1 && (
        <section>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Mes prochaines affectations</p>
          <div className="space-y-2">
            {myUpcomingAssignments.slice(1, 5).map(({ plan, myAssignment }) => (
              <button
                key={plan.id}
                onClick={() => onNavigateTab('music_planning')}
                className="w-full flex items-center gap-3 bg-card border border-border hover:border-secondary/30 rounded-xl p-3 transition-all text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{plan.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(plan.date)}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg border ${ASSIGNMENT_STATUS_COLORS[myAssignment.status] || ''}`}>
                  {POSITION_LABELS[myAssignment.position] || myAssignment.position}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function MemberNextService({ plan, myAssignment, rehearsal, setlist, colors, onNavigateTab }) {
  if (!myAssignment) {
    return (
      <section>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Prochain service</p>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm font-semibold text-foreground">{plan.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{formatDate(plan.date)} {plan.start_time && `— ${plan.start_time}`}</p>
          <p className="text-xs text-muted-foreground mt-3">Tu n'es pas encore affecté(e) à ce service.</p>
          <button onClick={() => onNavigateTab('music_planning')} className={`mt-3 text-xs ${colors.text} font-medium`}>
            Voir le planning →
          </button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Ton prochain service</p>
      <div className={`bg-card border ${colors.border} rounded-2xl p-5`}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-base font-bold text-foreground">{plan.title}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{formatDate(plan.date)} {plan.start_time && `— ${plan.start_time}`}</p>
          </div>
          <span className={`text-[10px] px-2 py-1 rounded-lg border ${PLAN_STATUS_COLORS[plan.status] || PLAN_STATUS_COLORS.draft}`}>
            {PLAN_STATUS_LABELS[plan.status] || plan.status}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Music className={`w-4 h-4 ${colors.text}`} />
            <span className="text-xs text-muted-foreground">Ton poste :</span>
            <span className="text-sm font-semibold text-foreground">{POSITION_LABELS[myAssignment.position] || myAssignment.position}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Statut :</span>
            <span className={`text-xs px-2 py-0.5 rounded-lg border ${ASSIGNMENT_STATUS_COLORS[myAssignment.status] || ASSIGNMENT_STATUS_COLORS.assigned}`}>
              {ASSIGNMENT_STATUS_LABELS[myAssignment.status] || myAssignment.status}
            </span>
          </div>

          {rehearsal && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Répétition :</span>
              <span className="text-xs text-foreground">{formatDate(rehearsal.date)} {rehearsal.start_time && `— ${rehearsal.start_time}`}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Setlist :</span>
            <span className="text-xs text-foreground">{setlist.length > 0 ? `${setlist.length} chant${setlist.length > 1 ? 's' : ''}` : 'Non disponible'}</span>
          </div>
        </div>

        {myAssignment.status === 'assigned' && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onNavigateTab('music_planning')}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-xl py-2.5 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Je confirme
            </button>
            <button
              onClick={() => onNavigateTab('music_planning')}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-red-600 bg-red-500/10 hover:bg-red-500/20 border border-red-400/20 rounded-xl py-2.5 transition-all"
            >
              <XCircle className="w-3.5 h-3.5" /> Je ne suis pas disponible
            </button>
          </div>
        )}

        {setlist.length > 0 && (
          <button onClick={() => onNavigateTab('music_setlists')} className={`mt-3 text-xs ${colors.text} font-medium`}>
            Voir la setlist →
          </button>
        )}
      </div>
    </section>
  );
}

function ResponsableNextService({ plan, assignments, rehearsal, setlist, colors, onNavigateTab }) {
  const confirmed = assignments.filter(a => a.status === 'confirmed').length;
  const declined = assignments.filter(a => a.status === 'declined').length;
  const assigned = assignments.length;
  const positionsCovered = new Set(assignments.filter(a => a.status !== 'declined').map(a => a.position));
  const allPositions = ['chant_lead', 'choriste', 'clavier', 'guitare', 'basse', 'batterie'];
  const missingPositions = allPositions.filter(p => !positionsCovered.has(p));

  return (
    <section>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Prochain service</p>
      <div className={`bg-card border ${colors.border} rounded-2xl p-5`}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-base font-bold text-foreground">{plan.title}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{formatDate(plan.date)} {plan.start_time && `— ${plan.start_time}`}</p>
          </div>
          <span className={`text-[10px] px-2 py-1 rounded-lg border ${PLAN_STATUS_COLORS[plan.status] || PLAN_STATUS_COLORS.draft}`}>
            {PLAN_STATUS_LABELS[plan.status] || plan.status}
          </span>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Équipe</span>
            <span className="text-sm font-semibold text-foreground">{assigned} affecté{assigned > 1 ? 's' : ''}</span>
          </div>
          {missingPositions.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-600">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>À couvrir : {missingPositions.map(p => POSITION_LABELS[p]).join(', ')}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Confirmations</span>
            <span className="text-sm font-semibold text-foreground">{confirmed}/{assigned}</span>
          </div>
          {declined > 0 && (
            <div className="flex items-center gap-2 text-xs text-red-600">
              <XCircle className="w-3.5 h-3.5" />
              <span>{declined} décliné{declined > 1 ? 's' : ''}</span>
            </div>
          )}
          {rehearsal && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Répétition</span>
              <span className="text-xs text-foreground">{formatDate(rehearsal.date)} — {rehearsal.start_time}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Setlist</span>
            <span className="text-xs text-foreground">{setlist.length} chant{setlist.length > 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onNavigateTab('music_planning')}
            className={`flex-1 text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border} rounded-xl py-2.5 hover:brightness-110 transition-all`}
          >
            Affecter l'équipe
          </button>
          <button
            onClick={() => onNavigateTab('music_setlists')}
            className="flex-1 text-xs font-medium bg-surface border border-border text-muted-foreground hover:text-foreground rounded-xl py-2.5 transition-all"
          >
            Voir la setlist
          </button>
        </div>
      </div>
    </section>
  );
}