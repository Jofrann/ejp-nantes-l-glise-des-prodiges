import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { StickyNote, Plus, Send } from 'lucide-react';
import { canCreateMemberNote, NOTE_TYPE_LABELS } from '@/lib/fijPermissions';

export default function NotesTab({ fij, members, user }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const canAdd = canCreateMemberNote(user, fij);

  useEffect(() => {
    loadNotes();
  }, [fij.id]);

  const loadNotes = async () => {
    try {
      const n = await base44.entities.FijMemberNote.filter({ fij_id: fij.id }, '-created_date', 100);
      setNotes(n || []);
    } catch { setNotes([]); }
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      {canAdd && (
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 border border-border text-sm font-medium rounded-xl text-foreground hover:bg-surface"
        >
          <Plus className="w-4 h-4" /> Ajouter une note
        </button>
      )}

      {loading ? (
        <div className="text-center py-8"><div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin mx-auto" /></div>
      ) : notes.length === 0 ? (
        <div className="text-center py-10">
          <StickyNote className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Aucune note de suivi</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map(note => {
            const member = members.find(m => m.id === note.member_id);
            return (
              <div key={note.id} className="bg-card border border-border rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground">{member?.full_name || note.member_name || 'Membre'}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface text-muted-foreground">{NOTE_TYPE_LABELS[note.note_type] || 'Suivi'}</span>
                </div>
                <p className="text-sm text-foreground">{note.content}</p>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  {note.author_name || 'Anonyme'} · {new Date(note.created_date).toLocaleDateString('fr-FR')}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <AddNoteModal
          fij={fij}
          members={members}
          user={user}
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); loadNotes(); }}
        />
      )}
    </div>
  );
}

function AddNoteModal({ fij, members, user, onClose, onSaved }) {
  const [form, setForm] = useState({ member_id: '', note_type: 'suivi', content: '', visibility: 'pilote_fij' });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.member_id || !form.content.trim()) return;
    setSaving(true);
    const member = members.find(m => m.id === form.member_id);
    await base44.entities.FijMemberNote.create({
      ...form,
      fij_id: fij.id,
      member_name: member?.full_name || '',
      author_user_id: user.id,
      author_name: user.full_name || user.email,
      author_role: user.role || 'serviteur',
    });
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl p-5 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-foreground mb-4">Note de suivi — {fij.name}</h3>
        <div className="space-y-3">
          <select value={form.member_id} onChange={e => setForm({ ...form, member_id: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary">
            <option value="">Sélectionner un membre *</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
          </select>
          <select value={form.note_type} onChange={e => setForm({ ...form, note_type: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary">
            {Object.entries(NOTE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Note..." rows={3} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary resize-none" />
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 px-3 py-2 text-sm border border-border rounded-lg text-foreground hover:bg-surface">Annuler</button>
          <button onClick={submit} disabled={saving || !form.member_id || !form.content.trim()} className="flex-1 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-1">
            <Send className="w-3.5 h-3.5" /> {saving ? '...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}