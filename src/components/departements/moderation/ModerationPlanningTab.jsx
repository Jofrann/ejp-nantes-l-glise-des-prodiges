import React, { useState } from 'react';
import { Mic, Clock, Plus, ChevronDown, ChevronUp, X, Trash2, Users, UserCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatDate, isUpcoming, MOD_PLAN_STATUS_LABELS, MOD_PLAN_STATUS_COLORS } from '@/lib/moderationConstants';

export default function ModerationPlanningTab({ moderationData, isResponsable, currentUserId, colors, onRefresh }) {
  const { plans = [], members = [] } = moderationData;
  const [showForm, setShowForm] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [form, setForm] = useState({ title: '', date: '', call_time: '', general_notes: '' });
  const [saving, setSaving] = useState(false);
  const [assignModal, setAssignModal] = useState(null);

  const upcoming = (plans || []).filter(p => isUpcoming(p.date) && p.status !== 'cancelled' && p.status !== 'completed');

  const save = async () => {
    if (!form.title || !form.date) return;
    setSaving(true);
    try {
      await base44.functions.invoke('manageModerationItem', {
        department_slug: moderationData.department.slug,
        operation: 'save_plan',
        item: form,
      });
      setForm({ title: '', date: '', call_time: '', general_notes: '' });
      setShowForm(false);
      onRefresh?.();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce plan et son conducteur ?')) return;
    try {
      await base44.functions.invoke('manageModerationItem', { department_slug: moderationData.department.slug, operation: 'delete_plan', item_id: id });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  const assignModerator = async (planId, userId, fullName) => {
    try {
      await base44.functions.invoke('manageModerationItem', {
        department_slug: moderationData.department.slug,
        operation: 'assign_moderator',
        item_id: planId,
        item: { user_id: userId, full_name: fullName },
      });
      setAssignModal(null);
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-4">
      {isResponsable && (
        <button onClick={() => setShowForm(s => !s)} className={`w-full flex items-center justify-center gap-2 ${colors.bg} border ${colors.border} ${colors.text} py-3 rounded-xl text-sm font-medium hover:brightness-110 transition-all`}>
          <Plus className="w-4 h-4" /> Nouveau service à préparer
        </button>
      )}

      {showForm && isResponsable && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Titre (ex: Culte EJP)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Présence (13:30)" value={form.call_time} onChange={e => setForm(f => ({ ...f, call_time: e.target.value }))} />
          </div>
          <textarea className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" rows={2} placeholder="Notes générales" value={form.general_notes} onChange={e => setForm(f => ({ ...f, general_notes: e.target.value }))} />
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className={`flex-1 ${colors.bg} ${colors.text} border ${colors.border} py-2 rounded-xl text-sm font-medium`}>{saving ? '...' : 'Créer'}</button>
            <button onClick={() => setShowForm(false)} className="px-4 bg-surface border border-border rounded-xl text-sm">Annuler</button>
          </div>
        </div>
      )}

      {upcoming.length === 0 ? (
        <div className="text-center py-12">
          <Mic className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun service à préparer.</p>
        </div>
      ) : (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">À venir</p>
          <div className="space-y-3">
            {upcoming.map(plan => {
              const isExpanded = expandedPlan === plan.id;
              const isModerator = plan.moderator_user_id === currentUserId || plan.co_moderator_user_id === currentUserId;
              return (
                <div key={plan.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                  <button onClick={() => setExpandedPlan(isExpanded ? null : plan.id)} className="w-full flex items-center justify-between p-4 hover:bg-surface/50 transition-colors">
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">{plan.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(plan.date)} {plan.call_time && `· ${plan.call_time}`}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-1 rounded-full border ${MOD_PLAN_STATUS_COLORS[plan.status] || ''}`}>{MOD_PLAN_STATUS_LABELS[plan.status] || plan.status}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3">
                      {(plan.moderator_name || plan.co_moderator_name) && (
                        <div className="space-y-1.5">
                          {plan.moderator_name && (
                            <div className="flex items-center gap-2 text-xs">
                              <Mic className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-muted-foreground">Modérateur :</span>
                              <span className="font-medium text-foreground">{plan.moderator_name}</span>
                            </div>
                          )}
                          {plan.co_moderator_name && (
                            <div className="flex items-center gap-2 text-xs">
                              <Mic className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-muted-foreground">Co-modérateur :</span>
                              <span className="font-medium text-foreground">{plan.co_moderator_name}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {plan.general_notes && (
                        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-400/20">
                          <p className="text-[10px] uppercase tracking-widest text-amber-700 font-medium mb-1">Notes</p>
                          <p className="text-xs text-foreground">{plan.general_notes}</p>
                        </div>
                      )}

                      {isResponsable && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <button onClick={() => setAssignModal({ plan, role: 'moderator' })} className={`flex items-center gap-1 text-xs ${colors.bg} ${colors.text} border ${colors.border} px-2.5 py-1.5 rounded-lg`}>
                            <UserCheck className="w-3 h-3" /> {plan.moderator_name ? 'Changer modérateur' : 'Assigner modérateur'}
                          </button>
                          <button onClick={() => setAssignModal({ plan, role: 'co_moderator' })} className={`flex items-center gap-1 text-xs ${colors.bg} ${colors.text} border ${colors.border} px-2.5 py-1.5 rounded-lg`}>
                            <UserCheck className="w-3 h-3" /> {plan.co_moderator_name ? 'Changer co-modérateur' : 'Co-modérateur'}
                          </button>
                          <button onClick={() => handleDelete(plan.id)} className="text-xs text-red-500/70 hover:text-red-600 flex items-center gap-1"><Trash2 className="w-3 h-3" /> Supprimer</button>
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

      {assignModal && (
        <AssignModeratorModal plan={assignModal.plan} role={assignModal.role} members={members} colors={colors} slug={moderationData.department.slug} onClose={() => setAssignModal(null)} onAssigned={(userId, fullName) => assignModerator(assignModal.plan.id, userId, fullName)} />
      )}
    </div>
  );
}

function AssignModeratorModal({ plan, role, members, colors, slug, onClose, onAssigned }) {
  const [sel, setSel] = useState('');
  const save = () => {
    if (!sel) return;
    const member = members.find(m => m.user_id === sel);
    onAssigned(sel, member?.full_name || '');
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold">{role === 'moderator' ? 'Modérateur' : 'Co-modérateur'} — {plan.title}</p>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm mb-3" value={sel} onChange={e => setSel(e.target.value)}>
          <option value="">Sélectionner un membre...</option>
          {members.map(m => <option key={m.id} value={m.user_id}>{m.full_name}</option>)}
        </select>
        <button onClick={save} disabled={!sel} className={`w-full ${colors.bg} ${colors.text} border ${colors.border} py-2.5 rounded-xl text-sm font-medium disabled:opacity-50`}>Assigner</button>
      </div>
    </div>
  );
}