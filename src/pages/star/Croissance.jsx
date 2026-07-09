import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, BookOpen, Plus, X, BookMarked, Check, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TABS = [
  { key: 'parole', label: 'Parole', icon: Sprout },
  { key: 'notes', label: 'Notes', icon: BookOpen },
  { key: 'livres', label: 'Livres', icon: BookMarked },
];

export default function Croissance() {
  const [tab, setTab] = useState('parole');

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl font-heading font-bold text-foreground mb-1">Ma croissance</h1>
        <p className="text-sm text-muted-foreground">Ton espace personnel. Privé par défaut — personne ne voit tes notes.</p>
      </motion.div>

      <div className="flex gap-1 mb-6 p-1 bg-surface rounded-xl">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${tab === t.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'parole' && <ParoleTab />}
      {tab === 'notes' && <NotesTab />}
      {tab === 'livres' && <LivresTab />}
    </div>
  );
}

function ParoleTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ passage: '', verse_highlight: '', private_note: '' });
  const today = new Date().toISOString().split('T')[0];
  const readToday = logs.some(l => l.reading_date === today);

  const load = () => {
    base44.entities.ScriptureReadingLog.list('-reading_date', 50)
      .then(data => { setLogs(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markToday = async () => {
    await base44.entities.ScriptureReadingLog.create({ reading_date: today, status: 'read', passage: form.passage || 'Lecture du jour', verse_highlight: form.verse_highlight, private_note: form.private_note });
    setForm({ passage: '', verse_highlight: '', private_note: '' });
    setShowForm(false);
    load();
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-border border-t-secondary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 rounded-2xl p-5 text-center">
        <Sprout className="w-8 h-8 text-secondary mx-auto mb-3" />
        {readToday ? (
          <>
            <p className="text-sm font-semibold text-foreground">Tu as lu ta Parole aujourd'hui 🙏</p>
            <p className="text-xs text-muted-foreground mt-1">Continue de fidélité en fidélité.</p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-foreground mb-1">As-tu lu ta Parole aujourd'hui ?</p>
            <p className="text-xs text-muted-foreground mb-4">Prends un moment pour Dieu.</p>
            <button onClick={() => setShowForm(true)} className="px-4 py-2.5 rounded-xl bg-secondary text-white text-xs font-semibold hover:bg-secondary/90 transition-colors">
              J'ai lu aujourd'hui
            </button>
          </>
        )}
      </div>

      {logs.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Historique</p>
          <div className="space-y-2">
            {logs.map(l => (
              <div key={l.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">{new Date(l.reading_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span>
                </div>
                {l.passage && <p className="text-sm font-medium text-foreground">{l.passage}</p>}
                {l.verse_highlight && <p className="text-xs text-secondary italic mt-1">« {l.verse_highlight} »</p>}
                {l.private_note && <p className="text-xs text-muted-foreground mt-1">{l.private_note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)}
              className="fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-sm" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-card rounded-t-3xl border-t border-border p-6 pb-8">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-foreground">Lecture du jour</h3>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground p-1"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Passage lu</label>
                  <input value={form.passage} onChange={e => setForm({ ...form, passage: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm" placeholder="Ex: Jean 3:16" autoFocus />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Verset marquant</label>
                  <input value={form.verse_highlight} onChange={e => setForm({ ...form, verse_highlight: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm" placeholder="Le verset qui t'a parlé..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Méditation privée</label>
                  <textarea value={form.private_note} onChange={e => setForm({ ...form, private_note: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm" rows={3} placeholder="Ce que tu retiens..." />
                </div>
                <button onClick={markToday} className="w-full py-3 rounded-xl bg-secondary text-white text-sm font-semibold hover:bg-secondary/90 transition-colors">
                  Enregistrer ma lecture
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotesTab() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'meditation' });

  const load = () => {
    base44.entities.PersonalNote.filter({ is_pinned: false }, '-created_date', 50)
      .then(data => { setNotes(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    await base44.entities.PersonalNote.create({ ...form, visibility: 'private' });
    setForm({ title: '', content: '', category: 'meditation' });
    setShowForm(false);
    load();
  };

  const remove = async (id) => {
    await base44.entities.PersonalNote.delete(id);
    load();
  };

  const CATS = [
    { key: 'meditation', label: 'Méditation' },
    { key: 'enseignement', label: 'Enseignement' },
    { key: 'priere', label: 'Prière' },
    { key: 'habitude', label: 'Habitude' },
    { key: 'projet', label: 'Projet' },
    { key: 'autre', label: 'Autre' },
  ];

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-border border-t-secondary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <button onClick={() => setShowForm(true)} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-border text-xs font-medium text-muted-foreground hover:border-secondary/30 hover:text-secondary transition-colors">
        <Plus className="w-4 h-4" /> Ajouter une note
      </button>

      {notes.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-xs text-muted-foreground">Tes notes sont privées. Personne ne les voit.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map(n => (
            <motion.div key={n.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-card border border-border rounded-xl p-4 group">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-secondary">{CATS.find(c => c.key === n.category)?.label || 'Note'}</span>
                </div>
                <button onClick={() => remove(n.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <h4 className="text-sm font-semibold text-foreground">{n.title}</h4>
              <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{n.content}</p>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)}
              className="fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-sm" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-card rounded-t-3xl border-t border-border p-6 pb-8">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-foreground">Nouvelle note privée</h3>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground p-1"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Titre</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm" placeholder="Titre..." autoFocus />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Catégorie</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm">
                    {CATS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Contenu</label>
                  <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm" rows={4} placeholder="Écris ta note..." />
                </div>
                <button onClick={create} disabled={!form.title.trim() || !form.content.trim()}
                  className="w-full py-3 rounded-xl bg-secondary text-white text-sm font-semibold hover:bg-secondary/90 disabled:opacity-40 transition-colors">
                  Enregistrer
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function LivresTab() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', author: '', category: '', status: 'wishlist' });

  const load = () => {
    base44.entities.BookLog.list('-created_date', 50)
      .then(data => { setBooks(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.title.trim()) return;
    await base44.entities.BookLog.create({ ...form, started_at: form.status === 'reading' ? new Date().toISOString().split('T')[0] : null });
    setForm({ title: '', author: '', category: '', status: 'wishlist' });
    setShowForm(false);
    load();
  };

  const updateStatus = async (id, status) => {
    const updates = { status };
    if (status === 'finished') updates.finished_at = new Date().toISOString().split('T')[0];
    await base44.entities.BookLog.update(id, updates);
    load();
  };

  const remove = async (id) => {
    await base44.entities.BookLog.delete(id);
    load();
  };

  const STATUS_INFO = {
    wishlist: { label: 'À lire', cls: 'text-muted-foreground bg-surface border-border' },
    reading: { label: 'En cours', cls: 'text-info bg-info/10 border-info/20' },
    finished: { label: 'Terminé', cls: 'text-success bg-success/10 border-success/20' },
    paused: { label: 'En pause', cls: 'text-warning bg-warning/10 border-warning/20' },
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-border border-t-secondary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <button onClick={() => setShowForm(true)} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-border text-xs font-medium text-muted-foreground hover:border-secondary/30 hover:text-secondary transition-colors">
        <Plus className="w-4 h-4" /> Ajouter un livre
      </button>

      {books.length === 0 ? (
        <div className="text-center py-12">
          <BookMarked className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-xs text-muted-foreground">Construis ta bibliothèque spirituelle.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {books.map(b => {
            const st = STATUS_INFO[b.status] || STATUS_INFO.wishlist;
            return (
              <motion.div key={b.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-card border border-border rounded-xl p-4 group">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${st.cls}`}>{st.label}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-foreground">{b.title}</h4>
                    {b.author && <p className="text-xs text-muted-foreground">{b.author}</p>}
                    {b.personal_note && <p className="text-xs text-muted-foreground mt-1">{b.personal_note}</p>}
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {b.status === 'reading' && (
                      <button onClick={() => updateStatus(b.id, 'finished')} className="p-1.5 rounded-lg hover:bg-success/10 text-muted-foreground hover:text-success transition-colors" title="Marquer terminé">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {b.status === 'wishlist' && (
                      <button onClick={() => updateStatus(b.id, 'reading')} className="p-1.5 rounded-lg hover:bg-info/10 text-muted-foreground hover:text-info transition-colors text-[10px] font-medium" title="Commencer">
                        Commencer
                      </button>
                    )}
                    <button onClick={() => remove(b.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)}
              className="fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-sm" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-card rounded-t-3xl border-t border-border p-6 pb-8">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-foreground">Ajouter un livre</h3>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground p-1"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Titre *</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm" placeholder="Titre du livre" autoFocus />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Auteur</label>
                  <input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm" placeholder="Auteur" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Catégorie</label>
                  <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm" placeholder="Ex: Spiritualité, Leadership..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Statut</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm">
                    <option value="wishlist">À lire</option>
                    <option value="reading">En cours</option>
                    <option value="finished">Terminé</option>
                    <option value="paused">En pause</option>
                  </select>
                </div>
                <button onClick={create} disabled={!form.title.trim()}
                  className="w-full py-3 rounded-xl bg-secondary text-white text-sm font-semibold hover:bg-secondary/90 disabled:opacity-40 transition-colors">
                  Ajouter
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}