import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle2, ListChecks, ArrowRight, Users } from 'lucide-react';
import { formatDate, formatDateShort, isUpcoming, isOverdue, FOLLOWUP_STATUS_LABELS, FOLLOWUP_STATUS_COLORS, FOLLOWUP_PRIORITY_COLORS, ATTENTION_SEVERITY_LABELS, ATTENTION_SEVERITY_COLORS, MEETING_STATUS_LABELS, MEETING_STATUS_COLORS } from '@/lib/coordinationConstants';

export default function CoordinationOverviewTab({ coordinationData, isResponsable, currentUserId, colors, onNavigateTab }) {
  const { followups = [], attention_points = [], meetings = [], all_followups_count = 0 } = coordinationData;

  const myFollowups = followups.filter(f => f.assigned_to === currentUserId || f.created_by === currentUserId);
  const myActiveFollowups = myFollowups.filter(f => f.status !== 'done' && f.status !== 'cancelled');
  const overdueFollowups = myActiveFollowups.filter(f => isOverdue(f.due_date));
  const nextAction = myActiveFollowups
    .filter(f => f.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0] || myActiveFollowups[0];

  const openAttention = attention_points.filter(a => a.status === 'open' || a.status === 'in_progress');
  const upcomingMeetings = (meetings || [])
    .filter(m => isUpcoming(m.date) && m.status === 'planned')
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const nextMeeting = upcomingMeetings[0];

  return (
    <div className="space-y-5">
      {/* PROCHAINE ACTION */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Prochaine action</p>
        {nextAction ? (
          <button
            onClick={() => onNavigateTab?.('coordination_followups')}
            className="w-full text-left flex items-center justify-between hover:bg-surface/50 -m-2 p-2 rounded-xl transition-colors"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">{nextAction.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${FOLLOWUP_STATUS_COLORS[nextAction.status] || ''}`}>{FOLLOWUP_STATUS_LABELS[nextAction.status] || nextAction.status}</span>
                {nextAction.due_date && (
                  <span className={`text-xs ${isOverdue(nextAction.due_date) ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {isOverdue(nextAction.due_date) ? 'En retard — ' : 'Échéance — '}{formatDateShort(nextAction.due_date)}
                  </span>
                )}
                {nextAction.assigned_to_name && (
                  <span className="text-xs text-muted-foreground">· {nextAction.assigned_to_name}</span>
                )}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ) : (
          <p className="text-sm text-muted-foreground">Aucune action en cours.</p>
        )}
      </div>

      {/* PROCHAINE RÉUNION */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Prochaine réunion</p>
        {nextMeeting ? (
          <button
            onClick={() => onNavigateTab?.('coordination_meetings')}
            className="w-full text-left flex items-center justify-between hover:bg-surface/50 -m-2 p-2 rounded-xl transition-colors"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">{nextMeeting.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${MEETING_STATUS_COLORS[nextMeeting.status] || ''}`}>{MEETING_STATUS_LABELS[nextMeeting.status] || nextMeeting.status}</span>
                <span className="text-xs text-muted-foreground">{formatDateShort(nextMeeting.date)} {nextMeeting.start_time && `· ${nextMeeting.start_time}`}</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ) : (
          <p className="text-sm text-muted-foreground">Aucune réunion de coordination prévue.</p>
        )}
      </div>

      {/* POINTS D'ATTENTION */}
      {openAttention.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Points d'attention</p>
            <span className="text-xs text-muted-foreground">{openAttention.length}</span>
          </div>
          <div className="space-y-2">
            {openAttention.slice(0, 3).map(a => (
              <button
                key={a.id}
                onClick={() => onNavigateTab?.('coordination_attention')}
                className="w-full text-left flex items-center justify-between hover:bg-surface/50 -m-2 p-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${ATTENTION_SEVERITY_COLORS[a.severity] || ''}`}>{ATTENTION_SEVERITY_LABELS[a.severity] || a.severity}</span>
                  <p className="text-sm font-medium text-foreground">{a.title}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* RÉSUMÉ RESPONSABLE */}
      {isResponsable && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <ListChecks className="w-4 h-4 text-blue-500" />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Suivis en cours</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{all_followups_count}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Points d'attention</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{openAttention.length}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-purple-500" />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Réunions à venir</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{upcomingMeetings.length}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-red-500" />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Actions en retard</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{overdueFollowups.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}