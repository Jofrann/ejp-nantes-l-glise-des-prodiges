import React, { useState } from 'react';
import { ListChecks, Plus, X, Trash2, ChevronUp, ChevronDown, Clock, Mic } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { RUN_ITEM_TYPE_LABELS, RUN_ITEM_TYPE_OPTIONS, RUN_ITEM_TYPE_SHORT, RUN_ITEM_STATUS_LABELS, RUN_ITEM_STATUS_COLORS, formatDuration } from '@/lib/moderationConstants';

export default function ModerationRunTab({ moderationData, isResponsable, currentUserId, colors, onRefresh }) {
  const { plans = [], run_items_by_plan = {}, members = [] } = moderationData;
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'custom', duration_minutes: '', speaker_name: '', external_speaker_name: '', instructions: '' });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const plansWithRunItems = (plans || []).filter(p => p.status !== 'cancelled' && p.status !== 'completed');
  const currentPlan = plansWithRunItems.find(p => p.id === selectedPlanId) || plansWithRunItems[0];
  const runItems = currentPlan ? (run_items_by_plan[currentPlan.id] || []) : [];
  const sortedRunItems = [...runItems].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  const totalDuration = sortedRunItems.reduce((sum, r) => sum + (r.duration_minutes || 0), 0);

  const save = async () => {
    if (!form.title || !currentPlan) return;
    setSaving(true);
    try {
      await base44.functions.invoke('manageModerationItem', {
        department_slug: moderationData.department.slug,
        operation: 'save_run_item',
        item_id: editingId || undefined,
        item: {
          service_plan_id: currentPlan.id,
          title: form.title,
          type: form.type,
          duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : null,
          speaker_name: form.speaker_name,
          external_speaker_name: form.external_speaker_name,
          instructions: form.instructions,
          order_index: editingId ? undefined : sortedRunItems.length,
        },
      });
      setForm({ title: '', type: 'custom', duration_minutes: '', speaker_name: '', external_speaker_name: '', instructions: '' });
      setShowForm(false);
      setEditingId(null);
      onRefresh?.();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette séquence ?')) return;
    try {
      await base44.functions.invoke('manageModerationItem', { department_slug: moderationData.department.slug, operation: 'delete_run_item', item_id: id });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  const handleMove = async (item, direction) => {
    const idx = sortedRunItems.findIndex(r => r.id === item.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sortedRunItems.length) return;
    const swapItem = sortedRunItems[swapIdx];
    const items = [
      { id: item.id, order_index: swapItem.order_index },
      { id: swapItem.id, order_index: item.order_index },
    ];
    try {
      await base44.functions.invoke('manageModerationItem', {
        department_slug: moderationData.department.slug,
        operation: 'reorder_run_items',
        item: { items },
      });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      type: item.type || 'custom',
      duration_minutes: item.duration_minutes ? String(item.duration_minutes) : '',
      speaker_name: item.speaker_name || '',
      external_speaker_name: item.external_speaker_name || '',
      instructions: item.instructions || '',
    });
    setShowForm(true);
  };

  if (plansWithRunItems.length === 0) {
    return (
      <div className="text-center py-12">
        <ListChecks className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Aucun conducteur disponible.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sélecteur de plan */}
      {plansWithRunItems.length > 1 && (
        <select value={currentPlan?.id || ''} onChange={e => setSelectedPlanId(e.target.value)} className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm">
          {plansWithRunItems.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      )}

      {currentPlan && (
        <>
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{currentPlan.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sortedRunItems.length} séquences · {formatDuration(totalDuration) || 'durée non définie'}</p>
              </div>
              {totalDuration > 0 && (
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">{formatDuration(totalDuration)}</p>
                  <p className="text-[10px] text-muted-foreground">durée totale</p>
                </div>
              )}
            </div>
          </div>

          {isResponsable && (
            <button onClick={() => { setShowForm(s => !s); if (!showForm) { setEditingId(null); setForm({ title: '', type: 'custom', duration_minutes: '', speaker_name: '', external_speaker_name: '', instructions: '' }); } }} className={`w-full flex items-center justify-center gap-2 ${colors.bg} border ${colors.border} ${colors.text} py-3 rounded-xl text-sm font-medium hover:brightness-110 transition-all`}>
              <Plus className="w-4 h-4" /> {editingId ? 'Modifier la séquence' : 'Nouvelle séquence'}
            </button>
          )}

          {showForm && isResponsable && (
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Titre (ex: Louange, Enseignement)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {RUN_ITEM_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <input type="number" className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Durée (min)" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Intervenant interne (nom)" value={form.speaker_name} onChange={e => setForm(f => ({ ...f, speaker_name: e.target.value }))} />
                <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Intervenant externe (nom)" value={form.external_speaker_name} onChange={e => setForm(f => ({ ...f, external_speaker_name: e.target.value }))} />
              </div>
              <textarea className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" rows={2} placeholder="Instructions / consignes" value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} />
              <div className="flex gap-2">
                <button onClick={save} disabled={saving || !form.title} className={`flex-1 ${colors.bg} ${colors.text} border ${colors.border} py-2 rounded-xl text-sm font-medium disabled:opacity-50`}>{saving ? '...' : editingId ? 'Modifier' : 'Ajouter'}</button>
                <button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 bg-surface border border-border rounded-xl text-sm">Annuler</button>
              </div>
            </div>
          )}

          {sortedRunItems.length === 0 ? (
            <div className="text-center py-12">
              <ListChecks className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Aucune séquence. {isResponsable && 'Ajoute la première séquence du conducteur.'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedRunItems.map((item, idx) => (
                <div key={item.id} className="bg-card border border-border rounded-xl p-3">
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-bold text-muted-foreground font-mono w-6 text-center pt-0.5">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground flex-1">{item.title}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface text-muted-foreground">{RUN_ITEM_TYPE_SHORT[item.type] || item.type}</span>
                        {item.duration_minutes && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Clock className="w-3 h-3" />{item.duration_minutes}min</span>}
                      </div>
                      {(item.speaker_name || item.external_speaker_name) && (
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Mic className="w-3 h-3" /> {item.speaker_name || item.external_speaker_name}</p>
                      )}
                      {item.instructions && <p className="text-xs text-foreground mt-1 bg-surface/50 rounded-lg px-2 py-1.5">{item.instructions}</p>}
                    </div>
                    {isResponsable && (
                      <div className="flex flex-col gap-1">
                        <button onClick={() => handleMove(item, 'up')} disabled={idx === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronUp className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleMove(item, 'down')} disabled={idx === sortedRunItems.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronDown className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </div>
                  {isResponsable && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                      <button onClick={() => startEdit(item)} className="text-xs text-muted-foreground hover:text-foreground">Modifier</button>
                      <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500/60 hover:text-red-600 flex items-center gap-1"><Trash2 className="w-3 h-3" /> Supprimer</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}