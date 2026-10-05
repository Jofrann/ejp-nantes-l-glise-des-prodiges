import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle2, XCircle, Users, Package, ListChecks } from 'lucide-react';
import { formatDate, isUpcoming, POSITION_SHORT, PLAN_STATUS_LABELS, PLAN_STATUS_COLORS, ASSIGNMENT_STATUS_LABELS, ASSIGNMENT_STATUS_COLORS, INCIDENT_SEVERITY_LABELS, INCIDENT_SEVERITY_COLORS, INCIDENT_STATUS_LABELS, INCIDENT_STATUS_COLORS, EQUIPMENT_STATUS_LABELS, EQUIPMENT_STATUS_COLORS } from '@/lib/soundConstants';

export default function SoundOverviewTab({ soundData, isResponsable, currentUserId, colors, onNavigateTab }) {
  const { plans = [], assignments_by_plan = {}, equipment = [], incidents = [], checklist_runs_by_plan = {}, item_states_by_run = {} } = soundData;

  const upcomingPlans = (plans || []).filter(p => isUpcoming(p.date) && p.status !== 'cancelled');
  const nextPlan = upcomingPlans[0];
  const myAssignments = nextPlan ? (assignments_by_plan[nextPlan.id] || []).filter(a => a.user_id === currentUserId) : [];
  const teamAssignments = nextPlan ? (assignments_by_plan[nextPlan.id] || []) : [];
  const openIncidents = (incidents || []).filter(i => i.status === 'open' || i.status === 'in_progress');
  const equipmentIssues = (equipment || []).filter(e => e.status === 'maintenance' || e.status === 'broken' || e.status === 'missing');

  return (
    <div className="space-y-6">
      {/* PROCHAIN SERVICE */}
      {nextPlan ? (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Prochain service</p>
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-base font-semibold text-foreground">{nextPlan.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{formatDate(nextPlan.date)}</p>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full border ${PLAN_STATUS_COLORS[nextPlan.status] || ''}`}>
                {PLAN_STATUS_LABELS[nextPlan.status] || nextPlan.status}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              {nextPlan.call_time && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Présence : <strong className="text-foreground">{nextPlan.call_time}</strong></span>
                  {nextPlan.service_start_time && <span className="text-muted-foreground/60">· Début {nextPlan.service_start_time}</span>}
                </div>
              )}
              {myAssignments.length > 0 ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  <span>Ton poste : <strong className="text-foreground">{myAssignments.map(a => POSITION_SHORT[a.position] || a.position).join(', ')}</strong></span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  <span>Tu n'es pas encore affecté à ce service.</span>
                </div>
              )}
            </div>

            {/* Confirmations */}
            {myAssignments.length > 0 && (
              <div className="mt-4 flex items-center gap-2">
                {myAssignments.map(a => (
                  <span key={a.id} className={`text-[10px] px-2 py-1 rounded-full border ${ASSIGNMENT_STATUS_COLORS[a.status] || ''}`}>
                    {ASSIGNMENT_STATUS_LABELS[a.status] || a.status}
                  </span>
                ))}
              </div>
            )}

            {/* Résumé responsable */}
            {isResponsable && (
              <div className="mt-4 pt-4 border-t border-border space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Équipe</span><span className="font-medium">{teamAssignments.length} affecté{teamAssignments.length > 1 ? 's' : ''}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Confirmations</span><span className="font-medium">{teamAssignments.filter(a => a.status === 'confirmed').length}/{teamAssignments.length}</span></div>
                {equipmentIssues.length > 0 && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Matériel</span><span className="font-medium text-amber-600">{equipmentIssues.length} indisponible{equipmentIssues.length > 1 ? 's' : ''}</span></div>
                )}
                {openIncidents.length > 0 && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Incidents</span><span className="font-medium text-red-600">{openIncidents.length} ouvert{openIncidents.length > 1 ? 's' : ''}</span></div>
                )}
                {checklist_runs_by_plan[nextPlan.id] && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Checklist</span><span className="font-medium">{checklist_runs_by_plan[nextPlan.id].length} run(s)</span></div>
                )}
              </div>
            )}

            {nextPlan.technical_notes && (
              <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-400/20">
                <p className="text-[10px] uppercase tracking-widest text-amber-700 font-medium mb-1">Consignes</p>
                <p className="text-xs text-foreground leading-relaxed">{nextPlan.technical_notes}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun service technique planifié.</p>
        </div>
      )}

      {/* INCIDENTS OUVERTS */}
      {openIncidents.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Incidents ouverts</p>
          <div className="space-y-2">
            {openIncidents.slice(0, 5).map(inc => (
              <button
                key={inc.id}
                onClick={() => onNavigateTab?.('sound_incidents')}
                className="w-full flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-amber-400/30 transition-all text-left"
              >
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${(INCIDENT_SEVERITY_COLORS[inc.severity] || '').includes('red') ? 'text-red-500' : 'text-amber-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{inc.title}</p>
                  <p className="text-xs text-muted-foreground">{INCIDENT_STATUS_LABELS[inc.status] || inc.status}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${INCIDENT_SEVERITY_COLORS[inc.severity] || ''}`}>
                  {INCIDENT_SEVERITY_LABELS[inc.severity] || inc.severity}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MATÉRIEL INDISPONIBLE (responsable) */}
      {isResponsable && equipmentIssues.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Matériel indisponible</p>
          <div className="space-y-2">
            {equipmentIssues.map(eq => (
              <button
                key={eq.id}
                onClick={() => onNavigateTab?.('sound_equipment')}
                className="w-full flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-amber-400/30 transition-all text-left"
              >
                <Package className="w-4 h-4 flex-shrink-0 text-amber-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{eq.name}</p>
                  <p className="text-xs text-muted-foreground">{EQUIPMENT_STATUS_LABELS[eq.status] || eq.status}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${EQUIPMENT_STATUS_COLORS[eq.status] || ''}`}>
                  {EQUIPMENT_STATUS_LABELS[eq.status] || eq.status}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}