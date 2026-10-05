import React, { useState } from 'react';
import { AlertTriangle, Plus, X, Edit2, Package, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { INCIDENT_SEVERITY_LABELS, INCIDENT_SEVERITY_COLORS, INCIDENT_STATUS_LABELS, INCIDENT_STATUS_COLORS } from '@/lib/soundConstants';

const SEVERITY_OPTIONS = Object.entries(INCIDENT_SEVERITY_LABELS).map(([value, label]) => ({ value, label }));
const STATUS_OPTIONS = Object.entries(INCIDENT_STATUS_LABELS).map(([value, label]) => ({ value, label }));

export default function SoundIncidentsTab({ soundData, isResponsable, currentUserId, colors, onRefresh }) {
  const { incidents = [], equipment = [], equipment_map = {}, plans = [] } = soundData;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  return (
    <div className="space-y-4">
      <button
        onClick={() => { setEditing(null); setShowForm(true); }}
        className={`w-full flex items-center justify-center gap-2 ${colors.bg} border ${colors.border} ${colors.text} py-3 rounded-xl text-sm font-medium hover:brightness-110 transition-all`}
      >
        <Plus className="w-4 h-4" /> Signaler un incident
      </button>

      {(incidents || []).length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun incident ouvert.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {incidents.map(inc => {
            const eq = inc.equipment_id ? equipment_map[inc.equipment_id] : null;
            return (
              <div key={inc.id} className="bg-card border border-border rounded-xl p-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{inc.title}</p>
                    {inc.description && <p className="text-xs text-muted-foreground mt-0.5">{inc.description}</p>}
                    {eq && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                        <Package className="w-3 h-3" />
                        <span>{eq.name}</span>
                      </div>
                    )}
                    {inc.reported_by_name && (
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span>Signalé par {inc.reported_by_name}</span>
                      </div>
                    )}
                    {inc.assigned_to_name && (
                      <p className="text-xs text-muted-foreground mt-0.5">Assigné à {inc.assigned_to_name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`text-[10px] px-2 py-1 rounded-full border ${INCIDENT_SEVERITY_COLORS[inc.severity] || ''}`}>{INCIDENT_SEVERITY_LABELS[inc.severity] || inc.severity}</span>
                    <span className={`text-[10px] px-2 py-1 rounded-full border ${INCIDENT_STATUS_COLORS[inc.status] || ''}`}>{INCIDENT_STATUS_LABELS[inc.status] || inc.status}</span>
                    {isResponsable && (
                      <button onClick={() => { setEditing(inc); setShowForm(true); }} className="text-muted-foreground hover:text-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                </div>

                {inc.resolution_notes && (
                  <div className="mt-2 p-2 rounded-lg bg-green-500/5 border border-green-400/20">
                    <p className="text-xs text-green-700">{inc.resolution_notes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <IncidentForm
          editing={editing}
          isResponsable={isResponsable}
          equipment={equipment}
          plans={plans}
          colors={colors}
          slug={soundData.department.slug}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); onRefresh?.(); }}
        />
      )}
    </div>
  );
}

function IncidentForm({ editing, isResponsable, equipment, plans, colors, slug, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: editing?.title || '',
    description: editing?.description || '',
    severity: editing?.severity || 'low',
    status: editing?.status || 'open',
    equipment_id: editing?.equipment_id || '',
    service_plan_id: editing?.service_plan_id || '',
    assigned_to_name: editing?.assigned_to_name || '',
    resolution_notes: editing?.resolution_notes || '',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      const operation = editing ? (isResponsable ? 'save_incident' : 'report_incident') : (isResponsable ? 'save_incident' : 'report_incident');
      await base44.functions.invoke('manageSoundItem', {
        department_slug: slug,
        operation,
        item: form,
        item_id: editing?.id || null,
      });
      onSaved();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const closeIncident = async () => {
    setSaving(true);
    try {
      await base44.functions.invoke('manageSoundItem', {
        department_slug: slug,
        operation: 'close_incident',
        item: { resolution_notes: form.resolution_notes },
        item_id: editing.id,
      });
      onSaved();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const inputCls = "w-full bg-white border border-border rounded-xl px-3 py-2 text-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold">{editing ? 'Modifier' : 'Signaler'} un incident</p>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="space-y-3">
          <input className={inputCls} placeholder="Titre (ex: Micro HF 2 — coupures)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <textarea className={inputCls} rows={2} placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <select className={inputCls} value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}>
            {SEVERITY_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select className={inputCls} value={form.equipment_id} onChange={e => setForm(f => ({ ...f, equipment_id: e.target.value }))}>
            <option value="">Aucun équipement lié</option>
            {equipment.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
          </select>
          {isResponsable && (
            <>
              <select className={inputCls} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <input className={inputCls} placeholder="Assigné à (nom)" value={form.assigned_to_name} onChange={e => setForm(f => ({ ...f, assigned_to_name: e.target.value }))} />
              {editing && (
                <textarea className={inputCls} rows={2} placeholder="Notes de résolution" value={form.resolution_notes} onChange={e => setForm(f => ({ ...f, resolution_notes: e.target.value }))} />
              )}
            </>
          )}
          <button onClick={save} disabled={saving || !form.title} className={`w-full ${colors.bg} ${colors.text} border ${colors.border} py-2.5 rounded-xl text-sm font-medium disabled:opacity-50`}>{saving ? '...' : 'Enregistrer'}</button>
          {editing && isResponsable && incCanBeClosed(editing) && (
            <button onClick={closeIncident} disabled={saving} className="w-full bg-green-500/10 text-green-600 border border-green-400/20 py-2.5 rounded-xl text-sm font-medium">Clôturer l'incident</button>
          )}
        </div>
      </div>
    </div>
  );
}

function incCanBeClosed(inc) {
  return inc.status !== 'closed' && inc.status !== 'resolved';
}