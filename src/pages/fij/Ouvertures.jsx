import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import FijPageShell, { LoadingSpinner, EmptyState } from '@/components/fij/FijPageShell';
import { useFijData } from '@/hooks/useFijData';
import { Plus, X, CheckCircle, Clock, Heart, FileCheck } from 'lucide-react';

export default function Ouvertures() {
  const { fijs, loading, accessLevel, reload } = useFijData();
  const [processes, setProcesses] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    base44.entities.FijOpeningProcess.filter({}, '-created_date', 100).then(p => {
      setProcesses(p || []);
      setDataLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  if (loading || dataLoading) return <LoadingSpinner />;

  const activeProcesses = processes.filter(p => p.status !== 'validated' && p.status !== 'rejected');

  const toggleStep = async (proc, field) => {
    const updated = { ...proc, [field]: !proc[field] };
    let newStatus = proc.status;
    if (field === 'prayer_24h_completed' && updated.prayer_24h_completed) newStatus = 'prayer_completed';
    if (field === 'consecration_completed' && updated.consecration_completed) newStatus = 'consecration_completed';
    if (field === 'pilot_identified' && updated.pilot_identified && proc.status === 'initiated') newStatus = 'pilot_identified';
    updated.status = newStatus;
    await base44.entities.FijOpeningProcess.update(proc.id, updated);
    setProcesses(ps => ps.map(p => p.id === proc.id ? updated : p));
  };

  const submitValidation = async (proc) => {
    await base44.entities.FijOpeningProcess.update(proc.id, { status: 'validated', final_validation_status: 'approved' });
    setProcesses(ps => ps.map(p => p.id === proc.id ? { ...p, status: 'validated', final_validation_status: 'approved' } : p));
  };

  return (
    <FijPageShell
      accessLevel={accessLevel}
      title="Ouvertures de FIJ"
      subtitle="Suivi des processus d'ouverture de nouvelles familles"
      requiredRoles={['coordination', 'direction']}
      actions={
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 text-xs font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg px-3 py-1.5 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nouvelle
        </button>
      }
    >
      {activeProcesses.length === 0 ? (
        <EmptyState icon={Plus} title="Aucune ouverture en cours" sub="Lance un nouveau processus d'ouverture de FIJ." />
      ) : (
        <div className="space-y-3">
          {activeProcesses.map((proc, i) => (
            <motion.div
              key={proc.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{proc.request_title || proc.fij_name || 'Ouverture'}</p>
                  {proc.requester_name && <p className="text-xs text-muted-foreground mt-0.5">Demandé par {proc.requester_name}</p>}
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary whitespace-nowrap">
                  {proc.status === 'initiated' ? 'Initié' : proc.status === 'pilot_identified' ? 'Pilote identifié' : proc.status === 'prayer_planned' ? 'Prière planifiée' : proc.status === 'prayer_completed' ? 'Prière faite' : proc.status === 'consecration_requested' ? 'Consécration demandée' : proc.status === 'consecration_completed' ? 'Consacrée' : proc.status}
                </span>
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                <ChecklistItem label="Pilote identifié" done={proc.pilot_identified} onClick={() => toggleStep(proc, 'pilot_identified')} icon={CheckCircle} />
                <ChecklistItem label="Dossier complété" done={proc.file_completed} onClick={() => toggleStep(proc, 'file_completed')} icon={FileCheck} />
                <ChecklistItem label="24h de prière planifiées" done={proc.prayer_24h_planned} onClick={() => toggleStep(proc, 'prayer_24h_planned')} icon={Clock} />
                <ChecklistItem label="24h de prière réalisées" done={proc.prayer_24h_completed} onClick={() => toggleStep(proc, 'prayer_24h_completed')} icon={CheckCircle} />
                <ChecklistItem label="Consécration demandée" done={proc.consecration_requested} onClick={() => toggleStep(proc, 'consecration_requested')} icon={Heart} />
                <ChecklistItem label="Consécration réalisée" done={proc.consecration_completed} onClick={() => toggleStep(proc, 'consecration_completed')} icon={Heart} />
              </div>

              {proc.consecration_completed && proc.status !== 'validated' && (
                <button
                  onClick={() => submitValidation(proc)}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-medium text-primary-foreground bg-success hover:bg-success/90 rounded-xl py-2.5 transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Valider l'ouverture
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <OpeningFormModal fijs={fijs} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />
        )}
      </AnimatePresence>
    </FijPageShell>
  );
}

function ChecklistItem({ label, done, onClick, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 p-2 rounded-lg transition-colors text-left ${done ? 'bg-success/5' : 'bg-surface hover:bg-muted'}`}
    >
      <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 ${done ? 'bg-success border-success' : 'border-border'}`}>
        {done && <CheckCircle className="w-3 h-3 text-white" />}
      </div>
      <span className={`text-xs ${done ? 'text-success' : 'text-muted-foreground'}`}>{label}</span>
    </button>
  );
}

function OpeningFormModal({ fijs, onClose, onSaved }) {
  const [form, setForm] = useState({ request_title: '', fij_house_id: '', fij_name: '', requester_name: '' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const fij = fijs.find(f => f.id === form.fij_house_id);
    await base44.entities.FijOpeningProcess.create({
      ...form,
      fij_name: fij?.name || form.fij_name,
      status: 'initiated',
    });
    onSaved();
    setSaving(false);
  };

  const inputCls = "w-full h-10 px-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        onClick={e => e.stopPropagation()} className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-xl">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Nouvelle ouverture</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Titre de la demande *</label>
            <input className={inputCls} value={form.request_title} onChange={e => setForm(f => ({ ...f, request_title: e.target.value }))} placeholder="Ouverture FIJ Lyon" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">FIJ concernée (optionnel)</label>
            <select className={inputCls} value={form.fij_house_id} onChange={e => setForm(f => ({ ...f, fij_house_id: e.target.value }))}>
              <option value="">— Nouvelle FIJ —</option>
              {fijs.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Demandeur</label>
            <input className={inputCls} value={form.requester_name} onChange={e => setForm(f => ({ ...f, requester_name: e.target.value }))} placeholder="Nom du demandeur" />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-border flex gap-2">
          <button onClick={onClose} className="flex-1 text-sm text-muted-foreground border border-border rounded-xl py-2.5 hover:bg-surface">Annuler</button>
          <button onClick={save} disabled={saving || !form.request_title} className="flex-1 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl py-2.5 disabled:opacity-50">
            {saving ? '...' : 'Créer'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}