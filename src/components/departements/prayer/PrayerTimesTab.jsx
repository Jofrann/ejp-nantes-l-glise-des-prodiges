import React from 'react';
import { Clock, MapPin, Heart, Users, CheckCircle2, XCircle, Calendar } from 'lucide-react';
import { formatDate, isUpcoming, SCHEDULE_TYPE_LABELS, SCHEDULE_STATUS_LABELS, SCHEDULE_STATUS_COLORS, ASSIGNMENT_STATUS_LABELS, ASSIGNMENT_STATUS_COLORS, ASSIGNMENT_ROLE_SHORT } from '@/lib/prayerConstants';

export default function PrayerTimesTab({ prayerData, currentUserId, colors }) {
  const { schedules = [], assignments_by_schedule = {} } = prayerData;

  const upcoming = (schedules || []).filter(s => isUpcoming(s.date) && s.status !== 'cancelled' && s.status !== 'completed');

  if (upcoming.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Aucun temps de prière à venir.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Prochains temps de prière</p>
      <div className="space-y-4">
        {upcoming.map(schedule => {
          const schedAssignments = assignments_by_schedule[schedule.id] || [];
          const myAssignment = schedAssignments.find(a => a.user_id === currentUserId);
          const confirmed = schedAssignments.filter(a => a.status === 'confirmed').length;
          const pending = schedAssignments.filter(a => a.status === 'assigned').length;
          const declined = schedAssignments.filter(a => a.status === 'declined').length;

          return (
            <div key={schedule.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-base font-semibold text-foreground">{schedule.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{formatDate(schedule.date)}</p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full border ${SCHEDULE_STATUS_COLORS[schedule.status] || ''}`}>
                  {SCHEDULE_STATUS_LABELS[schedule.status] || schedule.status}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                {schedule.start_time && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      <strong className="text-foreground">{schedule.start_time}</strong>
                      {schedule.end_time && <span className="text-muted-foreground/60"> – {schedule.end_time}</span>}
                    </span>
                  </div>
                )}
                {schedule.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{schedule.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Heart className="w-3.5 h-3.5" />
                  <span>{SCHEDULE_TYPE_LABELS[schedule.type] || schedule.type}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  <span>{schedAssignments.length} intercesseur{schedAssignments.length > 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Ton statut */}
              {myAssignment ? (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Ton statut :</span>
                  <span className={`text-[10px] px-2 py-1 rounded-full border ${ASSIGNMENT_STATUS_COLORS[myAssignment.status] || ''}`}>
                    {ASSIGNMENT_STATUS_LABELS[myAssignment.status] || myAssignment.status}
                  </span>
                  <span className="text-xs text-muted-foreground">· {ASSIGNMENT_ROLE_SHORT[myAssignment.role] || myAssignment.role}</span>
                </div>
              ) : (
                <div className="mt-4 text-xs text-muted-foreground">Tu n'es pas affecté à ce temps.</div>
              )}

              {/* Résumé équipe */}
              <div className="mt-4 pt-4 border-t border-border flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="w-3.5 h-3.5" /> {confirmed} confirmé{confirmed > 1 ? 's' : ''}</span>
                {pending > 0 && <span className="flex items-center gap-1 text-amber-600"><Clock className="w-3.5 h-3.5" /> {pending} en attente</span>}
                {declined > 0 && <span className="flex items-center gap-1 text-red-500/70"><XCircle className="w-3.5 h-3.5" /> {declined} décliné{declined > 1 ? 's' : ''}</span>}
              </div>

              {schedule.notes && (
                <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-400/20">
                  <p className="text-[10px] uppercase tracking-widest text-amber-700 font-medium mb-1">Consignes</p>
                  <p className="text-xs text-foreground leading-relaxed">{schedule.notes}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}