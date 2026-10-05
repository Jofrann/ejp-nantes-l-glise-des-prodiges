import React, { useState } from 'react';
import { Package, Plus, X, Trash2, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { EQUIPMENT_CATEGORY_LABELS, EQUIPMENT_CATEGORY_OPTIONS, EQUIPMENT_STATUS_LABELS, EQUIPMENT_STATUS_COLORS } from '@/lib/logisticsConstants';

export default function LogisticsEquipmentTab({ logisticsData, isResponsable, currentUserId, colors, onRefresh }) {
  const { equipment = [] } = logisticsData;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'autre', identifier: '', location: '', status: 'available', notes: '' });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? equipment : equipment.filter(e => e.category === filter);

  const save = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      await base44.functions.invoke('manageLogisticsItem', {
        department_slug: logisticsData.department.slug,
        operation: 'save_equipment',
        item_id: editingId || undefined,
        item: form,
      });
      setForm({ name: '', category: 'autre', identifier: '', location: '', status: 'available', notes: '' });
      setShowForm(false);
      setEditingId(null);
      onRefresh?.();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await base44.functions.invoke('manageLogisticsItem', {
        department_slug: logisticsData.department.slug,
        operation: 'save_equipment',
        item_id: id,
        item: { status },
      });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Retirer cet équipement ?')) return;
    try {
      await base44.functions.invoke('manageLogisticsItem', { department_slug: logisticsData.department.slug, operation: 'delete_equipment', item_id: id });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  const startEdit = (eq) => {
    setEditingId(eq.id);
    setForm({ name: eq.name, category: eq.category || 'autre', identifier: eq.identifier || '', location: eq.location || '', status: eq.status || 'available', notes: eq.notes || '' });
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      {isResponsable && (
        <button onClick={() => { setShowForm(s => !s); if (!showForm) { setEditingId(null); setForm({ name: '', category: 'autre', identifier: '', location: '', status: 'available', notes: '' }); } }} className={`w-full flex items-center justify-center gap-2 ${colors.bg} border ${colors.border} ${colors.text} py-3 rounded-xl text-sm font-medium hover:brightness-110 transition-all`}>
          <Plus className="w-4 h-4" /> {editingId ? 'Modifier le matériel' : 'Nouveau matériel'}
        </button>
      )}

      {showForm && isResponsable && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Nom (ex: Tables pliantes)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {EQUIPMENT_CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Identifiant (facultatif)" value={form.identifier} onChange={e => setForm(f => ({ ...f, identifier: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Lieu de stockage" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="available">Disponible</option>
              <option value="in_use">En usage</option>
              <option value="maintenance">Maintenance</option>
              <option value="missing">Manquant</option>
              <option value="retired">Retiré</option>
            </select>
          </div>
          <textarea className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" rows={2} placeholder="Notes techniques" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          <div className="flex gap-2">
            <button onClick={save} disabled={saving || !form.name} className={`flex-1 ${colors.bg} ${colors.text} border ${colors.border} py-2 rounded-xl text-sm font-medium disabled:opacity-50`}>{saving ? '...' : editingId ? 'Modifier' : 'Créer'}</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 bg-surface border border-border rounded-xl text-sm">Annuler</button>
          </div>
        </div>
      )}

      {/* Filtres par catégorie */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button onClick={() => setFilter('all')} className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap ${filter === 'all' ? `${colors.bg} ${colors.text} border ${colors.border}` : 'text-muted-foreground'}`}>Tous</button>
        {EQUIPMENT_CATEGORY_OPTIONS.map(o => (
          <button key={o.value} onClick={() => setFilter(o.value)} className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap ${filter === o.value ? `${colors.bg} ${colors.text} border ${colors.border}` : 'text-muted-foreground'}`}>{o.label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun matériel logistique.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(eq => (
            <div key={eq.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{eq.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface text-muted-foreground">{EQUIPMENT_CATEGORY_LABELS[eq.category] || eq.category}</span>
                    {eq.identifier && <span className="text-xs text-muted-foreground font-mono">{eq.identifier}</span>}
                  </div>
                  {eq.location && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {eq.location}</p>}
                  {eq.notes && <p className="text-xs text-foreground mt-1.5 bg-surface/50 rounded-lg px-2 py-1.5">{eq.notes}</p>}
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${EQUIPMENT_STATUS_COLORS[eq.status] || ''} ml-2 flex-shrink-0`}>{EQUIPMENT_STATUS_LABELS[eq.status] || eq.status}</span>
              </div>

              {isResponsable && (
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border flex-wrap">
                  <select value={eq.status} onChange={e => updateStatus(eq.id, e.target.value)} className="text-xs bg-white border border-border rounded-lg px-2 py-1">
                    <option value="available">Disponible</option>
                    <option value="in_use">En usage</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="missing">Manquant</option>
                    <option value="retired">Retiré</option>
                  </select>
                  <button onClick={() => startEdit(eq)} className="text-xs text-muted-foreground hover:text-foreground">Modifier</button>
                  <button onClick={() => handleDelete(eq.id)} className="text-xs text-red-500/60 hover:text-red-600 flex items-center gap-1"><Trash2 className="w-3 h-3" /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}