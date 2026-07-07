import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import FijPageShell, { LoadingSpinner, EmptyState } from '@/components/fij/FijPageShell';
import { useFijData } from '@/hooks/useFijData';
import { ArrowLeftRight, Plus, X, Check, XCircle } from 'lucide-react';

export default function Transferts() {
  const { fijs, loading, accessLevel } = useFijData();
  const [transfers, setTransfers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    base44.entities.FijTransfer.filter({}, '-created_date', 100).then(t => {
      setTransfers(t || []);
      setDataLoading(false);
    });
  };
  useEffect(() => { load(); }, []);

  if (loading || dataLoading) return <LoadingSpinner />;

  const updateStatus = async (id, status) => {
    const extra = status === 'accepted' ? { validation_date: new Date().toISOString().split('T')[0] } : {};
    await base44.entities.FijTransfer.update(id, { status, ...extra });
    setTransfers(ts => ts.map(t => t.id === id ? { ...t, status, ...extra } : t));
  };

  const pending = transfers.filter(t => t.status === 'pending');
  const processed = transfers.filter(t => t.status !== 'pending');

  return (
    <FijPageShell
      accessLevel={accessLevel}
      title="Transferts"
      subtitle="Déplacements de personnes entre FIJ ou vers d'autres pôles"
      requiredRoles={['coordination', 'direction']}
      actions={
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 text-xs font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg px-3 py-1.5 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nouveau
        </button>
      }
    >
      {transfers.length === 0 ? (
        <EmptyState icon={ArrowLeftRight} title="Aucun transfert" sub="Crée une demande de transfert." />
      ) : (
        <>
          {pending.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">En attente ({pending.length})</h2>
              <div className="space-y-2">
                {pending.map(t => (
                  <TransferCard key={t.id} transfer={t} onAccept={() => updateStatus(t.id, 'accepted')} onRefuse={() => updateStatus(t.id, 'refused')} />
                ))}
              </div>
            </div>
          )}
          {processed.length > 0 && (
            <div>
              <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Traités ({processed.length})</h2>
              <div className="space-y-2">
                {processed.map(t => (
                  <TransferCard key={t.id} transfer={t} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {showForm && <TransferFormModal fijs={fijs} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
      </AnimatePresence>
    </FijPageShell>
  );
}

function TransferCard({ transfer, onAccept, onRefuse }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{transfer.person_name}</p>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            <span className="truncate">{transfer.fij_source_name || '—'}</span>
            <ArrowLeftRight className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{transfer.fij_target_name || '—'}</span>
          </div>
          {transfer.reason && <p className="text-xs text-muted-foreground mt-1">{transfer.reason}</p>}
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
          transfer.status === 'accepted' ? 'bg-success/10 text-success'
          : transfer.status === 'refused' ? 'bg-danger/10 text-danger'
          : transfer.status === 'completed' ? 'bg-primary/10 text-primary'
          : 'bg-secondary/10 text-secondary'
        }`}>
          {transfer.status === 'accepted' ? 'Accepté' : transfer.status === 'refused' ? 'Refusé' : transfer.status === 'completed' ? 'Terminé' : 'En attente'}
        </span>
      </div>
      {onAccept && (
        <div className="flex gap-2 mt-2">
          <button onClick={onAccept} className="flex items-center gap-1 text-xs text-success hover:text-success/80 border border-success/30 rounded-lg px-2.5 py-1 transition-colors">
            <Check className="w-3 h-3" /> Accepter
          </button>
          <button onClick={onRefuse} className="flex items-center gap-1 text-xs text-danger hover:text-danger/80 border border-danger/30 rounded-lg px-2.5 py-1 transition-colors">
            <XCircle className="w-3 h-3" /> Refuser
          </button>
        </div>
      )}
    </div>
  );
}

function TransferFormModal({ fijs, onClose, onSaved }) {
  const [form, setForm] = useState({ person_name: '', fij_source_id: '', fij_target_id: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const inputCls = "w-full h-10 px-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary";

  const save = async () => {
    setSaving(true);
    const src = fijs.find(f => f.id === form.fij_source_id);
    const tgt = fijs.find(f => f.id === form.fij_target_id);
    await base44.entities.FijTransfer.create({
      ...form,
      fij_source_name: src?.name || '',
      fij_target_name: tgt?.name || '',
      status: 'pending',
    });
    onSaved();
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        onClick={e => e.stopPropagation()} className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-xl">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Nouveau transfert</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Personne concernée *</label>
            <input className={inputCls} value={form.person_name} onChange={e => setForm(f => ({ ...f, person_name: e.target.value }))} placeholder="Nom" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">FIJ source</label>
            <select className={inputCls} value={form.fij_source_id} onChange={e => setForm(f => ({ ...f, fij_source_id: e.target.value }))}>
              <option value="">—</option>
              {fijs.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">FIJ cible</label>
            <select className={inputCls} value={form.fij_target_id} onChange={e => setForm(f => ({ ...f, fij_target_id: e.target.value }))}>
              <option value="">—</option>
              {fijs.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Raison</label>
            <textarea className={inputCls + ' h-20 resize-none'} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Motif du transfert..." />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-border flex gap-2">
          <button onClick={onClose} className="flex-1 text-sm text-muted-foreground border border-border rounded-xl py-2.5 hover:bg-surface">Annuler</button>
          <button onClick={save} disabled={saving || !form.person_name} className="flex-1 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl py-2.5 disabled:opacity-50">
            {saving ? '...' : 'Créer'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}