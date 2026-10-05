import React, { useState } from 'react';
import { Calendar, Clock, Plus, ChevronDown, ChevronUp, X, Check, UserPlus, Trash2, MapPin, Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatDate, isUpcoming, SCHEDULE_TYPE_OPTIONS, SCHEDULE_TYPE_LABELS, SCHEDULE_STATUS_LABELS, SCHEDULE_STATUS_COLORS, ASSIGNMENT_ROLE_OPTIONS, ASSIGNMENT_ROLE_SHORT, ASSIGNMENT_STATUS_LABELS, ASSIGNMENT_STATUS_COLORS } from '@/lib/prayerConstants';

export default function PrayerPlanningTab({ prayerData, isResponsable, currentUserId, colors, onRefresh }) {
  const { schedules = [], assignments_by_schedule = {}, members = [] } = prayerData;
  const [showForm, setShowForm] = useState(false);
  const [expandedSchedule, setExpandedSchedule] = useState(null);
  const [form, setForm] = useState({ title: '', date: '', start_time: '', end_time: '', location: '', type: 'intercession', notes: '' });
  const [saving, setSaving] = useState(false);
  const [assignModal, setAssignModal] = useState(null);

  const upcoming = (schedules || []).filter(s => isUpcoming(s.date) && s.status !== 'cancelled' && s.status !== 'completed');

  const save = async () => {
    if (!form.title || !form.date) return;
    setSaving(true);
    try {
      await base44.functions.invoke('managePrayerItem', {
        department_slug: prayerData.department.slug,
        operation: 'save_schedule',
        item: form,
      });
      setForm({ title: '', date: '', start_time: '', end_time: '', location: '', type: 'intercession', notes: '' });
      setShowForm(false);
      onRefresh?.();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleConfirm = async (assignmentId) => {
    try {
      await base44.functions.invoke('managePrayerItem', {
        department_slug: prayerData.department.slug,
        operation: 'confirm_assignment',
        item_id: assignmentId,
      });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  const handleDecline = async (assignmentId) => {
    try {
      await base44.functions.invoke('managePrayerItem', {
        department_slug: prayerData.department.slug,
        operation: 'decline_assignment',
        item_id: assignmentId,
      });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!confirm('Supprimer ce temps de prière et toutes ses affectations ?')) return;
    try {
      await base44.functions.invoke('managePrayerItem', {
        department_slug: prayerData.department.slug,
        operation: 'delete_schedule',
        item_id: scheduleId,
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
          <Plus className="w-4 h-4" /> Nouveau temps de prière
        </button>
      )}

      {showForm && isResponsable && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Titre (ex: Prière avant culte)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {SCHEDULE_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Début (13:00)" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
            <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Fin (13:30)" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
          </div>
          <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Lieu (ex: Salle X)" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          <textarea className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" rows={2} placeholder="Notes / consignes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className={`flex-1 ${colors.bg} ${colors.text} border ${colors.border} py-2 rounded-xl text-sm font-medium`}>{saving ? '...' : 'Créer'}</button>
            <button onClick={() => setShowForm(false)} className="px-4 bg-surface border border-border rounded-xl text-sm">Annuler</button>
          </div>
        </div>
      )}

      {upcoming.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun temps de prière à venir.</p>
        </div>
      ) : (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">À venir</p>
          <div className="space-y-3">
            {upcoming.map(schedule => {
              const schedAssignments = assignments_by_schedule[schedule.id] || [];
              const myAssignments = schedAssignments.filter(a => a.user_id === currentUserId);
              const isExpanded = expandedSchedule === schedule.id;
              return (
                <div key={schedule.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedSchedule(isExpanded ? null : schedule.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-surface/50 transition-colors"
                  >
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">{schedule.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(schedule.date)} {schedule.start_time && `· ${schedule.start_time}`}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-1 rounded-full border ${SCHEDULE_STATUS_COLORS[schedule.status] || ''}`}>{SCHEDULE_STATUS_LABELS[schedule.status] || schedule.status}</span>
                      <span className="text-xs text-muted-foreground">{schedAssignments.length} affecté{schedAssignments.length > 1 ? 's' : ''}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3">
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        {schedule.start_time && schedule.end_time && (
                          <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {schedule.start_time} – {schedule.end_time}</div>
                        )}
                        {schedule.location && (
                          <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {schedule.location}</div>
                        )}
                        <div className="flex items-center gap-2"><Heart className="w-3.5 h-3.5" /> {SCHEDULE_TYPE_LABELS[schedule.type] || schedule.type}</div>
                      </div>

                      {schedule.notes && (
                        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-400/20">
                          <p className="text-[10px] uppercase tracking-widest text-amber-700 font-medium mb-1">Consignes</p>
                          <p className="text-xs text-foreground">{schedule.notes}</p>
                        </div>
                      )}

                      {myAssignments.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Ton rôle</p>
                          {myAssignments.map(a => (
                            <div key={a.id} className="flex items-center justify-between bg-surface/50 rounded-xl p-3">
                              <div>
                                <p className="text-sm font-medium text-foreground">{ASSIGNMENT_ROLE_SHORT[a.role] || a.role}</p>
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

                      {isResponsable && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Équipe</p>
                            <button onClick={() => setAssignModal(schedule)} className={`flex items-center gap-1 text-xs ${colors.text}`}><UserPlus className="w-3 h-3" /> Affecter</button>
                          </div>
                          {schedAssignments.length === 0 ? (
                            <p className="text-xs text-muted-foreground">Aucune affectation.</p>
                          ) : (
                            <div className="space-y-1.5">
                              {schedAssignments.map(a => (
                                <div key={a.id} className="flex items-center justify-between text-xs bg-surface/50 rounded-lg px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-foreground">{ASSIGNMENT_ROLE_SHORT[a.role] || a.role}</span>
                                    <span className="text-muted-foreground">→ {a.full_name || '?'}</span>
                                  </div>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${ASSIGNMENT_STATUS_COLORS[a.status] || ''}`}>{ASSIGNMENT_STATUS_LABELS[a.status] || a.status}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <button onClick={() => handleDeleteSchedule(schedule.id)} className="mt-2 flex items-center gap-1 text-xs text-red-500/70 hover:text-red-600"><Trash2 className="w-3 h-3" /> Supprimer</button>
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
        <AssignModal
          schedule={assignModal}
          members={members}
          existingAssignments={assignments_by_schedule[assignModal.id] || []}
          colors={colors}
          slug={prayerData.department.slug}
          onClose={() => setAssignModal(null)}
          onSaved={() => { setAssignModal(null); onRefresh?.(); }}
        />
      )}
    </div>
  );
}

function AssignModal({ schedule, members, existingAssignments, colors, slug, onClose, onSaved }) {
  const [sel, setSel] = useState({ user_id: '', role: 'intercesseur', notes: '' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!sel.user_id) return;
    setSaving(true);
    try {
      const member = members.find(m => m.user_id === sel.user_id);
      await base44.functions.invoke('managePrayerItem', {
        department_slug: slug,
        operation: 'save_assignment',
        item: {
          schedule_id: schedule.id,
          user_id: sel.user_id,
          full_name: member?.full_name || '',
          role: sel.role,
          notes: sel.notes,
        },
      });
      onSaved();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const removeAssignment = async (id) => {
    try {
      await base44.functions.invoke('managePrayerItem', {
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
          <p className="text-sm font-semibold">Affecter — {schedule.title}</p>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        <div className="space-y-3 mb-4">
          <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={sel.user_id} onChange={e => setSel(s => ({ ...s, user_id: e.target.value }))}>
            <option value="">Sélectionner un membre...</option>
            {members.map(m => <option key={m.id} value={m.user_id}>{m.full_name}</option>)}
          </select>
          <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={sel.role} onChange={e => setSel(s => ({ ...s, role: e.target.value }))}>
            {ASSIGNMENT_ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Note (optionnel)" value={sel.notes} onChange={e => setSel(s => ({ ...s, notes: e.target.value }))} />
          <button onClick={save} disabled={saving || !sel.user_id} className={`w-full ${colors.bg} ${colors.text} border ${colors.border} py-2.5 rounded-xl text-sm font-medium disabled:opacity-50`}>
            {saving ? '...' : 'Affecter'}
          </button>
        </div>

        {existingAssignments.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Affectations actuelles</p>
            <div className="space-y-1.5">
              {existingAssignments.map(a => (
                <div key={a.id} className="flex items-center justify-between text-xs bg-surface/50 rounded-lg px-3 py-2">
                  <span>{ASSIGNMENT_ROLE_SHORT[a.role] || a.role} → {a.full_name}</span>
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