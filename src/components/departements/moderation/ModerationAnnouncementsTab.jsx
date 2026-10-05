import React, { useState } from 'react';
import { Megaphone, Plus, X, Trash2, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { ANNOUNCEMENT_PRIORITY_LABELS, ANNOUNCEMENT_PRIORITY_COLORS, ANNOUNCEMENT_STATUS_LABELS, ANNOUNCEMENT_STATUS_COLORS, formatDate } from '@/lib/moderationConstants';

export default function ModerationAnnouncementsTab({ moderationData, isResponsable, currentUserId, colors, onRefresh }) {
  const { announcements = [] } = moderationData;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', text: '', priority: 'medium', active_from: '', active_until: '' });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const save = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      await base44.functions.invoke('manageModerationItem', {
        department_slug: moderationData.department.slug,
        operation: 'save_announcement',
        item_id: editingId || undefined,
        item: { ...form, status: 'active' },
      });
      setForm({ title: '', text: '', priority: 'medium', active_from: '', active_until: '' });
      setShowForm(false);
      setEditingId(null);
      onRefresh?.();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Archiver cette annonce ?')) return;
    try {
      await base44.functions.invoke('manageModerationItem', { department_slug: moderationData.department.slug, operation: 'delete_announcement', item_id: id });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  const startEdit = (a) => {
    setEditingId(a.id);
    setForm({ title: a.title, text: a.text || '', priority: a.priority || 'medium', active_from: a.active_from || '', active_until: a.active_until || '' });
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      {isResponsable && (
        <button onClick={() => { setShowForm(s => !s); if (!showForm) { setEditingId(null); setForm({ title: '', text: '', priority: 'medium', active_from: '', active_until: '' }); } }} className={`w-full flex items-center justify-center gap-2 ${colors.bg} border ${colors.border} ${colors.text} py-3 rounded-xl text-sm font-medium hover:brightness-110 transition-all`}>
          <Plus className="w-4 h-4" /> {editingId ? 'Modifier l\'annonce' : 'Nouvelle annonce'}
        </button>
      )}

      {showForm && isResponsable && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Titre court" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <textarea className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" rows={3} placeholder="Texte de l'annonce" value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} />
          <div className="grid grid-cols-3 gap-3">
            <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
            <input type="date" className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.active_from} onChange={e => setForm(f => ({ ...f, active_from: e.target.value }))} />
            <input type="date" className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.active_until} onChange={e => setForm(f => ({ ...f, active_until: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving || !form.title} className={`flex-1 ${colors.bg} ${colors.text} border ${colors.border} py-2 rounded-xl text-sm font-medium disabled:opacity-50`}>{saving ? '...' : editingId ? 'Modifier' : 'Créer'}</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 bg-surface border border-border rounded-xl text-sm">Annuler</button>
          </div>
        </div>
      )}

      {announcements.length === 0 ? (
        <div className="text-center py-12">
          <Megaphone className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucune annonce active.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {announcements.map(a => (
            <div key={a.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-semibold text-foreground">{a.title}</p>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${ANNOUNCEMENT_PRIORITY_COLORS[a.priority] || ''}`}>{ANNOUNCEMENT_PRIORITY_LABELS[a.priority] || a.priority}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${ANNOUNCEMENT_STATUS_COLORS[a.status] || ''}`}>{ANNOUNCEMENT_STATUS_LABELS[a.status] || a.status}</span>
                </div>
              </div>
              {a.text && <p className="text-xs text-foreground whitespace-pre-wrap">{a.text}</p>}
              {(a.active_from || a.active_until) && (
                <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {a.active_from && formatDate(a.active_from)}
                  {a.active_from && a.active_until && ' → '}
                  {a.active_until && formatDate(a.active_until)}
                </p>
              )}
              {isResponsable && (
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border">
                  <button onClick={() => startEdit(a)} className="text-xs text-muted-foreground hover:text-foreground">Modifier</button>
                  <button onClick={() => handleDelete(a.id)} className="text-xs text-red-500/60 hover:text-red-600 flex items-center gap-1"><Trash2 className="w-3 h-3" /> Archiver</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}