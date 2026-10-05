import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronUp, Trash2, Calendar, MapPin, Clock, Users, FileText, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatDate, formatDateShort, isUpcoming, MEETING_STATUS_LABELS, MEETING_STATUS_COLORS, FOLLOWUP_PRIORITY_LABELS, ATTENTION_SEVERITY_LABELS } from '@/lib/coordinationConstants';

export default function CoordinationMeetingsTab({ coordinationData, isResponsable, currentUserId, colors, onRefresh }) {
  const { meetings = [], members = [] } = coordinationData;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', date: '', start_time: '', end_time: '', location: '', agenda: '', participant_ids: [], external_participants: [] });
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [reportModal, setReportModal] = useState(null);
  const [extName, setExtName] = useState('');

  const upcoming = (meetings || []).filter(m => isUpcoming(m.date) && m.status === 'planned').sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = (meetings || []).filter(m => !isUpcoming(m.date) || m.status !== 'planned').sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

  const openForm = (item = null) => {
    if (item) {
      setEditing(item.id);
      setForm({ title: item.title, date: item.date, start_time: item.start_time || '', end_time: item.end_time || '', location: item.location || '', agenda: item.agenda || '', participant_ids: item.participant_ids || [], external_participants: item.external_participants || [] });
    } else {
      setEditing(null);
      setForm({ title: '', date: '', start_time: '', end_time: '', location: '', agenda: '', participant_ids: [], external_participants: [] });
    }
    setShowForm(true);
  };

  const save = async () => {
    if (!form.title || !form.date) return;
    setSaving(true);
    try {
      const participant_names = (form.participant_ids || []).map(uid => members.find(m => m.user_id === uid)?.full_name || '').filter(Boolean);
      await base44.functions.invoke('manageCoordinationItem', {
        department_slug: coordinationData.department.slug,
        operation: editing ? 'update_meeting' : 'save_meeting',
        item: { ...form, participant_names },
        item_id: editing,
      });
      setShowForm(false);
      setEditing(null);
      onRefresh?.();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette réunion ?')) return;
    try {
      await base44.functions.invoke('manageCoordinationItem', { department_slug: coordinationData.department.slug, operation: 'delete_meeting', item_id: id });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  const toggleParticipant = (uid) => {
    setForm(f => ({
      ...f,
      participant_ids: f.participant_ids.includes(uid) ? f.participant_ids.filter(x => x !== uid) : [...f.participant_ids, uid],
    }));
  };

  const addExternal = () => {
    if (!extName.trim()) return;
    setForm(f => ({ ...f, external_participants: [...(f.external_participants || []), extName.trim()] }));
    setExtName('');
  };

  const removeExternal = (idx) => {
    setForm(f => ({ ...f, external_participants: f.external_participants.filter((_, i) => i !== idx) }));
  };

  return (
    <div className="space-y-4">
      {isResponsable && (
        <button onClick={() => openForm()} className={`w-full flex items-center justify-center gap-2 ${colors.bg} border ${colors.border} ${colors.text} py-3 rounded-xl text-sm font-medium hover:brightness-110 transition-all`}>
          <Plus className="w-4 h-4" /> Nouvelle réunion
        </button>
      )}

      {showForm && isResponsable && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Titre de la réunion" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <div className="grid grid-cols-3 gap-3">
            <input type="date" className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Début" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
            <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Fin" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
          </div>
          <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Lieu" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          <textarea className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" rows={2} placeholder="Ordre du jour" value={form.agenda} onChange={e => setForm(f => ({ ...f, agenda: e.target.value }))} />
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Participants internes</p>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {members.map(m => (
                <button
                  key={m.id}
                  onClick={() => toggleParticipant(m.user_id)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border ${(form.participant_ids || []).includes(m.user_id) ? `${colors.bg} ${colors.text} ${colors.border}` : 'border-border text-muted-foreground'}`}
                >
                  {m.full_name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Participants externes</p>
            <div className="flex gap-2">
              <input className="flex-1 bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Nom" value={extName} onChange={e => setExtName(e.target.value)} />
              <button onClick={addExternal} className="px-3 bg-surface border border-border rounded-xl text-sm">+</button>
            </div>
            {(form.external_participants || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.external_participants.map((name, idx) => (
                  <span key={idx} className="text-xs bg-surface border border-border rounded-lg px-2.5 py-1 flex items-center gap-1">
                    {name}
                    <button onClick={() => removeExternal(idx)}><X className="w-3 h-3 text-muted-foreground" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className={`flex-1 ${colors.bg} ${colors.text} border ${colors.border} py-2 rounded-xl text-sm font-medium`}>{saving ? '...' : editing ? 'Modifier' : 'Créer'}</button>
            <button onClick={() => setShowForm(false)} className="px-4 bg-surface border border-border rounded-xl text-sm">Annuler</button>
          </div>
        </div>
      )}

      {upcoming.length === 0 && past.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucune réunion de coordination prévue.</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">À venir</p>
              <div className="space-y-3">
                {upcoming.map(m => (
                  <MeetingCard
                    key={m.id}
                    meeting={m}
                    expanded={expanded === m.id}
                    onToggle={() => setExpanded(expanded === m.id ? null : m.id)}
                    onDelete={isResponsable ? () => handleDelete(m.id) : null}
                    onReport={isResponsable ? () => setReportModal(m) : null}
                  />
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Passées</p>
              <div className="space-y-2">
                {past.map(m => (
                  <MeetingCard
                    key={m.id}
                    meeting={m}
                    expanded={expanded === m.id}
                    onToggle={() => setExpanded(expanded === m.id ? null : m.id)}
                    onDelete={isResponsable ? () => handleDelete(m.id) : null}
                    onReport={isResponsable ? () => setReportModal(m) : null}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {reportModal && (
        <ReportModal
          meeting={reportModal}
          members={members}
          slug={coordinationData.department.slug}
          colors={colors}
          onClose={() => setReportModal(null)}
          onSaved={() => { setReportModal(null); onRefresh?.(); }}
        />
      )}
    </div>
  );
}

function MeetingCard({ meeting, expanded, onToggle, onDelete, onReport }) {
  const hasReport = meeting.status === 'completed' && (meeting.notes || meeting.decisions);
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 hover:bg-surface/50 transition-colors">
        <div className="text-left">
          <p className="text-sm font-semibold text-foreground">{meeting.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDateShort(meeting.date)} {meeting.start_time && `· ${meeting.start_time}`}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-1 rounded-full border ${MEETING_STATUS_COLORS[meeting.status] || ''}`}>{MEETING_STATUS_LABELS[meeting.status] || meeting.status}</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {meeting.start_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {meeting.start_time}{meeting.end_time && ` → ${meeting.end_time}`}</span>}
            {meeting.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {meeting.location}</span>}
          </div>
          {meeting.agenda && <p className="text-sm text-muted-foreground">{meeting.agenda}</p>}
          {(meeting.participant_names?.length > 0 || meeting.external_participants?.length > 0) && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">Participants</p>
              <div className="flex flex-wrap gap-1.5">
                {(meeting.participant_names || []).map((n, i) => <span key={i} className="text-xs bg-surface border border-border rounded-lg px-2 py-0.5">{n}</span>)}
                {(meeting.external_participants || []).map((n, i) => <span key={`ext-${i}`} className="text-xs bg-surface border border-border rounded-lg px-2 py-0.5">{n}</span>)}
              </div>
            </div>
          )}
          {hasReport && (
            <div className="p-3 rounded-xl bg-green-500/5 border border-green-400/20">
              <p className="text-[10px] uppercase tracking-widest text-green-700 font-medium mb-1">Compte rendu</p>
              {meeting.notes && <p className="text-xs text-foreground mb-2">{meeting.notes}</p>}
              {meeting.decisions && <p className="text-xs text-foreground"><strong>Décisions:</strong> {meeting.decisions}</p>}
            </div>
          )}
          <div className="flex gap-2">
            {onReport && !hasReport && <button onClick={onReport} className="text-xs bg-surface border border-border rounded-lg px-2.5 py-1.5 flex items-center gap-1"><FileText className="w-3 h-3" /> Compte rendu</button>}
            {onReport && hasReport && <button onClick={onReport} className="text-xs bg-surface border border-border rounded-lg px-2.5 py-1.5 flex items-center gap-1"><FileText className="w-3 h-3" /> Modifier CR</button>}
            {onDelete && <button onClick={onDelete} className="text-xs text-red-500/70 hover:text-red-600 flex items-center gap-1 px-2.5 py-1.5"><Trash2 className="w-3 h-3" /> Supprimer</button>}
          </div>
        </div>
      )}
    </div>
  );
}

function ReportModal({ meeting, members, slug, colors, onClose, onSaved }) {
  const [notes, setNotes] = useState(meeting.notes || '');
  const [decisions, setDecisions] = useState(meeting.decisions || '');
  const [saving, setSaving] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [newFollowup, setNewFollowup] = useState({ title: '', assigned_to: '', priority: 'normal' });
  const [newAttention, setNewAttention] = useState({ title: '', severity: 'watch' });

  const save = async () => {
    setSaving(true);
    try {
      await base44.functions.invoke('manageCoordinationItem', {
        department_slug: slug,
        operation: 'save_meeting_report',
        item: { notes, decisions },
        item_id: meeting.id,
      });
      onSaved();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const createFollowup = async () => {
    if (!newFollowup.title) return;
    const m = members.find(mm => mm.user_id === newFollowup.assigned_to);
    await base44.functions.invoke('manageCoordinationItem', {
      department_slug: slug,
      operation: 'create_followup_from_meeting',
      item: { title: newFollowup.title, assigned_to: newFollowup.assigned_to || null, assigned_to_name: m?.full_name || '', priority: newFollowup.priority },
      item_id: meeting.id,
    });
    setNewFollowup({ title: '', assigned_to: '', priority: 'normal' });
    onSaved();
  };

  const createAttention = async () => {
    if (!newAttention.title) return;
    await base44.functions.invoke('manageCoordinationItem', {
      department_slug: slug,
      operation: 'create_attention_from_meeting',
      item: { title: newAttention.title, severity: newAttention.severity },
      item_id: meeting.id,
    });
    setNewAttention({ title: '', severity: 'watch' });
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold">Compte rendu — {meeting.title}</p>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="space-y-3">
          <textarea className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" rows={4} placeholder="Compte rendu de la réunion" value={notes} onChange={e => setNotes(e.target.value)} />
          <textarea className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" rows={2} placeholder="Décisions prises" value={decisions} onChange={e => setDecisions(e.target.value)} />
          <button onClick={save} disabled={saving} className={`w-full ${colors.bg} ${colors.text} border ${colors.border} py-2.5 rounded-xl text-sm font-medium`}>{saving ? '...' : 'Enregistrer le CR'}</button>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <button onClick={() => setShowActions(s => !s)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <Plus className="w-3 h-3" /> Créer une action depuis ce CR
          </button>
          {showActions && (
            <div className="mt-3 space-y-3">
              <div className="bg-surface/50 rounded-xl p-3 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Nouveau suivi</p>
                <input className="w-full bg-white border border-border rounded-lg px-2.5 py-1.5 text-sm" placeholder="Titre" value={newFollowup.title} onChange={e => setNewFollowup(f => ({ ...f, title: e.target.value }))} />
                <div className="grid grid-cols-2 gap-2">
                  <select className="w-full bg-white border border-border rounded-lg px-2.5 py-1.5 text-sm" value={newFollowup.assigned_to} onChange={e => setNewFollowup(f => ({ ...f, assigned_to: e.target.value }))}>
                    <option value="">Non assigné</option>
                    {members.map(m => <option key={m.id} value={m.user_id}>{m.full_name}</option>)}
                  </select>
                  <select className="w-full bg-white border border-border rounded-lg px-2.5 py-1.5 text-sm" value={newFollowup.priority} onChange={e => setNewFollowup(f => ({ ...f, priority: e.target.value }))}>
                    {Object.entries(FOLLOWUP_PRIORITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <button onClick={createFollowup} className="text-xs bg-surface border border-border rounded-lg px-2.5 py-1.5">Créer le suivi</button>
              </div>
              <div className="bg-surface/50 rounded-xl p-3 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Nouveau point d'attention</p>
                <input className="w-full bg-white border border-border rounded-lg px-2.5 py-1.5 text-sm" placeholder="Titre" value={newAttention.title} onChange={e => setNewAttention(f => ({ ...f, title: e.target.value }))} />
                <select className="w-full bg-white border border-border rounded-lg px-2.5 py-1.5 text-sm" value={newAttention.severity} onChange={e => setNewAttention(f => ({ ...f, severity: e.target.value }))}>
                  {Object.entries(ATTENTION_SEVERITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <button onClick={createAttention} className="text-xs bg-surface border border-border rounded-lg px-2.5 py-1.5">Créer le point</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}