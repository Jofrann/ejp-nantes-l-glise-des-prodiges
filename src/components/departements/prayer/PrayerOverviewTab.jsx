import React from 'react';
import { Calendar, Clock, MapPin, Users, Heart, Lock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { formatDate, isUpcoming, SCHEDULE_TYPE_LABELS, SCHEDULE_STATUS_LABELS, SCHEDULE_STATUS_COLORS, ASSIGNMENT_STATUS_LABELS, ASSIGNMENT_STATUS_COLORS, ASSIGNMENT_ROLE_SHORT, TOPIC_CATEGORY_LABELS, TOPIC_PRIORITY_COLORS, TOPIC_PRIORITY_LABELS, TOPIC_VISIBILITY_LABELS, TOPIC_VISIBILITY_COLORS, CONFIDENTIALITY_LABELS, CONFIDENTIALITY_COLORS, REQUEST_STATUS_LABELS } from '@/lib/prayerConstants';

export default function PrayerOverviewTab({ prayerData, isResponsable, currentUserId, colors, onNavigateTab }) {
  const { schedules = [], assignments_by_schedule = {}, topics = [], requests = [], updates_by_request = {} } = prayerData;

  const upcomingSchedules = (schedules || []).filter(s => isUpcoming(s.date) && s.status !== 'cancelled' && s.status !== 'completed');
  const nextSchedule = upcomingSchedules[0];
  const myAssignments = nextSchedule ? (assignments_by_schedule[nextSchedule.id] || []).filter(a => a.user_id === currentUserId) : [];
  const teamAssignments = nextSchedule ? (assignments_by_schedule[nextSchedule.id] || []) : [];

  const activeTopics = (topics || []).filter(t => t.status === 'active');
  const myRequests = (requests || []).filter(r => {
    const assignees = prayerData.assignees_by_request?.[r.id] || [];
    return assignees.some(a => a.user_id === currentUserId) || r.requester_user_id === currentUserId;
  });
  const requestsToQualify = isResponsable ? (requests || []).filter(r => r.status === 'new' || r.status === 'follow_up') : [];

  return (
    <div className="space-y-6">
      {/* PROCHAIN TEMPS DE PRIÈRE */}
      {nextSchedule ? (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Ton prochain temps de prière</p>
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-base font-semibold text-foreground">{nextSchedule.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{formatDate(nextSchedule.date)}</p>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full border ${SCHEDULE_STATUS_COLORS[nextSchedule.status] || ''}`}>
                {SCHEDULE_STATUS_LABELS[nextSchedule.status] || nextSchedule.status}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {nextSchedule.start_time && <strong className="text-foreground">{nextSchedule.start_time}</strong>}
                  {nextSchedule.end_time && <span className="text-muted-foreground/60"> – {nextSchedule.end_time}</span>}
                </span>
              </div>
              {nextSchedule.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{nextSchedule.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Heart className="w-3.5 h-3.5" />
                <span>{SCHEDULE_TYPE_LABELS[nextSchedule.type] || nextSchedule.type}</span>
              </div>
              {myAssignments.length > 0 ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  <span>Ton rôle : <strong className="text-foreground">{myAssignments.map(a => ASSIGNMENT_ROLE_SHORT[a.role] || a.role).join(', ')}</strong></span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  <span>Tu n'es pas encore affecté à ce temps.</span>
                </div>
              )}
            </div>

            {myAssignments.length > 0 && (
              <div className="mt-4 flex items-center gap-2">
                {myAssignments.map(a => (
                  <span key={a.id} className={`text-[10px] px-2 py-1 rounded-full border ${ASSIGNMENT_STATUS_COLORS[a.status] || ''}`}>
                    {ASSIGNMENT_STATUS_LABELS[a.status] || a.status}
                  </span>
                ))}
              </div>
            )}

            {isResponsable && (
              <div className="mt-4 pt-4 border-t border-border space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Équipe</span><span className="font-medium">{teamAssignments.length} affecté{teamAssignments.length > 1 ? 's' : ''}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Confirmations</span><span className="font-medium">{teamAssignments.filter(a => a.status === 'confirmed').length}/{teamAssignments.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">En attente</span><span className="font-medium text-amber-600">{teamAssignments.filter(a => a.status === 'assigned').length}</span></div>
              </div>
            )}

            {nextSchedule.notes && (
              <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-400/20">
                <p className="text-[10px] uppercase tracking-widest text-amber-700 font-medium mb-1">Consignes</p>
                <p className="text-xs text-foreground leading-relaxed">{nextSchedule.notes}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Sparkles className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun temps de prière à venir.</p>
        </div>
      )}

      {/* SUJETS GÉNÉRAUX ACTIFS */}
      {activeTopics.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Sujets d'intercession actifs</p>
          <div className="space-y-2">
            {activeTopics.slice(0, 5).map(topic => (
              <button
                key={topic.id}
                onClick={() => onNavigateTab?.('prayer_topics')}
                className="w-full flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-blue-400/30 transition-all text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{topic.title}</p>
                  {topic.description && <p className="text-xs text-muted-foreground truncate">{topic.description}</p>}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[10px] text-muted-foreground">{TOPIC_CATEGORY_LABELS[topic.category] || topic.category}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${TOPIC_PRIORITY_COLORS[topic.priority] || ''}`}>{TOPIC_PRIORITY_LABELS[topic.priority] || topic.priority}</span>
                  {topic.visibility !== 'mpi' && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${TOPIC_VISIBILITY_COLORS[topic.visibility] || ''}`}>
                      {topic.visibility === 'restricted' && <Lock className="w-2.5 h-2.5 inline mr-0.5" />}
                      {TOPIC_VISIBILITY_LABELS[topic.visibility] || topic.visibility}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MES DEMANDES ASSIGNÉES */}
      {myRequests.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Demandes qui te sont assignées</p>
          <div className="space-y-2">
            {myRequests.map(req => (
              <button
                key={req.id}
                onClick={() => onNavigateTab?.('prayer_requests')}
                className="w-full flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-blue-400/30 transition-all text-left"
              >
                <Lock className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">Demande privée</p>
                  <p className="text-xs text-muted-foreground">{REQUEST_STATUS_LABELS[req.status] || req.status}</p>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${CONFIDENTIALITY_COLORS[req.confidentiality] || ''}`}>
                  {CONFIDENTIALITY_LABELS[req.confidentiality] || req.confidentiality}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* DEMANDES À QUALIFIER (responsable) */}
      {isResponsable && requestsToQualify.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Demandes à qualifier</p>
          <div className="space-y-2">
            {requestsToQualify.slice(0, 5).map(req => (
              <button
                key={req.id}
                onClick={() => onNavigateTab?.('prayer_requests')}
                className="w-full flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-amber-400/30 transition-all text-left"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{req.title}</p>
                  <p className="text-xs text-muted-foreground">{REQUEST_STATUS_LABELS[req.status] || req.status}</p>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${CONFIDENTIALITY_COLORS[req.confidentiality] || ''}`}>
                  {CONFIDENTIALITY_LABELS[req.confidentiality] || req.confidentiality}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* RÉSUMÉ RESPONSABLE */}
      {isResponsable && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-2 text-xs">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Synthèse</p>
          <div className="flex justify-between"><span className="text-muted-foreground">Sujets actifs</span><span className="font-medium">{activeTopics.length}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Demandes à qualifier</span><span className="font-medium text-amber-600">{requestsToQualify.length}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Temps à venir</span><span className="font-medium">{upcomingSchedules.length}</span></div>
        </div>
      )}
    </div>
  );
}