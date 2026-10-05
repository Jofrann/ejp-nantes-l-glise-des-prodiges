import React, { useState } from 'react';
import { ListChecks, Plus, X, Check, AlertTriangle, Play, Edit2, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { CHECKLIST_ITEM_STATE_LABELS, CHECKLIST_ITEM_STATE_COLORS, CHECKLIST_RUN_STATUS_LABELS, CHECKLIST_RUN_STATUS_COLORS } from '@/lib/soundConstants';

export default function SoundChecklistsTab({ soundData, isResponsable, currentUserId, colors, onRefresh }) {
  const { checklist_templates = [], checklist_runs_by_plan = {}, item_states_by_run = {}, plans = [] } = soundData;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [activeRun, setActiveRun] = useState(null);

  const upcomingPlans = (plans || []).filter(p => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const d = new Date(p.date); d.setHours(0, 0, 0, 0);
    return d >= today && p.status !== 'cancelled';
  });

  return (
    <div className="space-y-4">
      {isResponsable && (
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className={`w-full flex items-center justify-center gap-2 ${colors.bg} border ${colors.border} ${colors.text} py-3 rounded-xl text-sm font-medium hover:brightness-110 transition-all`}
        >
          <Plus className="w-4 h-4" /> Nouveau template
        </button>
      )}

      {/* Templates */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Templates</p>
        {(checklist_templates || []).length === 0 ? (
          <div className="text-center py-8">
            <ListChecks className="w-7 h-7 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Aucune checklist disponible.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {checklist_templates.map(tpl => (
              <div key={tpl.id} className="bg-card border border-border rounded-xl p-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{tpl.name}</p>
                    {tpl.description && <p className="text-xs text-muted-foreground mt-0.5">{tpl.description}</p>}
                    <p className="text-[10px] text-muted-foreground mt-1">{(tpl.items || []).length} étape{(tpl.items || []).length > 1 ? 's' : ''}</p>
                  </div>
                  {isResponsable && (
                    <div className="flex items-center gap-1.5">
                      {upcomingPlans.length > 0 && (
                        <select
                          className="text-xs bg-surface border border-border rounded-lg px-2 py-1"
                          onChange={async (e) => {
                            if (!e.target.value) return;
                            try {
                              await base44.functions.invoke('manageSoundItem', {
                                department_slug: soundData.department.slug,
                                operation: 'start_checklist',
                                item: { template_id: tpl.id, service_plan_id: e.target.value },
                              });
                              onRefresh?.();
                            } catch (err) { console.error(err); }
                            e.target.value = '';
                          }}
                        >
                          <option value="">Démarrer...</option>
                          {upcomingPlans.map(p => <option key={p.id} value={p.id}>{p.title} — {p.date}</option>)}
                        </select>
                      )}
                      <button onClick={() => { setEditing(tpl); setShowForm(true); }} className="text-muted-foreground hover:text-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Runs actifs */}
      {Object.keys(checklist_runs_by_plan || {}).length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Checklists en cours</p>
          <div className="space-y-2">
            {Object.entries(checklist_runs_by_plan).map(([planId, runs]) => runs.map(run => {
              const items = item_states_by_run[run.id] || [];
              const doneCount = items.filter(i => i.state === 'done').length;
              const problemCount = items.filter(i => i.state === 'problem').length;
              const plan = plans?.find(p => p.id === planId);
              return (
                <button
                  key={run.id}
                  onClick={() => setActiveRun(run)}
                  className="w-full bg-card border border-border rounded-xl p-3 hover:border-secondary/30 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{run.template_name}</p>
                      <p className="text-xs text-muted-foreground">{plan?.title || 'Sans service'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{doneCount}/{items.length}</span>
                      {problemCount > 0 && <span className="text-xs text-red-600">⚠ {problemCount}</span>}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${CHECKLIST_RUN_STATUS_COLORS[run.status] || ''}`}>{CHECKLIST_RUN_STATUS_LABELS[run.status] || run.status}</span>
                    </div>
                  </div>
                </button>
              );
            }))}
          </div>
        </div>
      )}

      {/* Modal template form */}
      {showForm && isResponsable && (
        <TemplateForm
          editing={editing}
          colors={colors}
          slug={soundData.department.slug}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); onRefresh?.(); }}
        />
      )}

      {/* Modal run execution */}
      {activeRun && (
        <RunExecutionModal
          run={activeRun}
          items={item_states_by_run[activeRun.id] || []}
          isResponsable={isResponsable}
          colors={colors}
          slug={soundData.department.slug}
          onClose={() => setActiveRun(null)}
          onRefresh={() => { onRefresh?.(); }}
        />
      )}
    </div>
  );
}

function TemplateForm({ editing, colors, slug, onClose, onSaved }) {
  const [name, setName] = useState(editing?.name || '');
  const [description, setDescription] = useState(editing?.description || '');
  const [items, setItems] = useState((editing?.items || []).map(i => i.label));
  const [newItem, setNewItem] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name) return;
    setSaving(true);
    try {
      await base44.functions.invoke('manageSoundItem', {
        department_slug: slug,
        operation: 'save_template',
        item: {
          name, description,
          items: items.map((label, i) => ({ label, item_order: i })),
        },
        item_id: editing?.id || null,
      });
      onSaved();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold">{editing ? 'Modifier' : 'Nouveau'} template</p>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm mb-2" placeholder="Nom (ex: Checklist Avant Culte)" value={name} onChange={e => setName(e.target.value)} />
        <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm mb-3" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <p className="text-xs text-muted-foreground mb-2">Étapes</p>
        <div className="space-y-1.5 mb-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-5">{i + 1}.</span>
              <input className="flex-1 bg-white border border-border rounded-lg px-2 py-1.5 text-sm" value={item} onChange={e => setItems(items.map((it, j) => j === i ? e.target.value : it))} />
              <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-red-500/60"><X className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-3">
          <input className="flex-1 bg-white border border-border rounded-lg px-2 py-1.5 text-sm" placeholder="Nouvelle étape..." value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newItem) { setItems([...items, newItem]); setNewItem(''); }}} />
          <button onClick={() => { if (newItem) { setItems([...items, newItem]); setNewItem(''); } }} className={`px-3 ${colors.bg} ${colors.text} border ${colors.border} rounded-lg text-sm`}><Plus className="w-4 h-4" /></button>
        </div>
        <button onClick={save} disabled={saving || !name} className={`w-full ${colors.bg} ${colors.text} border ${colors.border} py-2.5 rounded-xl text-sm font-medium disabled:opacity-50`}>{saving ? '...' : 'Enregistrer'}</button>
      </div>
    </div>
  );
}

function RunExecutionModal({ run, items, isResponsable, colors, slug, onClose, onRefresh }) {
  const [localItems, setLocalItems] = useState(items);
  const [saving, setSaving] = useState(false);

  const updateItem = async (itemId, updates) => {
    setLocalItems(items => items.map(i => i.id === itemId ? { ...i, ...updates } : i));
    try {
      await base44.functions.invoke('manageSoundItem', {
        department_slug: slug,
        operation: 'update_checklist_item',
        item: updates,
        item_id: itemId,
      });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  const complete = async () => {
    setSaving(true);
    try {
      await base44.functions.invoke('manageSoundItem', {
        department_slug: slug,
        operation: 'complete_checklist',
        item_id: run.id,
      });
      onClose();
      onRefresh?.();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold">{run.template_name}</p>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="space-y-2">
          {localItems.sort((a, b) => (a.item_order || 0) - (b.item_order || 0)).map(item => (
            <div key={item.id} className="bg-surface/50 border border-border rounded-xl p-3">
              <p className="text-sm font-medium text-foreground mb-2">{item.item_label}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateItem(item.id, { state: item.state === 'done' ? 'todo' : 'done' })}
                  className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border ${item.state === 'done' ? 'bg-green-500/10 text-green-600 border-green-400/20' : 'bg-white text-muted-foreground border-border'}`}
                >
                  <Check className="w-3 h-3" /> OK
                </button>
                <button
                  onClick={() => updateItem(item.id, { state: item.state === 'problem' ? 'todo' : 'problem' })}
                  className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border ${item.state === 'problem' ? 'bg-red-500/10 text-red-600 border-red-400/20' : 'bg-white text-muted-foreground border-border'}`}
                >
                  <AlertTriangle className="w-3 h-3" /> Problème
                </button>
              </div>
              {item.state === 'problem' && (
                <input className="w-full mt-2 bg-white border border-border rounded-lg px-2 py-1 text-xs" placeholder="Note du problème..." defaultValue={item.note || ''} onBlur={e => updateItem(item.id, { note: e.target.value })} />
              )}
            </div>
          ))}
        </div>
        {isResponsable && run.status === 'in_progress' && (
          <button onClick={complete} disabled={saving} className={`w-full mt-4 ${colors.bg} ${colors.text} border ${colors.border} py-2.5 rounded-xl text-sm font-medium`}>
            {saving ? '...' : 'Terminer la checklist'}
          </button>
        )}
      </div>
    </div>
  );
}