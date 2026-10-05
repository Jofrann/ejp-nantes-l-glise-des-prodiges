import React, { useState } from 'react';
import { Package, Plus, X, Trash2, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { NEED_CATEGORY_LABELS, NEED_CATEGORY_OPTIONS, NEED_STATUS_LABELS, NEED_STATUS_COLORS, NEED_STATUS_OPTIONS } from '@/lib/logisticsConstants';

export default function LogisticsNeedsTab({ logisticsData, isResponsable, currentUserId, colors, onRefresh }) {
  const { needs = [], plans = [], members = [] } = logisticsData;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ logistics_plan_id: '', title: '', category: 'materiel', quantity: '', assigned_to: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const activeNeeds = (needs || []).filter(n => n.status !== 'cancelled');

  const save = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      const member = members.find(m => m.user_id === form.assigned_to);
      await base44.functions.invoke('manageLogisticsItem', {
        department_slug: logisticsData.department.slug,
        operation: 'save_need',
        item_id: editingId || undefined,
        item: {
          logistics_plan_id: form.logistics_plan_id || null,
          title: form.title,
          category: form.category,
          quantity: form.quantity,
          assigned_to: form.assigned_to || null,
          assigned_to_name: member?.full_name || '',
          notes: form.notes,
          status: editingId ? undefined : 'requested',
        },
      });
      setForm({ logistics_plan_id: '', title: '', category: 'materiel', quantity: '', assigned_to: '', notes: '' });
      setShowForm(false);
      setEditingId(null);
      onRefresh?.();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await base44.functions.invoke('manageLogisticsItem', {
        department_slug: logisticsData.department.slug,
        operation: 'save_need',
        item_id: id,
        item: { status },
      });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Annuler ce besoin ?')) return;
    try {
      await base44.functions.invoke('manageLogisticsItem', { department_slug: logisticsData.department.slug, operation: 'delete_need', item_id: id });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  const startEdit = (n) => {
    setEditingId(n.id);
    setForm({
      logistics_plan_id: n.logistics_plan_id || '',
      title: n.title,
      category: n.category || 'materiel',
      quantity: n.quantity || '',
      assigned_to: n.assigned_to || '',
      notes: n.notes || '',
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      {isResponsable && (
        <button onClick={() => { setShowForm(s => !s); if (!showForm) { setEditingId(null); setForm({ logistics_plan_id: '', title: '', category: 'materiel', quantity: '', assigned_to: '', notes: '' }); } }} className={`w-full flex items-center justify-center gap-2 ${colors.bg} border ${colors.border} ${colors.text} py-3 rounded-xl text-sm font-medium hover:brightness-110 transition-all`}>
          <Plus className="w-4 h-4" /> {editingId ? 'Modifier le besoin' : 'Nouveau besoin'}
        </button>
      )}

      {showForm && isResponsable && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.logistics_plan_id} onChange={e => setForm(f => ({ ...f, logistics_plan_id: e.target.value }))}>
            <option value="">Sans plan spécifique</option>
            {plans.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Titre (ex: 10 bouteilles d'eau)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {NEED_CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Quantité (facultatif)" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
          </div>
          <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}>
            <option value="">Non assigné</option>
            {members.map(m => <option key={m.id} value={m.user_id}>{m.full_name}</option>)}
          </select>
          <textarea className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" rows={2} placeholder="Notes courtes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          <div className="flex gap-2">
            <button onClick={save} disabled={saving || !form.title} className={`flex-1 ${colors.bg} ${colors.text} border ${colors.border} py-2 rounded-xl text-sm font-medium disabled:opacity-50`}>{saving ? '...' : editingId ? 'Modifier' : 'Créer'}</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 bg-surface border border-border rounded-xl text-sm">Annuler</button>
          </div>
        </div>
      )}

      {activeNeeds.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun besoin en cours.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {activeNeeds.map(n => (
            <div key={n.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{n.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface text-muted-foreground">{NEED_CATEGORY_LABELS[n.category] || n.category}</span>
                    {n.quantity && <span className="text-xs text-muted-foreground">Qté: {n.quantity}</span>}
                  </div>
                  {n.assigned_to_name && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><User className="w-3 h-3" /> {n.assigned_to_name}</p>}
                  {n.notes && <p className="text-xs text-foreground mt-1.5 bg-surface/50 rounded-lg px-2 py-1.5">{n.notes}</p>}
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${NEED_STATUS_COLORS[n.status] || ''} ml-2 flex-shrink-0`}>{NEED_STATUS_LABELS[n.status] || n.status}</span>
              </div>

              {isResponsable && (
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border flex-wrap">
                  <select value={n.status} onChange={e => updateStatus(n.id, e.target.value)} className="text-xs bg-white border border-border rounded-lg px-2 py-1">
                    {NEED_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <button onClick={() => startEdit(n)} className="text-xs text-muted-foreground hover:text-foreground">Modifier</button>
                  <button onClick={() => handleDelete(n.id)} className="text-xs text-red-500/60 hover:text-red-600 flex items-center gap-1"><Trash2 className="w-3 h-3" /> Annuler</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}