import React, { useState } from 'react';
import { ListChecks, Plus, X, Trash2, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS, TASK_STATUS_OPTIONS, TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS, TASK_PRIORITY_OPTIONS } from '@/lib/logisticsConstants';

export default function LogisticsTasksTab({ logisticsData, isResponsable, currentUserId, colors, onRefresh }) {
  const { plans = [], tasks = [], members = [] } = logisticsData;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ logistics_plan_id: '', title: '', description: '', assigned_to: '', priority: 'medium', due_at: '' });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const upcomingPlans = (plans || []).filter(p => p.status !== 'cancelled' && p.status !== 'completed');
  const allTasks = tasks || [];

  const save = async () => {
    if (!form.title || !form.logistics_plan_id) return;
    setSaving(true);
    try {
      const member = members.find(m => m.user_id === form.assigned_to);
      await base44.functions.invoke('manageLogisticsItem', {
        department_slug: logisticsData.department.slug,
        operation: 'save_task',
        item_id: editingId || undefined,
        item: {
          logistics_plan_id: form.logistics_plan_id,
          title: form.title,
          description: form.description,
          assigned_to: form.assigned_to || null,
          assigned_to_name: member?.full_name || '',
          priority: form.priority,
          due_at: form.due_at || null,
          status: editingId ? undefined : 'todo',
        },
      });
      setForm({ logistics_plan_id: '', title: '', description: '', assigned_to: '', priority: 'medium', due_at: '' });
      setShowForm(false);
      setEditingId(null);
      onRefresh?.();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await base44.functions.invoke('manageLogisticsItem', {
        department_slug: logisticsData.department.slug,
        operation: 'update_task_status',
        item_id: id,
        item: { status },
      });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette tâche ?')) return;
    try {
      await base44.functions.invoke('manageLogisticsItem', { department_slug: logisticsData.department.slug, operation: 'delete_task', item_id: id });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setForm({
      logistics_plan_id: t.logistics_plan_id,
      title: t.title,
      description: t.description || '',
      assigned_to: t.assigned_to || '',
      priority: t.priority || 'medium',
      due_at: t.due_at || '',
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      {isResponsable && (
        <button onClick={() => { setShowForm(s => !s); if (!showForm) { setEditingId(null); setForm({ logistics_plan_id: upcomingPlans[0]?.id || '', title: '', description: '', assigned_to: '', priority: 'medium', due_at: '' }); } }} className={`w-full flex items-center justify-center gap-2 ${colors.bg} border ${colors.border} ${colors.text} py-3 rounded-xl text-sm font-medium hover:brightness-110 transition-all`}>
          <Plus className="w-4 h-4" /> {editingId ? 'Modifier la tâche' : 'Nouvelle tâche'}
        </button>
      )}

      {showForm && isResponsable && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.logistics_plan_id} onChange={e => setForm(f => ({ ...f, logistics_plan_id: e.target.value }))}>
            <option value="">Sélectionner un plan...</option>
            {upcomingPlans.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Titre de la tâche" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <textarea className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" rows={2} placeholder="Description courte" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}>
              <option value="">Non assigné</option>
              {members.map(m => <option key={m.id} value={m.user_id}>{m.full_name}</option>)}
            </select>
            <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              {TASK_PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <input type="date" className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.due_at} onChange={e => setForm(f => ({ ...f, due_at: e.target.value }))} />
          <div className="flex gap-2">
            <button onClick={save} disabled={saving || !form.title || !form.logistics_plan_id} className={`flex-1 ${colors.bg} ${colors.text} border ${colors.border} py-2 rounded-xl text-sm font-medium disabled:opacity-50`}>{saving ? '...' : editingId ? 'Modifier' : 'Créer'}</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 bg-surface border border-border rounded-xl text-sm">Annuler</button>
          </div>
        </div>
      )}

      {allTasks.length === 0 ? (
        <div className="text-center py-12">
          <ListChecks className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucune tâche logistique.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {allTasks.map(t => {
            const isAssignee = t.assigned_to === currentUserId;
            const canUpdate = isResponsable || isAssignee;
            return (
              <div key={t.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{t.title}</p>
                    {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
                    {t.assigned_to_name && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><User className="w-3 h-3" /> {t.assigned_to_name}</p>
                    )}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${TASK_STATUS_COLORS[t.status] || ''} ml-2 flex-shrink-0`}>{TASK_STATUS_LABELS[t.status] || t.status}</span>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border flex-wrap">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${TASK_PRIORITY_COLORS[t.priority] || ''}`}>{TASK_PRIORITY_LABELS[t.priority] || t.priority}</span>
                  {canUpdate && (
                    <select value={t.status} onChange={e => updateStatus(t.id, e.target.value)} className="text-xs bg-white border border-border rounded-lg px-2 py-1">
                      {TASK_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  )}
                  {isResponsable && (
                    <>
                      <button onClick={() => startEdit(t)} className="text-xs text-muted-foreground hover:text-foreground">Modifier</button>
                      <button onClick={() => handleDelete(t.id)} className="text-xs text-red-500/60 hover:text-red-600 flex items-center gap-1"><Trash2 className="w-3 h-3" /></button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}