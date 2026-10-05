import React, { useState } from 'react';
import { Package, Clock, Plus, ChevronDown, ChevronUp, X, Trash2, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatDate, isUpcoming, LOG_PLAN_STATUS_LABELS, LOG_PLAN_STATUS_COLORS, TASK_STATUS_LABELS, TASK_STATUS_COLORS, NEED_STATUS_LABELS, NEED_STATUS_COLORS } from '@/lib/logisticsConstants';

export default function LogisticsPlanningTab({ logisticsData, isResponsable, currentUserId, colors, onRefresh }) {
  const { plans = [], tasks_by_plan = {}, needs_by_plan = {} } = logisticsData;
  const [showForm, setShowForm] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [form, setForm] = useState({ title: '', date: '', setup_time: '', teardown_time: '', instructions: '' });
  const [saving, setSaving] = useState(false);

  const upcoming = (plans || []).filter(p => isUpcoming(p.date) && p.status !== 'cancelled' && p.status !== 'completed');

  const save = async () => {
    if (!form.title || !form.date) return;
    setSaving(true);
    try {
      await base44.functions.invoke('manageLogisticsItem', {
        department_slug: logisticsData.department.slug,
        operation: 'save_plan',
        item: form,
      });
      setForm({ title: '', date: '', setup_time: '', teardown_time: '', instructions: '' });
      setShowForm(false);
      onRefresh?.();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce plan et toutes ses tâches ?')) return;
    try {
      await base44.functions.invoke('manageLogisticsItem', { department_slug: logisticsData.department.slug, operation: 'delete_plan', item_id: id });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-4">
      {isResponsable && (
        <button onClick={() => setShowForm(s => !s)} className={`w-full flex items-center justify-center gap-2 ${colors.bg} border ${colors.border} ${colors.text} py-3 rounded-xl text-sm font-medium hover:brightness-110 transition-all`}>
          <Plus className="w-4 h-4" /> Nouveau plan logistique
        </button>
      )}

      {showForm && isResponsable && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Titre (ex: Culte EJP)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <input type="date" className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Installation (12:30)" value={form.setup_time} onChange={e => setForm(f => ({ ...f, setup_time: e.target.value }))} />
            <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Rangement (16:00)" value={form.teardown_time} onChange={e => setForm(f => ({ ...f, teardown_time: e.target.value }))} />
          </div>
          <textarea className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" rows={2} placeholder="Consignes générales" value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} />
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className={`flex-1 ${colors.bg} ${colors.text} border ${colors.border} py-2 rounded-xl text-sm font-medium`}>{saving ? '...' : 'Créer'}</button>
            <button onClick={() => setShowForm(false)} className="px-4 bg-surface border border-border rounded-xl text-sm">Annuler</button>
          </div>
        </div>
      )}

      {upcoming.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun plan logistique à venir.</p>
        </div>
      ) : (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">À venir</p>
          <div className="space-y-3">
            {upcoming.map(plan => {
              const planTasks = tasks_by_plan[plan.id] || [];
              const planNeeds = needs_by_plan[plan.id] || [];
              const isExpanded = expandedPlan === plan.id;
              const doneCount = planTasks.filter(t => t.status === 'done').length;
              return (
                <div key={plan.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                  <button onClick={() => setExpandedPlan(isExpanded ? null : plan.id)} className="w-full flex items-center justify-between p-4 hover:bg-surface/50 transition-colors">
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">{plan.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(plan.date)} {plan.setup_time && `· Install ${plan.setup_time}`}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-1 rounded-full border ${LOG_PLAN_STATUS_COLORS[plan.status] || ''}`}>{LOG_PLAN_STATUS_LABELS[plan.status] || plan.status}</span>
                      <span className="text-xs text-muted-foreground">{doneCount}/{planTasks.length} tâches</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3">
                      {(plan.setup_time || plan.teardown_time) && (
                        <div className="space-y-1 text-xs text-muted-foreground">
                          {plan.setup_time && <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Installation : {plan.setup_time}</div>}
                          {plan.teardown_time && <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Rangement : {plan.teardown_time}</div>}
                        </div>
                      )}

                      {plan.instructions && (
                        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-400/20">
                          <p className="text-[10px] uppercase tracking-widest text-amber-700 font-medium mb-1">Consignes</p>
                          <p className="text-xs text-foreground">{plan.instructions}</p>
                        </div>
                      )}

                      {planTasks.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Tâches ({planTasks.length})</p>
                          <div className="space-y-1.5">
                            {planTasks.map(t => (
                              <div key={t.id} className="flex items-center justify-between text-xs bg-surface/50 rounded-lg px-3 py-2">
                                <div>
                                  <span className="font-medium text-foreground">{t.title}</span>
                                  {t.assigned_to_name && <span className="text-muted-foreground"> — {t.assigned_to_name}</span>}
                                </div>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${TASK_STATUS_COLORS[t.status] || ''}`}>{TASK_STATUS_LABELS[t.status] || t.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {planNeeds.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Besoins ({planNeeds.length})</p>
                          <div className="space-y-1.5">
                            {planNeeds.map(n => (
                              <div key={n.id} className="flex items-center justify-between text-xs bg-surface/50 rounded-lg px-3 py-2">
                                <span className="font-medium text-foreground">{n.title}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${NEED_STATUS_COLORS[n.status] || ''}`}>{NEED_STATUS_LABELS[n.status] || n.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {isResponsable && (
                        <button onClick={() => handleDelete(plan.id)} className="flex items-center gap-1 text-xs text-red-500/70 hover:text-red-600"><Trash2 className="w-3 h-3" /> Supprimer</button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}