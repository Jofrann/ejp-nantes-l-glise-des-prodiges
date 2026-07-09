import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check, Flame, Repeat } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CATEGORIES = [
  { key: 'lecture_biblique', label: 'Lecture biblique' },
  { key: 'priere', label: 'Prière' },
  { key: 'lecture_livre', label: "Lecture d'un livre" },
  { key: 'sport', label: 'Sport' },
  { key: 'discipline', label: 'Discipline personnelle' },
  { key: 'etude', label: 'Étude' },
  { key: 'autre', label: 'Autre' },
];

export default function HabitudesTab() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', frequency: 'quotidien', category: 'discipline' });

  const load = () => {
    base44.entities.PersonalHabit.list('-created_date', 50)
      .then(data => { setHabits(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name.trim()) return;
    await base44.entities.PersonalHabit.create({ ...form, is_active: true, streak_count: 0 });
    setForm({ name: '', frequency: 'quotidien', category: 'discipline' });
    setShowForm(false);
    load();
  };

  const checkToday = async (h) => {
    const today = new Date().toISOString().split('T')[0];
    if (h.last_check_date === today) return;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const newStreak = h.last_check_date === yesterday ? (h.streak_count || 0) + 1 : 1;
    await base44.entities.PersonalHabit.update(h.id, { last_check_date: today, streak_count: newStreak });
    load();
  };

  const remove = async (id) => {
    await base44.entities.PersonalHabit.delete(id);
    load();
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-border border-t-secondary rounded-full animate-spin" /></div>;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      <button onClick={() => setShowForm(true)} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-border text-xs font-medium text-muted-foreground hover:border-secondary/30 hover:text-secondary transition-colors">
        <Plus className="w-4 h-4" /> Créer une habitude
      </button>

      {habits.length === 0 ? (
        <div className="text-center py-12">
          <Repeat className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-xs text-muted-foreground">Construis tes habitudes spirituelles et disciplinaires.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {habits.map(h => {
            const checkedToday = h.last_check_date === today;
            const cat = CATEGORIES.find(c => c.key === h.category)?.label || 'Habitude';
            return (
              <motion.div key={h.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-card border border-border rounded-xl p-4 group">
                <div className="flex items-center gap-3">
                  <button onClick={() => checkToday(h)} disabled={checkedToday}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${checkedToday ? 'bg-success/10 border border-success/20 text-success' : 'bg-surface border border-border text-muted-foreground hover:bg-success/10 hover:text-success hover:border-success/20'}`}>
                    <Check className="w-4 h-4" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{h.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">{cat}</span>
                      <span className="text-[10px] text-muted-foreground">· {h.frequency}</span>
                    </div>
                  </div>
                  {(h.streak_count || 0) > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                      <Flame className="w-3 h-3" /> {h.streak_count}j
                    </span>
                  )}
                  <button onClick={() => remove(h.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                    <X className="w-3.5 h-3.5" />
                  </button>
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
                <h3 className="text-sm font-semibold text-foreground">Nouvelle habitude</h3>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground p-1"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nom *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm" placeholder="Ex: Lecture biblique quotidienne" autoFocus />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Fréquence</label>
                  <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm">
                    <option value="quotidien">Quotidien</option>
                    <option value="hebdomadaire">Hebdomadaire</option>
                    <option value="ponctuel">Ponctuel</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Catégorie</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm">
                    {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
                <button onClick={create} disabled={!form.name.trim()}
                  className="w-full py-3 rounded-xl bg-secondary text-white text-sm font-semibold hover:bg-secondary/90 disabled:opacity-40 transition-colors">
                  Créer l'habitude
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}