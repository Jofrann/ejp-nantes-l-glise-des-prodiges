import React, { useState } from 'react';
import { Calendar, Plus, ChevronDown, ChevronUp, Trash2, MapPin, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatDate, formatDateShort, isUpcoming, COORD_PLAN_TYPE_LABELS, COORD_PLAN_TYPE_SHORT, COORD_PLAN_STATUS_LABELS, COORD_PLAN_STATUS_COLORS } from '@/lib/coordinationConstants';

export default function CoordinationPlanningTab({ coordinationData, isResponsable, currentUserId, colors, onRefresh }) {
  const { plans = [] } = coordinationData;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: '', start_time: '', end_time: '', location: '', type: 'coordination', status: 'planned' });
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const upcoming = (plans || []).filter(p => isUpcoming(p.date) && p.status !== 'cancelled' && p.status !== 'completed');
  const past = (plans || []).filter(p => !isUpcoming(p.date) && p.status !== 'cancelled').slice(0, 5);

  const save = async () => {
    if (!form.title || !form.date) return;
    setSaving(true);
    try {
      await base44.functions.invoke('manageCoordinationItem', {
        department_slug: coordinationData.department.slug,
        operation: 'save_plan',
        item: form,
      });
      setForm({ title: '', description: '', date: '', start_time: '', end_time: '', location: '', type: 'coordination', status: 'planned' });
      setShowForm(false);
      onRefresh?.();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce plan ?')) return;
    try {
      await base44.functions.invoke('manageCoordinationItem', { department_slug: coordinationData.department.slug, operation: 'delete_plan', item_id: id });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-4">
      {isResponsable && (
        <button onClick={() => setShowForm(s => !s)} className={`w-full flex items-center justify-center gap-2 ${colors.bg} border ${colors.border} ${colors.text} py-3 rounded-xl text-sm font-medium hover:brightness-110 transition-all`}>
          <Plus className="w-4 h-4" /> Nouveau plan
        </button>
      )}

      {showForm && isResponsable && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Titre" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <textarea className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" rows={2} placeholder="Description (optionnel)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {Object.entries(COORD_PLAN_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Début (HH:MM)" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
            <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Fin (HH:MM)" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
          </div>
          <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Lieu (optionnel)" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className={`flex-1 ${colors.bg} ${colors.text} border ${colors.border} py-2 rounded-xl text-sm font-medium`}>{saving ? '...' : 'Créer'}</button>
            <button onClick={() => setShowForm(false)} className="px-4 bg-surface border border-border rounded-xl text-sm">Annuler</button>
          </div>
        </div>
      )}

      {upcoming.length === 0 && past.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun plan de coordination.</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">À venir</p>
              <div className="space-y-3">
                {upcoming.map(plan => (
                  <PlanCard key={plan.id} plan={plan} expanded={expanded === plan.id} onToggle={() => setExpanded(expanded === plan.id ? null : plan.id)} onDelete={isResponsable ? () => handleDelete(plan.id) : null} />
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Récents</p>
              <div className="space-y-2">
                {past.map(plan => (
                  <div key={plan.id} className="flex items-center justify-between bg-surface/50 rounded-xl px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-foreground">{plan.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDateShort(plan.date)} · {COORD_PLAN_TYPE_SHORT[plan.type] || plan.type}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full border ${COORD_PLAN_STATUS_COLORS[plan.status] || ''}`}>{COORD_PLAN_STATUS_LABELS[plan.status] || plan.status}</span>
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

function PlanCard({ plan, expanded, onToggle, onDelete }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 hover:bg-surface/50 transition-colors">
        <div className="text-left">
          <p className="text-sm font-semibold text-foreground">{plan.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(plan.date)} {plan.start_time && `· ${plan.start_time}`}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-1 rounded-full border ${COORD_PLAN_STATUS_COLORS[plan.status] || ''}`}>{COORD_PLAN_STATUS_LABELS[plan.status] || plan.status}</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {plan.start_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {plan.start_time}{plan.end_time && ` → ${plan.end_time}`}</span>}
            {plan.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {plan.location}</span>}
            <span>{COORD_PLAN_TYPE_LABELS[plan.type] || plan.type}</span>
          </div>
          {onDelete && (
            <button onClick={onDelete} className="flex items-center gap-1 text-xs text-red-500/70 hover:text-red-600"><Trash2 className="w-3 h-3" /> Supprimer</button>
          )}
        </div>
      )}
    </div>
  );
}