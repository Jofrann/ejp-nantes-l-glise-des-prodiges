import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, BookOpen, Plus, Check, X, BookMarked, Lightbulb } from 'lucide-react';

export default function Croissance() {
  const [tab, setTab] = useState('parole');
  const [readToday, setReadToday] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');

  const tabs = [
    { key: 'parole', label: 'Parole', icon: Sprout },
    { key: 'notes', label: 'Notes', icon: BookOpen },
    { key: 'livres', label: 'Livres', icon: BookMarked },
  ];

  const addNote = () => {
    if (!noteText.trim()) return;
    setNotes(prev => [{ id: Date.now(), content: noteText, date: new Date() }, ...prev]);
    setNoteText('');
    setShowNote(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl font-heading font-bold text-foreground mb-1">Ma croissance</h1>
        <p className="text-sm text-muted-foreground">Ton espace personnel de croissance spirituelle. Privé par défaut.</p>
      </motion.div>

      {/* Onglets */}
      <div className="flex gap-1 mb-6 bg-surface border border-border rounded-xl p-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
              tab === t.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'parole' && (
          <motion.div key="parole" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center">
                  <Sprout className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">As-tu lu ta Parole aujourd'hui ?</p>
                  <p className="text-xs text-muted-foreground">Ta croissance spirituelle personnelle</p>
                </div>
              </div>
              <button
                onClick={() => setReadToday(!readToday)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  readToday
                    ? 'bg-success/10 text-success border border-success/20'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600'
                }`}
              >
                {readToday ? <><Check className="w-4 h-4" /> J'ai lu aujourd'hui</> : 'J\'ai lu aujourd\'hui'}
              </button>
            </div>

            <button
              onClick={() => setShowNote(true)}
              className="w-full flex items-center justify-center gap-2 bg-card border border-border hover:border-emerald-400/30 text-foreground text-sm font-medium py-2.5 rounded-xl transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" /> Ajouter une note privée
            </button>

            <div className="mt-6 bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-secondary" />
                <p className="text-sm font-semibold text-foreground">Bilan de la semaine</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Qu'as-tu appris cette semaine ? Où as-tu été fidèle ? Quelle décision prends-tu pour la semaine prochaine ?
              </p>
              <button className="mt-3 text-xs text-secondary font-medium">Faire mon bilan →</button>
            </div>
          </motion.div>
        )}

        {tab === 'notes' && (
          <motion.div key="notes" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <button
              onClick={() => setShowNote(true)}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 text-sm font-semibold py-2.5 rounded-xl transition-all mb-4"
            >
              <Plus className="w-4 h-4" /> Créer une note privée
            </button>
            {notes.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucune note pour le moment.</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Tes notes sont privées et ne sont visibles par personne.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notes.map(n => (
                  <div key={n.id} className="bg-card border border-border rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-muted-foreground mb-1">{n.date.toLocaleDateString('fr-FR')}</p>
                    <p className="text-sm text-foreground">{n.content}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {tab === 'livres' && (
          <motion.div key="livres" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <button className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 text-sm font-semibold py-2.5 rounded-xl transition-all mb-4">
              <Plus className="w-4 h-4" /> Ajouter un livre
            </button>
            <div className="text-center py-12">
              <BookMarked className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Aucun livre enregistré.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Ajoute les livres que tu lis ou que tu recommandes.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal note */}
      <AnimatePresence>
        {showNote && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowNote(false)}
              className="fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-card rounded-t-3xl border-t border-border p-6 pb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Note privée</h3>
                <button onClick={() => setShowNote(false)} className="text-muted-foreground p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                rows={4}
                autoFocus
                placeholder="Écris ta note... (visible uniquement par toi)"
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-emerald-400/40 resize-none"
              />
              <button
                onClick={addNote}
                className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                Enregistrer
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}