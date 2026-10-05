import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronUp, Trash2, AlertTriangle, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatDateShort, isOverdue, ATTENTION_SEVERITY_LABELS, ATTENTION_SEVERITY_COLORS, ATTENTION_STATUS_LABELS, ATTENTION_STATUS_COLORS } from '@/lib/coordinationConstants';

export default function CoordinationAttentionTab({ coordinationData, isResponsable, currentUserId, colors, onRefresh }) {
  const { attention_points = [], members = [] } = coordinationData;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', expected_action: '', severity: 'watch', assigned_to: '', assigned_to_name: '', due_date: '' });
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const open = attention_points.filter(a => a.status === 'open' || a.status === 'in_progress');
  const resolved = attention_points.filter(a => a.status === 'resolved' || a.status === 'dismissed');

  const openForm = (item = null) => {
    if (item) {
      setEditing(item.id);
      setForm({ title: item.title, description: item.description || '', expected_action: item.expected_action || '', severity: item.severity || 'watch', assigned_to: item.assigned_to || '', assigned_to_name: item.assigned_to_name || '', due_date: item.due_date || '' });
    } else {
      setEditing(null);
      setForm({ title: '', description: '', expected_action: '', severity: 'watch', assigned_to: '', assigned_to_name: '', due_date: '' });
    }
    setShowForm(true);
  };

  const save = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      await base44.functions.invoke('manageCoordinationItem', {
        department_slug: coordinationData.department.slug,
        operation: 'save_attention',
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
        operation: 'update_attention_status',
        item: { status },
        item_id: id,
      });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce point d\'attention ?')) return;
    try {
      await base44.functions.invoke('manageCoordinationItem', { department_slug: coordinationData.department.slug, operation: 'delete_attention', item_id: id });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-4">
      {isResponsable && (
        <button onClick={() => openForm()} className={`w-full flex items-center justify-center gap-2 ${colors.bg} border ${colors.border} ${colors.text} py-3 rounded-xl text-sm font-medium hover:brightness-110 transition-all`}>
          <Plus className="w-4 h-4" /> Nouveau point d'attention
        </button>
      )}

      {showForm && isResponsable && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Titre" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <textarea className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" rows={2} placeholder="Ce qui nécessite l'attention et pourquoi" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Action attendue" value={form.expected_action} onChange={e => setForm(f => ({ ...f, expected_action: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}>
              {Object.entries(ATTENTION_SEVERITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.assigned_to} onChange={e => {
              const m = members.find(mm => mm.user_id === e.target.value);
              setForm(f => ({ ...f, assigned_to: e.target.value, assigned_to_name: m?.full_name || '' }));
            }}>
              <option value="">Non assigné</option>
              {members.map(m => <option key={m.id} value={m.user_id}>{m.full_name}</option>)}
            </select>
          </div>
          <input type="date" className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className={`flex-1 ${colors.bg} ${colors.text} border ${colors.border} py-2 rounded-xl text-sm font-medium`}>{saving ? '...' : editing ? 'Modifier' : 'Créer'}</button>
            <button onClick={() => setShowForm(false)} className="px-4 bg-surface border border-border rounded-xl text-sm">Annuler</button>
          </div>
        </div>
      )}

      {open.length === 0 && resolved.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun point d'attention actuellement.</p>
        </div>
      ) : (
        <>
          {open.length > 0 && (
            <div className="space-y-2">
              {open.map(a => (
                <AttentionCard
                  key={a.id}
                  a={a}
                  expanded={expanded === a.id}
                  onToggle={() => setExpanded(expanded === a.id ? null : a.id)}
                  onStatusChange={(s) => changeStatus(a.id, s)}
                  onEdit={isResponsable ? () => openForm(a) : null}
                  onDelete={isResponsable ? () => handleDelete(a.id) : null}
                />
              ))}
            </div>
          )}
          {resolved.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Résolus</p>
              <div className="space-y-1.5">
                {resolved.slice(0, 5).map(a => (
                  <div key={a.id} className="flex items-center justify-between bg-surface/30 rounded-lg px-3 py-2">
                    <p className="text-sm text-muted-foreground">{a.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${ATTENTION_STATUS_COLORS[a.status] || ''}`}>{ATTENTION_STATUS_LABELS[a.status] || a.status}</span>
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

function AttentionCard({ a, expanded, onToggle, onStatusChange, onEdit, onDelete }) {
  const overdue = a.due_date && isOverdue(a.due_date) && a.status !== 'resolved';
  return (
    <div className={`bg-card border rounded-2xl overflow-hidden ${overdue ? 'border-red-400/30' : 'border-border'}`}>
      <button onClick={onToggle} className="w-full flex items-center justify-between p-3.5 hover:bg-surface/50 transition-colors">
        <div className="text-left flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${ATTENTION_SEVERITY_COLORS[a.severity] || ''}`}>{ATTENTION_SEVERITY_LABELS[a.severity] || a.severity}</span>
            <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${ATTENTION_STATUS_COLORS[a.status] || ''}`}>{ATTENTION_STATUS_LABELS[a.status] || a.status}</span>
            {a.assigned_to_name && <span className="text-xs text-muted-foreground">· {a.assigned_to_name}</span>}
            {a.due_date && <span className={`text-xs ${overdue ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>{overdue ? 'En retard — ' : ''}{formatDateShort(a.due_date)}</span>}
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {expanded && (
        <div className="px-3.5 pb-3.5 space-y-2">
          {a.description && <p className="text-sm text-muted-foreground">{a.description}</p>}
          {a.expected_action && (
            <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-400/20">
              <p className="text-[10px] uppercase tracking-widest text-amber-700 font-medium mb-0.5">Action attendue</p>
              <p className="text-xs text-foreground">{a.expected_action}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <select value={a.status} onChange={e => onStatusChange(e.target.value)} className="text-xs bg-white border border-border rounded-lg px-2 py-1.5">
              <option value="open">Ouvert</option>
              <option value="in_progress">En cours</option>
              <option value="resolved">Résolu</option>
              <option value="dismissed">Écarté</option>
            </select>
            {onEdit && <button onClick={onEdit} className="text-xs bg-surface border border-border rounded-lg px-2.5 py-1.5">Modifier</button>}
            {onDelete && <button onClick={onDelete} className="text-xs text-red-500/70 hover:text-red-600 flex items-center gap-1 px-2.5 py-1.5"><Trash2 className="w-3 h-3" /> Supprimer</button>}
          </div>
        </div>
      )}
    </div>
  );
}