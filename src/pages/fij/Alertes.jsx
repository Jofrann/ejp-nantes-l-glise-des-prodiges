import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import FijPageShell, { LoadingSpinner, EmptyState } from '@/components/fij/FijPageShell';
import { useFijData } from '@/hooks/useFijData';
import { AlertTriangle, Plus, X, CheckCircle, ArrowUp } from 'lucide-react';

const TYPE_LABELS = {
  missing_report: 'CR manquant',
  low_attendance: 'Baisse de participation',
  pause_risk: 'Risque de pause',
  opening_blocked: 'Ouverture bloquée',
  pastoral_attention: 'Attention pastorale',
};

export default function Alertes() {
  const { user, fijs, loading, accessLevel } = useFijData();
  const [alerts, setAlerts] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('open');

  const load = () => {
    base44.entities.FijAlert.filter({}, '-created_date', 200).then(a => {
      setAlerts(a || []);
      setDataLoading(false);
    });
  };
  useEffect(() => { load(); }, []);

  if (loading || dataLoading) return <LoadingSpinner />;

  const isCoord = accessLevel === 'coordination' || accessLevel === 'direction';

  // Pilots see only alerts on their FIJs
  let visible = alerts;
  if (!isCoord) {
    visible = alerts.filter(a => fijs.some(f =>
      f.id === a.fij_house_id && (f.pilot_user_id === user?.id || (f.co_pilot_user_ids || []).includes(user?.id))
    ));
  }
  if (filter === 'open') visible = visible.filter(a => a.status === 'open' || a.status === 'in_progress');
  if (filter === 'resolved') visible = visible.filter(a => a.status === 'resolved');

  const resolve = async (alert) => {
    await base44.entities.FijAlert.update(alert.id, { status: 'resolved', resolved_at: new Date().toISOString() });
    setAlerts(as => as.map(a => a.id === alert.id ? { ...a, status: 'resolved' } : a));
  };

  const escalate = async (alert) => {
    await base44.entities.FijAlert.update(alert.id, { severity: 'critical' });
    setAlerts(as => as.map(a => a.id === alert.id ? { ...a, severity: 'critical' } : a));
    alert('Alerte escaladée à la direction');
  };

  return (
    <FijPageShell
      accessLevel={accessLevel}
      title="Alertes"
      subtitle="Suivi des points d'attention sur les FIJ"
      actions={
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 text-xs font-medium text-black bg-amber-400 hover:bg-amber-300 rounded-lg px-3 py-1.5 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Signaler
        </button>
      }
    >
      <div className="flex gap-1 mb-4">
        {[
          { v: 'open', l: 'Ouvertes' },
          { v: 'resolved', l: 'Résolues' },
          { v: 'all', l: 'Toutes' },
        ].map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f.v ? 'bg-amber-400/15 text-amber-400 border border-amber-400/20' : 'text-gray-500 hover:text-white border border-transparent'
            }`}>
            {f.l}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="Aucune alerte" sub="Tout va bien ! Aucun point d'attention actuellement." />
      ) : (
        <div className="space-y-2">
          {visible.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`border rounded-xl p-3 ${
                alert.severity === 'critical' ? 'bg-red-500/5 border-red-500/20'
                : alert.severity === 'warning' ? 'bg-amber-500/5 border-amber-500/20'
                : 'bg-blue-500/5 border-blue-500/20'
              }`}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  alert.severity === 'critical' ? 'text-red-400'
                  : alert.severity === 'warning' ? 'text-amber-400'
                  : 'text-blue-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{alert.title}</p>
                    {alert.status === 'resolved' && <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />}
                  </div>
                  {alert.description && <p className="text-xs text-gray-500 mt-0.5">{alert.description}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-gray-400">{TYPE_LABELS[alert.type] || alert.type}</span>
                    {alert.fij_name && <span className="text-[10px] text-gray-600">· {alert.fij_name}</span>}
                  </div>
                </div>
              </div>
              {isCoord && alert.status !== 'resolved' && (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => resolve(alert)} className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 border border-green-500/20 rounded-lg px-2.5 py-1 transition-colors">
                    <CheckCircle className="w-3 h-3" /> Résoudre
                  </button>
                  {alert.severity !== 'critical' && (
                    <button onClick={() => escalate(alert)} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg px-2.5 py-1 transition-colors">
                      <ArrowUp className="w-3 h-3" /> Escalader
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && <AlertFormModal fijs={fijs} userId={user?.id} isPilot={!isCoord} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
      </AnimatePresence>
    </FijPageShell>
  );
}

function AlertFormModal({ fijs, userId, isPilot, onClose, onSaved }) {
  const [form, setForm] = useState({ fij_house_id: '', type: 'pastoral_attention', severity: 'warning', title: '', description: '' });
  const [saving, setSaving] = useState(false);
  const inputCls = "w-full h-10 px-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30";

  // For pilots, only show their FIJs
  const myFijs = isPilot ? fijs.filter(f => f.pilot_user_id === userId || (f.co_pilot_user_ids || []).includes(userId)) : fijs;

  const save = async () => {
    setSaving(true);
    const fij = fijs.find(f => f.id === form.fij_house_id);
    await base44.entities.FijAlert.create({
      ...form,
      fij_name: fij?.name || '',
      status: 'open',
      created_by: userId,
    });
    onSaved();
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        onClick={e => e.stopPropagation()} className="bg-zinc-950 border border-white/10 rounded-t-2xl sm:rounded-2xl w-full max-w-md">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Signaler un besoin</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">FIJ concernée</label>
            <select className={inputCls} value={form.fij_house_id} onChange={e => setForm(f => ({ ...f, fij_house_id: e.target.value }))}>
              <option value="">— Sélectionner —</option>
              {myFijs.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Type</label>
            <select className={inputCls} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Titre *</label>
            <input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Résumé du besoin" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Description</label>
            <textarea className={inputCls + ' h-20 resize-none'} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Détails..." />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-white/5 flex gap-2">
          <button onClick={onClose} className="flex-1 text-sm text-gray-400 border border-white/10 rounded-xl py-2.5 hover:bg-white/5">Annuler</button>
          <button onClick={save} disabled={saving || !form.title} className="flex-1 text-sm font-medium text-black bg-amber-400 hover:bg-amber-300 rounded-xl py-2.5 disabled:opacity-50">
            {saving ? '...' : 'Signaler'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}