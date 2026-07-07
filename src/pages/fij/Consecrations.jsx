import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import FijPageShell, { LoadingSpinner, EmptyState } from '@/components/fij/FijPageShell';
import { useFijData } from '@/hooks/useFijData';
import { Heart, Plus, X, Calendar, CheckCircle } from 'lucide-react';

export default function Consecrations() {
  const { fijs, loading, accessLevel } = useFijData();
  const [requests, setRequests] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    base44.entities.FijConsecrationRequest.filter({}, '-created_date', 100).then(r => {
      setRequests(r || []);
      setDataLoading(false);
    });
  };
  useEffect(() => { load(); }, []);

  if (loading || dataLoading) return <LoadingSpinner />;

  const pending = requests.filter(r => r.status === 'pending');
  const scheduled = requests.filter(r => r.status === 'scheduled');
  const completed = requests.filter(r => r.status === 'completed');

  const updateStatus = async (id, status, extra = {}) => {
    await base44.entities.FijConsecrationRequest.update(id, { status, ...extra });
    setRequests(rs => rs.map(r => r.id === id ? { ...r, status, ...extra } : r));
  };

  const schedule = async (req) => {
    const date = prompt('Date planifiée (AAAA-MM-JJ) :', new Date().toISOString().split('T')[0]);
    if (!date) return;
    const resp = prompt('Responsable assigné :', '');
    await updateStatus(req.id, 'scheduled', { scheduled_date: date, assigned_responsible: resp || '' });
  };

  return (
    <FijPageShell
      accessLevel={accessLevel}
      title="Consécrations"
      subtitle="Suivi des demandes de consécration des maisons"
      requiredRoles={['coordination', 'direction']}
      actions={
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 text-xs font-medium text-black bg-amber-400 hover:bg-amber-300 rounded-lg px-3 py-1.5 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Demande
        </button>
      }
    >
      {/* En attente */}
      {pending.length > 0 && (
        <Section title="En attente" count={pending.length}>
          {pending.map(req => (
            <RequestCard key={req.id} req={req} onSchedule={() => schedule(req)} onComplete={() => updateStatus(req.id, 'completed')} />
          ))}
        </Section>
      )}

      {/* Planifiées */}
      {scheduled.length > 0 && (
        <Section title="Planifiées" count={scheduled.length}>
          {scheduled.map(req => (
            <RequestCard key={req.id} req={req} onComplete={() => updateStatus(req.id, 'completed')} />
          ))}
        </Section>
      )}

      {/* Réalisées */}
      {completed.length > 0 && (
        <Section title="Réalisées" count={completed.length}>
          {completed.map(req => (
            <RequestCard key={req.id} req={req} done />
          ))}
        </Section>
      )}

      {requests.length === 0 && (
        <EmptyState icon={Heart} title="Aucune demande de consécration" sub="Crée une demande pour une maison à consacrer." />
      )}

      <AnimatePresence>
        {showForm && <ConsecrationFormModal fijs={fijs} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
      </AnimatePresence>
    </FijPageShell>
  );
}

function Section({ title, count, children }) {
  return (
    <div className="mb-6">
      <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-3">{title} ({count})</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function RequestCard({ req, onSchedule, onComplete, done }) {
  return (
    <div className="bg-white/3 border border-white/8 rounded-xl p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">{req.fij_name || 'FIJ'}</p>
          <p className="text-xs text-gray-500 truncate">{req.house_address}</p>
          <div className="flex items-center gap-2 mt-1">
            {req.requested_by && <span className="text-xs text-gray-600">par {req.requested_by}</span>}
            {req.scheduled_date && <span className="text-xs text-blue-400 flex items-center gap-0.5"><Calendar className="w-3 h-3" />{new Date(req.scheduled_date).toLocaleDateString('fr-FR')}</span>}
            {req.assigned_responsible && <span className="text-xs text-gray-600">· {req.assigned_responsible}</span>}
          </div>
        </div>
        {done ? (
          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
        ) : (
          <div className="flex gap-1 flex-shrink-0">
            {onSchedule && <button onClick={onSchedule} className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded-lg hover:bg-blue-400/5">Planifier</button>}
            {onComplete && <button onClick={onComplete} className="text-xs text-green-400 hover:text-green-300 px-2 py-1 rounded-lg hover:bg-green-400/5">Réalisée</button>}
          </div>
        )}
      </div>
    </div>
  );
}

function ConsecrationFormModal({ fijs, onClose, onSaved }) {
  const [form, setForm] = useState({ fij_house_id: '', house_address: '', requested_by: '' });
  const [saving, setSaving] = useState(false);
  const inputCls = "w-full h-10 px-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30";

  const save = async () => {
    setSaving(true);
    const fij = fijs.find(f => f.id === form.fij_house_id);
    await base44.entities.FijConsecrationRequest.create({
      ...form,
      fij_name: fij?.name || '',
      requested_date: new Date().toISOString().split('T')[0],
      status: 'pending',
    });
    onSaved();
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        onClick={e => e.stopPropagation()} className="bg-zinc-950 border border-white/10 rounded-t-2xl sm:rounded-2xl w-full max-w-md">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Demande de consécration</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">FIJ concernée</label>
            <select className={inputCls} value={form.fij_house_id} onChange={e => setForm(f => ({ ...f, fij_house_id: e.target.value }))}>
              <option value="">— Sélectionner —</option>
              {fijs.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Adresse de la maison *</label>
            <input className={inputCls} value={form.house_address} onChange={e => setForm(f => ({ ...f, house_address: e.target.value }))} placeholder="12 rue Example, Nantes" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Demandeur</label>
            <input className={inputCls} value={form.requested_by} onChange={e => setForm(f => ({ ...f, requested_by: e.target.value }))} placeholder="Nom" />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-white/5 flex gap-2">
          <button onClick={onClose} className="flex-1 text-sm text-gray-400 border border-white/10 rounded-xl py-2.5 hover:bg-white/5">Annuler</button>
          <button onClick={save} disabled={saving || !form.house_address} className="flex-1 text-sm font-medium text-black bg-amber-400 hover:bg-amber-300 rounded-xl py-2.5 disabled:opacity-50">
            {saving ? '...' : 'Créer'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}