import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, ChevronRight, X, Check, Pause } from 'lucide-react';

const CATEGORIES = [
  'Spirituel', 'Discipline personnelle', 'Formation', 'Service',
  'Académique', 'Professionnel', 'Relationnel', 'Santé / rythme', 'Autre'
];

const STATUSES = {
  idea: { label: 'Idée', color: 'text-muted-foreground bg-surface border-border' },
  active: { label: 'Actif', color: 'text-success bg-success/10 border-success/20' },
  paused: { label: 'En pause', color: 'text-warning bg-warning/10 border-warning/20' },
  done: { label: 'Terminé', color: 'text-secondary bg-secondary/10 border-secondary/20' },
};

export default function Objectifs() {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Spirituel', why: '', target_date: '' });

  const createGoal = () => {
    if (!form.title.trim()) return;
    setGoals(prev => [...prev, { id: Date.now(), ...form, status: 'active' }]);
    setForm({ title: '', category: 'Spirituel', why: '', target_date: '' });
    setShowForm(false);
  };

  const updateStatus = (id, status) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, status } : g));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl font-heading font-bold text-foreground mb-1">Mes objectifs</h1>
        <p className="text-sm text-muted-foreground">Transforme tes intentions en trajectoires.</p>
      </motion.div>

      <button
        onClick={() => setShowForm(true)}
        className="w-full flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 text-sm font-semibold py-2.5 rounded-xl transition-all mb-6"
      >
        <Plus className="w-4 h-4" /> Créer un objectif
      </button>

      {goals.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Aucun objectif pour le moment.</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Commence par clarifier ce que tu veux accomplir.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((g, i) => {
            const status = STATUSES[g.status] || STATUSES.idea;
            return (
              <motion.div key={g.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-center flex-shrink-0">
                      <Target className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{g.title}</p>
                      {g.why && <p className="text-xs text-muted-foreground mt-0.5">{g.why}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-muted-foreground bg-surface px-2 py-0.5 rounded-full">{g.category}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${status.color}`}>{status.label}</span>
                        {g.target_date && <span className="text-[10px] text-muted-foreground">{g.target_date}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => updateStatus(g.id, 'done')} className="flex-1 flex items-center justify-center gap-1 bg-success/10 hover:bg-success/20 text-success text-xs font-medium py-1.5 rounded-lg transition-colors">
                      <Check className="w-3 h-3" /> Terminé
                    </button>
                    <button onClick={() => updateStatus(g.id, 'paused')} className="flex-1 flex items-center justify-center gap-1 bg-warning/10 hover:bg-warning/20 text-warning text-xs font-medium py-1.5 rounded-lg transition-colors">
                      <Pause className="w-3 h-3" /> Pause
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-sm" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-card rounded-t-3xl border-t border-border p-6 pb-8 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Nouvel objectif</h3>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground p-1"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Titre</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Mon objectif..."
                    className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400/40" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Catégorie</label>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map(c => (
                      <button key={c} onClick={() => setForm(f => ({ ...f, category: c }))}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                          form.category === c ? 'bg-amber-500/10 text-amber-600 border-amber-400/30' : 'bg-surface text-muted-foreground border-border'
                        }`}>{c}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Pourquoi ?</label>
                  <textarea value={form.why} onChange={e => setForm(f => ({ ...f, why: e.target.value }))}
                    rows={2} placeholder="Pourquoi cet objectif est important..."
                    className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400/40 resize-none" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Date cible</label>
                  <input type="date" value={form.target_date} onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400/40" />
                </div>
                <button onClick={createGoal}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                  Créer l'objectif
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}