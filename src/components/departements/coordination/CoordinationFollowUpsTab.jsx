import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronUp, Trash2, ListChecks, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatDateShort, isOverdue, FOLLOWUP_STATUS_LABELS, FOLLOWUP_STATUS_COLORS, FOLLOWUP_PRIORITY_LABELS, FOLLOWUP_PRIORITY_COLORS, FOLLOWUP_SOURCE_LABELS } from '@/lib/coordinationConstants';

const STATUS_FLOW = ['todo', 'in_progress', 'waiting', 'done', 'cancelled'];

export default function CoordinationFollowUpsTab({ coordinationData, isResponsable, currentUserId, colors, onRefresh }) {
  const { followups = [], members = [] } = coordinationData;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', assigned_to: '', assigned_to_name: '', due_date: '', priority: 'normal', source: 'internal' });
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('all');

  const myFollowups = followups.filter(f => f.assigned_to === currentUserId || f.created_by === currentUserId);
  const displayed = filter === 'mine' ? myFollowups : followups;
  const active = displayed.filter(f => f.status !== 'done' && f.status !== 'cancelled');
  const done = displayed.filter(f => f.status === 'done');

  const openForm = (item = null) => {
    if (item) {
      setEditing(item.id);
      setForm({ title: item.title, description: item.description || '', assigned_to: item.assigned_to || '', assigned_to_name: item.assigned_to_name || '', due_date: item.due_date || '', priority: item.priority || 'normal', source: item.source || 'internal' });
    } else {
      setEditing(null);
      setForm({ title: '', description: '', assigned_to: '', assigned_to_name: '', due_date: '', priority: 'normal', source: 'internal' });
    }
    setShowForm(true);
  };

  const save = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      await base44.functions.invoke('manageCoordinationItem', {
        department_slug: coordinationData.department.slug,
        operation: 'save_followup',
        item: form,
        item_id: editing,
      });
      setShowForm(false);
      setEditing(null);
      onRefresh?.();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const changeStatus = async (id, status) => {
    try {
      await base44.functions.invoke('manageCoordinationItem', {
        department_slug: coordinationData.department.slug,
        operation: 'update_followup_status',
        item: { status },
        item_id: id,
      });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce suivi ?')) return;
    try {
      await base44.functions.invoke('manageCoordinationItem', { department_slug: coordinationData.department.slug, operation: 'delete_followup', item_id: id });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={() => setFilter('all')} className={`text-xs px-3 py-1.5 rounded-lg border ${filter === 'all' ? `${colors.bg} ${colors.text} ${colors.border}` : 'border-border text-muted-foreground'}`}>Tous</button>
        <button onClick={() => setFilter('mine')} className={`text-xs px-3 py-1.5 rounded-lg border ${filter === 'mine' ? `${colors.bg} ${colors.text} ${colors.border}` : 'border-border text-muted-foreground'}`}>Mes suivis</button>
      </div>

      {isResponsable && (
        <button onClick={() => openForm()} className={`w-full flex items-center justify-center gap-2 ${colors.bg} border ${colors.border} ${colors.text} py-3 rounded-xl text-sm font-medium hover:brightness-110 transition-all`}>
          <Plus className="w-4 h-4" /> Nouveau suivi
        </button>
      )}

      {showForm && isResponsable && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Titre du suivi" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <textarea className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" rows={2} placeholder="Description (optionnel)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.assigned_to} onChange={e => {
              const m = members.find(mm => mm.user_id === e.target.value);
              setForm(f => ({ ...f, assigned_to: e.target.value, assigned_to_name: m?.full_name || '' }));
            }}>
              <option value="">Non assigné</option>
              {members.map(m => <option key={m.id} value={m.user_id}>{m.full_name}</option>)}
            </select>
            <input type="date" className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              {Object.entries(FOLLOWUP_PRIORITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
              {Object.entries(FOLLOWUP_SOURCE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className={`flex-1 ${colors.bg} ${colors.text} border ${colors.border} py-2 rounded-xl text-sm font-medium`}>{saving ? '...' : editing ? 'Modifier' : 'Créer'}</button>
            <button onClick={() => setShowForm(false)} className="px-4 bg-surface border border-border rounded-xl text-sm">Annuler</button>
          </div>
        </div>
      )}

      {active.length === 0 && done.length === 0 ? (
        <div className="text-center py-12">
          <ListChecks className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Tu n'as aucun suivi en cours.</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="space-y-2">
              {active.map(fu => (
                <FollowUpCard
                  key={fu.id}
                  fu={fu}
                  expanded={expanded === fu.id}
                  onToggle={() => setExpanded(expanded === fu.id ? null : fu.id)}
                  onStatusChange={(s) => changeStatus(fu.id, s)}
                  onEdit={isResponsable ? () => openForm(fu) : null}
                  onDelete={isResponsable ? () => handleDelete(fu.id) : null}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}
          {done.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Terminés</p>
              <div className="space-y-1.5">
                {done.map(fu => (
                  <div key={fu.id} className="flex items-center justify-between bg-surface/30 rounded-lg px-3 py-2">
                    <p className="text-sm text-muted-foreground line-through">{fu.title}</p>
                    <span className="text-[10px] text-muted-foreground">{fu.assigned_to_name || ''}</span>
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

function FollowUpCard({ fu, expanded, onToggle, onStatusChange, onEdit, onDelete, currentUserId }) {
  const overdue = fu.due_date && isOverdue(fu.due_date) && fu.status !== 'done';
  return (
    <div className={`bg-card border rounded-2xl overflow-hidden ${overdue ? 'border-red-400/30' : 'border-border'}`}>
      <button onClick={onToggle} className="w-full flex items-center justify-between p-3.5 hover:bg-surface/50 transition-colors">
        <div className="text-left flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{fu.title}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${FOLLOWUP_STATUS_COLORS[fu.status] || ''}`}>{FOLLOWUP_STATUS_LABELS[fu.status] || fu.status}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${FOLLOWUP_PRIORITY_COLORS[fu.priority] || ''}`}>{FOLLOWUP_PRIORITY_LABELS[fu.priority] || fu.priority}</span>
            {fu.assigned_to_name && <span className="text-xs text-muted-foreground">· {fu.assigned_to_name}</span>}
            {fu.due_date && <span className={`text-xs ${overdue ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>{overdue ? 'En retard — ' : ''}{formatDateShort(fu.due_date)}</span>}
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {expanded && (
        <div className="px-3.5 pb-3.5 space-y-2">
          {fu.description && <p className="text-sm text-muted-foreground">{fu.description}</p>}
          <div className="flex flex-wrap gap-2">
            <select
              value={fu.status}
              onChange={e => onStatusChange(e.target.value)}
              className="text-xs bg-white border border-border rounded-lg px-2 py-1.5"
            >
              {STATUS_FLOW.map(s => <option key={s} value={s}>{FOLLOWUP_STATUS_LABELS[s] || s}</option>)}
            </select>
            {onEdit && <button onClick={onEdit} className="text-xs bg-surface border border-border rounded-lg px-2.5 py-1.5">Modifier</button>}
            {onDelete && <button onClick={onDelete} className="text-xs text-red-500/70 hover:text-red-600 flex items-center gap-1 px-2.5 py-1.5"><Trash2 className="w-3 h-3" /> Supprimer</button>}
          </div>
        </div>
      )}
    </div>
  );
}