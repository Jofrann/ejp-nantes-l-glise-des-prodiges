import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, X, Check, Pause, RotateCcw, Flag } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/star/PageHeader';

const CATEGORIES = [
  { key: 'spirituel', label: 'Spirituel' },
  { key: 'discipline', label: 'Discipline personnelle' },
  { key: 'formation', label: 'Formation' },
  { key: 'service', label: 'Service' },
  { key: 'academique', label: 'Académique' },
  { key: 'professionnel', label: 'Professionnel' },
  { key: 'relationnel', label: 'Relationnel' },
  { key: 'sante', label: 'Santé / rythme' },
  { key: 'autre', label: 'Autre' },
];

const STATUSES = {
  idea: { label: 'Idée', cls: 'text-muted-foreground bg-surface border-border' },
  active: { label: 'Actif', cls: 'text-success bg-success/10 border-success/20' },
  paused: { label: 'En pause', cls: 'text-warning bg-warning/10 border-warning/20' },
  done: { label: 'Terminé', cls: 'text-secondary bg-secondary/10 border-secondary/20' },
  abandoned: { label: 'Abandonné', cls: 'text-muted-foreground bg-surface border-border' },
};

export default function Objectifs() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'spirituel', why: '', expected_result: '', target_date: '', priority: 'medium', visibility: 'private', steps: [] });
  const [newStep, setNewStep] = useState('');

  const load = () => {
    base44.entities.PersonalGoal.list('-created_date', 100)
      .then(data => { setGoals(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const createGoal = async () => {
    if (!form.title.trim()) return;
    await base44.entities.PersonalGoal.create({ ...form, status: 'active' });
    setForm({ title: '', category: 'spirituel', why: '', expected_result: '', target_date: '', priority: 'medium', visibility: 'private', steps: [] });
    setNewStep('');
    setShowForm(false);
    load();
  };

  const updateStatus = async (id, status) => {
    await base44.entities.PersonalGoal.update(id, { status });
    load();
  };

  const removeGoal = async (id) => {
    await base44.entities.PersonalGoal.delete(id);
    load();
  };

  const active = goals.filter(g => g.status === 'active' || g.status === 'idea');
  const done = goals.filter(g => g.status === 'done' || g.status === 'abandoned' || g.status === 'paused');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <PageHeader
        title="Mes objectifs"
        intention="Transforme tes intentions en trajectoires."
        breadcrumbs={[{ label: 'Accueil', to: '/app' }, { label: 'Ma croissance' }, { label: 'Objectifs' }]}
        actions={
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-white text-xs font-semibold hover:bg-secondary/90 transition-colors">
            <Plus className="w-4 h-4" /> Nouveau
          </button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-border border-t-secondary rounded-full animate-spin" /></div>
      ) : goals.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-surface border border-border mb-4">
            <Target className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">Aucun objectif</p>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">Crée ton premier objectif pour clarifier ta trajectoire.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-3">
            {active.map(g => (
              <GoalCard key={g.id} goal={g} onStatus={updateStatus} onDelete={removeGoal} />
            ))}
          </div>
          {done.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Terminés & en pause</p>
              <div className="space-y-3 opacity-70">
                {done.map(g => (
                  <GoalCard key={g.id} goal={g} onStatus={updateStatus} onDelete={removeGoal} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <GoalForm form={form} setForm={setForm} newStep={newStep} setNewStep={setNewStep} onClose={() => setShowForm(false)} onSave={createGoal} />
        )}
      </AnimatePresence>
    </div>
  );
}

function GoalCard({ goal, onStatus, onDelete }) {
  const st = STATUSES[goal.status] || STATUSES.idea;
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${st.cls}`}>{st.label}</span>
            <span className="text-[10px] text-muted-foreground">{CATEGORIES.find(c => c.key === goal.category)?.label}</span>
          </div>
          <h3 className="text-sm font-semibold text-foreground">{goal.title}</h3>
          {goal.why && <p className="text-xs text-muted-foreground mt-1">{goal.why}</p>}
          {goal.target_date && <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1"><Flag className="w-3 h-3" /> Cible : {new Date(goal.target_date).toLocaleDateString('fr-FR')}</p>}
        </div>
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          {goal.status !== 'done' && (
            <button onClick={() => onStatus(goal.id, 'done')} className="p-1.5 rounded-lg hover:bg-success/10 text-muted-foreground hover:text-success transition-colors" title="Marquer terminé">
              <Check className="w-4 h-4" />
            </button>
          )}
          {goal.status === 'active' && (
            <button onClick={() => onStatus(goal.id, 'paused')} className="p-1.5 rounded-lg hover:bg-warning/10 text-muted-foreground hover:text-warning transition-colors" title="Mettre en pause">
              <Pause className="w-4 h-4" />
            </button>
          )}
          {goal.status === 'paused' && (
            <button onClick={() => onStatus(goal.id, 'active')} className="p-1.5 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground transition-colors" title="Reprendre">
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => onDelete(goal.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Supprimer">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function GoalForm({ form, setForm, newStep, setNewStep, onClose, onSave }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        className="fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-sm" />
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-[70] bg-card rounded-t-3xl border-t border-border p-6 pb-8 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-foreground">Nouvel objectif</h3>
          <button onClick={onClose} className="text-muted-foreground p-1"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Titre *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm" placeholder="Ex: Lire la Bible chaque jour" autoFocus />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Catégorie</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm">
              {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Pourquoi ?</label>
            <textarea value={form.why} onChange={e => setForm({ ...form, why: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm" rows={2} placeholder="Ta motivation..." />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Résultat attendu</label>
            <input value={form.expected_result} onChange={e => setForm({ ...form, expected_result: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm" placeholder="Comment sauras-tu que c'est atteint ?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Date cible</label>
              <input type="date" value={form.target_date} onChange={e => setForm({ ...form, target_date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Priorité</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm">
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Visibilité</label>
            <select value={form.visibility} onChange={e => setForm({ ...form, visibility: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm">
              <option value="private">Privé (par défaut)</option>
              <option value="shared_leader">Partagé avec un leader</option>
              <option value="shared_referent">Partagé avec mon référent</option>
              <option value="shared_bergere">Partagé avec la Bergère</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Étapes</label>
            <div className="space-y-2 mb-2">
              {(form.steps || []).map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="flex-1 text-xs text-foreground px-3 py-2 rounded-lg bg-surface border border-border">{step.title}</span>
                  <button onClick={() => setForm({ ...form, steps: form.steps.filter((_, i) => i !== idx) })}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newStep} onChange={e => setNewStep(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && newStep.trim()) { e.preventDefault(); setForm({ ...form, steps: [...(form.steps || []), { title: newStep.trim(), done: false }] }); setNewStep(''); } }}
                className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" placeholder="Nouvelle étape..." />
              <button onClick={() => { if (newStep.trim()) { setForm({ ...form, steps: [...(form.steps || []), { title: newStep.trim(), done: false }] }); setNewStep(''); } }}
                className="px-3 py-2 rounded-lg bg-surface border border-border text-xs font-medium text-muted-foreground hover:text-secondary hover:border-secondary/30 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button onClick={onSave} disabled={!form.title.trim()}
            className="w-full py-3 rounded-xl bg-secondary text-white text-sm font-semibold hover:bg-secondary/90 disabled:opacity-40 transition-colors">
            Créer l'objectif
          </button>
        </div>
      </motion.div>
    </>
  );
}