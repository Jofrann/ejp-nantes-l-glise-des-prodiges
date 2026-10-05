import React, { useState } from 'react';
import { Plus, X, Lock, Heart, Archive, Edit2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { TOPIC_CATEGORY_LABELS, TOPIC_CATEGORY_OPTIONS, TOPIC_PRIORITY_LABELS, TOPIC_PRIORITY_OPTIONS, TOPIC_PRIORITY_COLORS, TOPIC_VISIBILITY_LABELS, TOPIC_VISIBILITY_COLORS, TOPIC_VISIBILITY_OPTIONS } from '@/lib/prayerConstants';

export default function PrayerTopicsTab({ prayerData, isResponsable, isLeader, colors, onRefresh }) {
  const { topics = [] } = prayerData;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'autre', priority: 'medium', visibility: 'mpi', starts_at: '', ends_at: '' });
  const [saving, setSaving] = useState(false);

  const activeTopics = (topics || []).filter(t => t.status === 'active');

  const save = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      await base44.functions.invoke('managePrayerItem', {
        department_slug: prayerData.department.slug,
        operation: 'save_topic',
        item: form,
        item_id: editing?.id || null,
      });
      setForm({ title: '', description: '', category: 'autre', priority: 'medium', visibility: 'mpi', starts_at: '', ends_at: '' });
      setShowForm(false);
      setEditing(null);
      onRefresh?.();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleEdit = (topic) => {
    setEditing(topic);
    setForm({
      title: topic.title || '',
      description: topic.description || '',
      category: topic.category || 'autre',
      priority: topic.priority || 'medium',
      visibility: topic.visibility || 'mpi',
      starts_at: topic.starts_at || '',
      ends_at: topic.ends_at || '',
    });
    setShowForm(true);
  };

  const handleArchive = async (topicId) => {
    if (!confirm('Archiver ce sujet ?')) return;
    try {
      await base44.functions.invoke('managePrayerItem', {
        department_slug: prayerData.department.slug,
        operation: 'delete_topic',
        item_id: topicId,
      });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-4">
      {isResponsable && (
        <button
          onClick={() => { setEditing(null); setForm({ title: '', description: '', category: 'autre', priority: 'medium', visibility: 'mpi', starts_at: '', ends_at: '' }); setShowForm(s => !s); }}
          className={`w-full flex items-center justify-center gap-2 ${colors.bg} border ${colors.border} ${colors.text} py-3 rounded-xl text-sm font-medium hover:brightness-110 transition-all`}
        >
          <Plus className="w-4 h-4" /> Nouveau sujet
        </button>
      )}

      {showForm && isResponsable && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Titre du sujet (ex: Prier pour les étudiants)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <textarea className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" rows={2} placeholder="Description / contexte" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {TOPIC_CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              {TOPIC_PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.visibility} onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))}>
            {TOPIC_VISIBILITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {form.visibility === 'leaders' && !isLeader && (
            <p className="text-xs text-amber-600">Note : seuls les leaders pourront voir ce sujet.</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground">Début (optionnel)</label>
              <input type="date" className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.starts_at} onChange={e => setForm(f => ({ ...f, starts_at: e.target.value }))} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Fin (optionnel)</label>
              <input type="date" className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.ends_at} onChange={e => setForm(f => ({ ...f, ends_at: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className={`flex-1 ${colors.bg} ${colors.text} border ${colors.border} py-2 rounded-xl text-sm font-medium`}>{saving ? '...' : editing ? 'Modifier' : 'Créer'}</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 bg-surface border border-border rounded-xl text-sm">Annuler</button>
          </div>
        </div>
      )}

      {activeTopics.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun sujet actif.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeTopics.map(topic => (
            <div key={topic.id} className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{topic.title}</p>
                  {topic.description && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{topic.description}</p>}
                </div>
                {isResponsable && (
                  <div className="flex items-center gap-1 ml-2">
                    <button onClick={() => handleEdit(topic)} className="text-muted-foreground hover:text-foreground p-1"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleArchive(topic.id)} className="text-muted-foreground hover:text-red-500 p-1"><Archive className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                <span className="text-[10px] text-muted-foreground">{TOPIC_CATEGORY_LABELS[topic.category] || topic.category}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${TOPIC_PRIORITY_COLORS[topic.priority] || ''}`}>{TOPIC_PRIORITY_LABELS[topic.priority] || topic.priority}</span>
                {topic.visibility !== 'mpi' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${TOPIC_VISIBILITY_COLORS[topic.visibility] || ''}`}>
                    {topic.visibility === 'restricted' && <Lock className="w-2.5 h-2.5 inline mr-0.5" />}
                    {TOPIC_VISIBILITY_LABELS[topic.visibility] || topic.visibility}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}