import React, { useState } from 'react';
import { Calendar, Clock, Plus, ChevronDown, ChevronUp, X, Check, AlertCircle, UserPlus, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatDate, isUpcoming, POSITION_OPTIONS, POSITION_SHORT, PLAN_STATUS_LABELS, PLAN_STATUS_COLORS, ASSIGNMENT_STATUS_LABELS, ASSIGNMENT_STATUS_COLORS } from '@/lib/soundConstants';

export default function SoundPlanningTab({ soundData, isResponsable, currentUserId, colors, onRefresh }) {
  const { plans = [], assignments_by_plan = {}, members = [] } = soundData;
  const [showForm, setShowForm] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [form, setForm] = useState({ title: '', date: '', call_time: '', service_start_time: '', technical_notes: '' });
  const [saving, setSaving] = useState(false);
  const [assignModal, setAssignModal] = useState(null);

  const upcoming = (plans || []).filter(p => isUpcoming(p.date) && p.status !== 'cancelled');

  const save = async () => {
    if (!form.title || !form.date) return;
    setSaving(true);
    try {
      await base44.functions.invoke('manageSoundItem', {
        department_slug: soundData.department.slug,
        operation: 'save_plan',
        item: form,
      });
      setForm({ title: '', date: '', call_time: '', service_start_time: '', technical_notes: '' });
      setShowForm(false);
      onRefresh?.();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleConfirm = async (assignmentId) => {
    try {
      await base44.functions.invoke('manageSoundItem', {
        department_slug: soundData.department.slug,
        operation: 'confirm_assignment',
        item_id: assignmentId,
      });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  const handleDecline = async (assignmentId) => {
    try {
      await base44.functions.invoke('manageSoundItem', {
        department_slug: soundData.department.slug,
        operation: 'decline_assignment',
        item_id: assignmentId,
      });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  const handleDeletePlan = async (planId) => {
    if (!confirm('Supprimer ce service et toutes ses affectations ?')) return;
    try {
      await base44.functions.invoke('manageSoundItem', {
        department_slug: soundData.department.slug,
        operation: 'delete_plan',
        item_id: planId,
      });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-4">
      {isResponsable && (
        <button
          onClick={() => setShowForm(s => !s)}
          className={`w-full flex items-center justify-center gap-2 ${colors.bg} border ${colors.border} ${colors.text} py-3 rounded-xl text-sm font-medium hover:brightness-110 transition-all`}
        >
          <Plus className="w-4 h-4" /> Nouveau service
        </button>
      )}

      {showForm && isResponsable && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Titre (ex: Culte EJP)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Heure présence (13:30)" value={form.call_time} onChange={e => setForm(f => ({ ...f, call_time: e.target.value }))} />
          </div>
          <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Heure début service (15:00)" value={form.service_start_time} onChange={e => setForm(f => ({ ...f, service_start_time: e.target.value }))} />
          <textarea className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" rows={2} placeholder="Consignes techniques" value={form.technical_notes} onChange={e => setForm(f => ({ ...f, technical_notes: e.target.value }))} />
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className={`flex-1 ${colors.bg} ${colors.text} border ${colors.border} py-2 rounded-xl text-sm font-medium`}>{saving ? '...' : 'Créer'}</button>
            <button onClick={() => setShowForm(false)} className="px-4 bg-surface border border-border rounded-xl text-sm">Annuler</button>
          </div>
        </div>
      )}

      {upcoming.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun service technique planifié.</p>
        </div>
      ) : (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">À venir</p>
          <div className="space-y-3">
            {upcoming.map(plan => {
              const planAssignments = assignments_by_plan[plan.id] || [];
              const myAssignments = planAssignments.filter(a => a.user_id === currentUserId);
              const isExpanded = expandedPlan === plan.id;
              return (
                <div key={plan.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-surface/50 transition-colors"
                  >
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">{plan.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(plan.date)} {plan.call_time && `· ${plan.call_time}`}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-1 rounded-full border ${PLAN_STATUS_COLORS[plan.status] || ''}`}>{PLAN_STATUS_LABELS[plan.status] || plan.status}</span>
                      <span className="text-xs text-muted-foreground">{planAssignments.length} affecté{planAssignments.length > 1 ? 's' : ''}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3">
                      {plan.technical_notes && (
                        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-400/20">
                          <p className="text-[10px] uppercase tracking-widest text-amber-700 font-medium mb-1">Consignes</p>
                          <p className="text-xs text-foreground">{plan.technical_notes}</p>
                        </div>
                      )}

                      {/* Mes affectations */}
                      {myAssignments.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Ton poste</p>
                          {myAssignments.map(a => (
                            <div key={a.id} className="flex items-center justify-between bg-surface/50 rounded-xl p-3">
                              <div>
                                <p className="text-sm font-medium text-foreground">{POSITION_SHORT[a.position] || a.position}</p>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${ASSIGNMENT_STATUS_COLORS[a.status] || ''}`}>{ASSIGNMENT_STATUS_LABELS[a.status] || a.status}</span>
                              </div>
                              {a.status === 'assigned' && (
                                <div className="flex gap-2">
                                  <button onClick={() => handleConfirm(a.id)} className="flex items-center gap-1 text-xs bg-green-500/10 text-green-600 border border-green-400/20 px-2.5 py-1.5 rounded-lg"><Check className="w-3 h-3" /> Confirmer</button>
                                  <button onClick={() => handleDecline(a.id)} className="flex items-center gap-1 text-xs bg-red-500/10 text-red-600 border border-red-400/20 px-2.5 py-1.5 rounded-lg"><X className="w-3 h-3" /> Décliner</button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Équipe complète (responsable) */}
                      {isResponsable && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Équipe</p>
                            <button onClick={() => setAssignModal(plan)} className={`flex items-center gap-1 text-xs ${colors.text}`}><UserPlus className="w-3 h-3" /> Affecter</button>
                          </div>
                          {planAssignments.length === 0 ? (
                            <p className="text-xs text-muted-foreground">Aucune affectation.</p>
                          ) : (
                            <div className="space-y-1.5">
                              {planAssignments.map(a => (
                                <div key={a.id} className="flex items-center justify-between text-xs bg-surface/50 rounded-lg px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-foreground">{POSITION_SHORT[a.position] || a.position}</span>
                                    <span className="text-muted-foreground">→ {a.full_name || '?'}</span>
                                  </div>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${ASSIGNMENT_STATUS_COLORS[a.status] || ''}`}>{ASSIGNMENT_STATUS_LABELS[a.status] || a.status}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <button onClick={() => handleDeletePlan(plan.id)} className="mt-2 flex items-center gap-1 text-xs text-red-500/70 hover:text-red-600"><Trash2 className="w-3 h-3" /> Supprimer</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal affectation */}
      {assignModal && (
        <AssignModal
          plan={assignModal}
          members={members}
          existingAssignments={assignments_by_plan[assignModal.id] || []}
          colors={colors}
          slug={soundData.department.slug}
          onClose={() => setAssignModal(null)}
          onSaved={() => { setAssignModal(null); onRefresh?.(); }}
        />
      )}
    </div>
  );
}

function AssignModal({ plan, members, existingAssignments, colors, slug, onClose, onSaved }) {
  const [sel, setSel] = useState({ user_id: '', position: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!sel.user_id || !sel.position) return;
    setSaving(true);
    try {
      const member = members.find(m => m.user_id === sel.user_id);
      await base44.functions.invoke('manageSoundItem', {
        department_slug: slug,
        operation: 'save_assignment',
        item: {
          service_plan_id: plan.id,
          user_id: sel.user_id,
          full_name: member?.full_name || '',
          position: sel.position,
          notes: sel.notes,
        },
      });
      onSaved();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const removeAssignment = async (id) => {
    try {
      await base44.functions.invoke('manageSoundItem', {
        department_slug: slug,
        operation: 'delete_assignment',
        item_id: id,
      });
      onSaved();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold">Affecter — {plan.title}</p>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        <div className="space-y-3 mb-4">
          <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={sel.user_id} onChange={e => setSel(s => ({ ...s, user_id: e.target.value }))}>
            <option value="">Sélectionner un membre...</option>
            {members.map(m => <option key={m.id} value={m.user_id}>{m.full_name}</option>)}
          </select>
          <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={sel.position} onChange={e => setSel(s => ({ ...s, position: e.target.value }))}>
            <option value="">Sélectionner un poste...</option>
            {POSITION_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Note (optionnel)" value={sel.notes} onChange={e => setSel(s => ({ ...s, notes: e.target.value }))} />
          <button onClick={save} disabled={saving || !sel.user_id || !sel.position} className={`w-full ${colors.bg} ${colors.text} border ${colors.border} py-2.5 rounded-xl text-sm font-medium disabled:opacity-50`}>
            {saving ? '...' : 'Affecter'}
          </button>
        </div>

        {existingAssignments.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Affectations actuelles</p>
            <div className="space-y-1.5">
              {existingAssignments.map(a => (
                <div key={a.id} className="flex items-center justify-between text-xs bg-surface/50 rounded-lg px-3 py-2">
                  <span>{POSITION_SHORT[a.position] || a.position} → {a.full_name}</span>
                  <button onClick={() => removeAssignment(a.id)} className="text-red-500/60 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}