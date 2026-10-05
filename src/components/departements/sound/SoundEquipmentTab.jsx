import React, { useState } from 'react';
import { Package, Plus, X, Edit2, AlertTriangle, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { EQUIPMENT_CATEGORY_LABELS, EQUIPMENT_STATUS_LABELS, EQUIPMENT_STATUS_COLORS } from '@/lib/soundConstants';

const CATEGORY_OPTIONS = Object.entries(EQUIPMENT_CATEGORY_LABELS).map(([value, label]) => ({ value, label }));
const STATUS_OPTIONS = Object.entries(EQUIPMENT_STATUS_LABELS).map(([value, label]) => ({ value, label }));

export default function SoundEquipmentTab({ soundData, isResponsable, colors, onRefresh }) {
  const { equipment = [], incidents = [] } = soundData;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = (equipment || []).filter(e =>
    !search || e.name?.toLowerCase().includes(search.toLowerCase()) || e.identifier?.toLowerCase().includes(search.toLowerCase())
  );

  const incidentMap = {};
  (incidents || []).forEach(i => { if (i.equipment_id) incidentMap[i.equipment_id] = i; });

  return (
    <div className="space-y-4">
      {isResponsable && (
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className={`w-full flex items-center justify-center gap-2 ${colors.bg} border ${colors.border} ${colors.text} py-3 rounded-xl text-sm font-medium hover:brightness-110 transition-all`}
        >
          <Plus className="w-4 h-4" /> Ajouter un équipement
        </button>
      )}

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input className="w-full bg-white border border-border rounded-xl pl-10 pr-3 py-2 text-sm" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun équipement enregistré.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(eq => (
            <div key={eq.id} className="bg-card border border-border rounded-xl p-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{eq.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {eq.identifier && <span className="text-[10px] text-muted-foreground font-mono bg-surface px-1.5 py-0.5 rounded">{eq.identifier}</span>}
                    <span className="text-[10px] text-muted-foreground">{EQUIPMENT_CATEGORY_LABELS[eq.category] || eq.category}</span>
                  </div>
                  {eq.location && <p className="text-xs text-muted-foreground mt-1">📍 {eq.location}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] px-2 py-1 rounded-full border ${EQUIPMENT_STATUS_COLORS[eq.status] || ''}`}>{EQUIPMENT_STATUS_LABELS[eq.status] || eq.status}</span>
                  {isResponsable && (
                    <button onClick={() => { setEditing(eq); setShowForm(true); }} className="text-muted-foreground hover:text-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              </div>

              {/* Incident lié */}
              {incidentMap[eq.id] && (
                <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 bg-amber-500/5 border border-amber-400/20 rounded-lg px-2.5 py-1.5">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="truncate">{incidentMap[eq.id].title}</span>
                </div>
              )}

              {eq.notes && <p className="text-xs text-muted-foreground mt-2">{eq.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {showForm && isResponsable && (
        <EquipmentForm
          editing={editing}
          colors={colors}
          slug={soundData.department.slug}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); onRefresh?.(); }}
        />
      )}
    </div>
  );
}

function EquipmentForm({ editing, colors, slug, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: editing?.name || '',
    category: editing?.category || 'other',
    identifier: editing?.identifier || '',
    location: editing?.location || '',
    status: editing?.status || 'available',
    notes: editing?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      await base44.functions.invoke('manageSoundItem', {
        department_slug: slug,
        operation: 'save_equipment',
        item: form,
        item_id: editing?.id || null,
      });
      onSaved();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const inputCls = "w-full bg-white border border-border rounded-xl px-3 py-2 text-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold">{editing ? 'Modifier' : 'Nouvel'} équipement</p>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="space-y-3">
          <input className={inputCls} placeholder="Nom (ex: Console X32)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <select className={inputCls} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input className={inputCls} placeholder="Tag (SONO-001)" value={form.identifier} onChange={e => setForm(f => ({ ...f, identifier: e.target.value }))} />
            <input className={inputCls} placeholder="Lieu" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          </div>
          <select className={inputCls} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <textarea className={inputCls} rows={2} placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          <button onClick={save} disabled={saving || !form.name} className={`w-full ${colors.bg} ${colors.text} border ${colors.border} py-2.5 rounded-xl text-sm font-medium disabled:opacity-50`}>{saving ? '...' : 'Enregistrer'}</button>
        </div>
      </div>
    </div>
  );
}