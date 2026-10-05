import React from 'react';
import { Package, Clock, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import { formatDate, isUpcoming, LOG_PLAN_STATUS_LABELS, LOG_PLAN_STATUS_COLORS, TASK_STATUS_LABELS, TASK_STATUS_COLORS, NEED_STATUS_LABELS, NEED_STATUS_COLORS, EQUIPMENT_STATUS_LABELS, EQUIPMENT_STATUS_COLORS } from '@/lib/logisticsConstants';

export default function LogisticsOverviewTab({ logisticsData, isResponsable, currentUserId, colors, onNavigateTab }) {
  const { plans = [], tasks = [], needs = [], equipment = [] } = logisticsData;

  const upcoming = (plans || []).filter(p => isUpcoming(p.date) && p.status !== 'cancelled' && p.status !== 'completed');
  const nextPlan = upcoming[0];
  const planTasks = nextPlan ? tasks.filter(t => t.logistics_plan_id === nextPlan.id) : [];
  const myTasks = planTasks.filter(t => t.assigned_to === currentUserId);
  const doneCount = planTasks.filter(t => t.status === 'done').length;
  const blockedTasks = planTasks.filter(t => t.status === 'blocked');
  const uncoveredNeeds = needs.filter(n => n.status !== 'fulfilled' && n.status !== 'cancelled');
  const unavailableEquipment = equipment.filter(e => e.status === 'maintenance' || e.status === 'missing');

  if (!nextPlan) {
    return (
      <div className="text-center py-12">
        <Package className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Aucun événement logistique planifié.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* MEMBRE : Ton prochain événement */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Ton prochain événement</p>
        <p className="text-sm font-semibold text-foreground mb-1">{formatDate(nextPlan.date)}</p>
        {nextPlan.setup_time && (
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Installation : {nextPlan.setup_time}</p>
        )}
        {nextPlan.teardown_time && (
          <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Rangement : {nextPlan.teardown_time}</p>
        )}

        {myTasks.length > 0 ? (
          <div className="mt-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Tes tâches ({myTasks.length})</p>
            <div className="space-y-1.5">
              {myTasks.map(t => (
                <div key={t.id} className="flex items-center justify-between text-xs bg-surface/50 rounded-lg px-3 py-2">
                  <span className="font-medium text-foreground">{t.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${TASK_STATUS_COLORS[t.status] || ''}`}>{TASK_STATUS_LABELS[t.status] || t.status}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mt-2">Tu n'as pas de tâche assignée pour cet événement.</p>
        )}

        {nextPlan.instructions && (
          <div className="mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-400/20">
            <p className="text-[10px] uppercase tracking-widest text-amber-700 font-medium mb-1">Consignes</p>
            <p className="text-xs text-foreground">{nextPlan.instructions}</p>
          </div>
        )}
      </div>

      {/* RESPONSABLE : Vue de gestion */}
      {isResponsable && (
        <>
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Prochain événement — vue responsable</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{doneCount}/{planTasks.length}</p>
                <p className="text-[10px] text-muted-foreground">tâches terminées</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{uncoveredNeeds.length}</p>
                <p className="text-[10px] text-muted-foreground">besoins non couverts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{unavailableEquipment.length}</p>
                <p className="text-[10px] text-muted-foreground">matériel indispo.</p>
              </div>
            </div>
            <button onClick={() => onNavigateTab?.('logistics_planning')} className={`mt-3 w-full text-xs ${colors.bg} ${colors.text} border ${colors.border} py-2 rounded-xl`}>
              Gérer le planning
            </button>
          </div>

          {blockedTasks.length > 0 && (
            <div className="bg-card border border-red-400/20 rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-red-600 font-medium mb-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Tâches bloquées</p>
              <div className="space-y-1.5">
                {blockedTasks.map(t => (
                  <div key={t.id} className="text-xs">
                    <span className="font-medium text-foreground">{t.title}</span>
                    {t.assigned_to_name && <span className="text-muted-foreground"> — {t.assigned_to_name}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}