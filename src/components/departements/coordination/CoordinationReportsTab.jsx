import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronUp, Trash2, FileText, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatDateShort, REPORT_STATUS_LABELS, REPORT_STATUS_COLORS } from '@/lib/coordinationConstants';

export default function CoordinationReportsTab({ coordinationData, isResponsable, currentUserId, colors, onRefresh }) {
  const { reports = [] } = coordinationData;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', period_start: '', period_end: '', summary: '', difficulties: '', needs: '', decisions: '' });
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const openForm = (item = null) => {
    if (item) {
      setEditing(item.id);
      setForm({ title: item.title, period_start: item.period_start || '', period_end: item.period_end || '', summary: item.summary || '', difficulties: item.difficulties || '', needs: item.needs || '', decisions: item.decisions || '' });
    } else {
      setEditing(null);
      setForm({ title: '', period_start: '', period_end: '', summary: '', difficulties: '', needs: '', decisions: '' });
    }
    setShowForm(true);
  };

  const save = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      await base44.functions.invoke('manageCoordinationItem', {
        department_slug: coordinationData.department.slug,
        operation: 'save_report',
        item: { ...form, status: 'draft' },
        item_id: editing,
      });
      setShowForm(false);
      setEditing(null);
      onRefresh?.();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const submit = async (id) => {
    try {
      await base44.functions.invoke('manageCoordinationItem', { department_slug: coordinationData.department.slug, operation: 'submit_report', item_id: id });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  const changeStatus = async (id, status) => {
    try {
      await base44.functions.invoke('manageCoordinationItem', { department_slug: coordinationData.department.slug, operation: 'update_report_status', item: { status }, item_id: id });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce rapport ?')) return;
    try {
      await base44.functions.invoke('manageCoordinationItem', { department_slug: coordinationData.department.slug, operation: 'delete_report', item_id: id });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-4">
      {isResponsable && (
        <button onClick={() => openForm()} className={`w-full flex items-center justify-center gap-2 ${colors.bg} border ${colors.border} ${colors.text} py-3 rounded-xl text-sm font-medium hover:brightness-110 transition-all`}>
          <Plus className="w-4 h-4" /> Nouveau rapport
        </button>
      )}

      {showForm && isResponsable && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Titre du rapport" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">Période début</p>
              <input type="date" className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.period_start} onChange={e => setForm(f => ({ ...f, period_start: e.target.value }))} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">Période fin</p>
              <input type="date" className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.period_end} onChange={e => setForm(f => ({ ...f, period_end: e.target.value }))} />
            </div>
          </div>
          <textarea className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" rows={3} placeholder="Résumé" value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} />
          <textarea className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" rows={2} placeholder="Difficultés rencontrées" value={form.difficulties} onChange={e => setForm(f => ({ ...f, difficulties: e.target.value }))} />
          <textarea className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" rows={2} placeholder="Besoins identifiés" value={form.needs} onChange={e => setForm(f => ({ ...f, needs: e.target.value }))} />
          <textarea className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" rows={2} placeholder="Décisions prises" value={form.decisions} onChange={e => setForm(f => ({ ...f, decisions: e.target.value }))} />
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className={`flex-1 ${colors.bg} ${colors.text} border ${colors.border} py-2 rounded-xl text-sm font-medium`}>{saving ? '...' : editing ? 'Modifier' : 'Créer en brouillon'}</button>
            <button onClick={() => setShowForm(false)} className="px-4 bg-surface border border-border rounded-xl text-sm">Annuler</button>
          </div>
        </div>
      )}

      {reports.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun rapport de coordination.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map(r => (
            <div key={r.id} className="bg-card border border-border rounded-2xl overflow-hidden">
              <button onClick={() => setExpanded(expanded === r.id ? null : r.id)} className="w-full flex items-center justify-between p-3.5 hover:bg-surface/50 transition-colors">
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{r.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${REPORT_STATUS_COLORS[r.status] || ''}`}>{REPORT_STATUS_LABELS[r.status] || r.status}</span>
                    {(r.period_start || r.period_end) && <span className="text-xs text-muted-foreground">{formatDateShort(r.period_start)} → {formatDateShort(r.period_end)}</span>}
                  </div>
                </div>
                {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {expanded && (
                <div className="px-3.5 pb-3.5 space-y-2">
                  {r.summary && <p className="text-sm text-muted-foreground">{r.summary}</p>}
                  {r.difficulties && <p className="text-xs text-muted-foreground"><strong>Difficultés:</strong> {r.difficulties}</p>}
                  {r.needs && <p className="text-xs text-muted-foreground"><strong>Besoins:</strong> {r.needs}</p>}
                  {r.decisions && <p className="text-xs text-muted-foreground"><strong>Décisions:</strong> {r.decisions}</p>}
                  {r.submitted_by_name && <p className="text-xs text-muted-foreground">Par {r.submitted_by_name}</p>}
                  <div className="flex flex-wrap gap-2">
                    {isResponsable && r.status === 'draft' && <button onClick={() => submit(r.id)} className="text-xs bg-blue-500/10 text-blue-600 border border-blue-400/20 rounded-lg px-2.5 py-1.5">Soumettre</button>}
                    {isResponsable && (r.status === 'submitted' || r.status === 'correction_required') && (
                      <select value={r.status} onChange={e => changeStatus(r.id, e.target.value)} className="text-xs bg-white border border-border rounded-lg px-2 py-1.5">
                        <option value="submitted">Soumis</option>
                        <option value="validated">Validé</option>
                        <option value="correction_required">Correction requise</option>
                      </select>
                    )}
                    {isResponsable && <button onClick={() => openForm(r)} className="text-xs bg-surface border border-border rounded-lg px-2.5 py-1.5">Modifier</button>}
                    {isResponsable && <button onClick={() => handleDelete(r.id)} className="text-xs text-red-500/70 hover:text-red-600 flex items-center gap-1 px-2.5 py-1.5"><Trash2 className="w-3 h-3" /> Supprimer</button>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}