import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock, Plus, ChevronRight, X, Clock, Check } from 'lucide-react';

const RDV_TYPES = [
  { key: 'bergere', label: 'Bergère' },
  { key: 'leader', label: 'Leader' },
  { key: 'referent', label: 'Référent' },
  { key: 'pastoral', label: 'Soins pastoraux' },
  { key: 'academic', label: 'Vie Académique' },
  { key: 'formation', label: 'Formation' },
  { key: 'service', label: 'Service / responsabilité' },
  { key: 'orientation', label: 'Orientation' },
  { key: 'autre', label: 'Autre' },
];

const URGENCIES = {
  normal: { label: 'Normal', color: 'text-muted-foreground bg-surface border-border' },
  important: { label: 'Important', color: 'text-warning bg-warning/10 border-warning/20' },
  urgent: { label: 'Urgent', color: 'text-danger bg-danger/10 border-danger/20' },
};

export default function RendezVous() {
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'bergere', subject: '', urgency: 'normal', message: '' });

  const submit = () => {
    if (!form.subject.trim()) return;
    setRequests(prev => [{ id: Date.now(), ...form, status: 'pending', date: new Date() }, ...prev]);
    setForm({ type: 'bergere', subject: '', urgency: 'normal', message: '' });
    setShowForm(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl font-heading font-bold text-foreground mb-1">Rendez-vous</h1>
        <p className="text-sm text-muted-foreground">Demande un rendez-vous avec la bonne personne, sans devoir écrire à cinq personnes.</p>
      </motion.div>

      <button
        onClick={() => setShowForm(true)}
        className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 text-sm font-semibold py-2.5 rounded-xl transition-all mb-6"
      >
        <Plus className="w-4 h-4" /> Demander un rendez-vous
      </button>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <CalendarClock className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Aucune demande de rendez-vous.</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Tu peux en créer une quand tu en as besoin.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r, i) => {
            const urgency = URGENCIES[r.urgency] || URGENCIES.normal;
            const typeLabel = RDV_TYPES.find(t => t.key === r.type)?.label || r.type;
            return (
              <motion.div key={r.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-400/20 flex items-center justify-center flex-shrink-0">
                      <CalendarClock className="w-5 h-5 text-rose-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{r.subject}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground bg-surface px-2 py-0.5 rounded-full">{typeLabel}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${urgency.color}`}>{urgency.label}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground bg-surface px-2 py-0.5 rounded-full">En attente</span>
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
                <h3 className="text-sm font-semibold text-foreground">Demander un rendez-vous</h3>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground p-1"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Type de rendez-vous</label>
                  <div className="flex flex-wrap gap-1.5">
                    {RDV_TYPES.map(t => (
                      <button key={t.key} onClick={() => setForm(f => ({ ...f, type: t.key }))}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                          form.type === t.key ? 'bg-rose-500/10 text-rose-600 border-rose-400/30' : 'bg-surface text-muted-foreground border-border'
                        }`}>{t.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Sujet</label>
                  <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder="Objet du rendez-vous..."
                    className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400/40" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Urgence</label>
                  <div className="flex gap-2">
                    {Object.entries(URGENCIES).map(([key, val]) => (
                      <button key={key} onClick={() => setForm(f => ({ ...f, urgency: key }))}
                        className={`flex-1 text-xs py-2 rounded-lg border transition-all ${
                          form.urgency === key ? val.color : 'bg-surface text-muted-foreground border-border'
                        }`}>{val.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Message</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    rows={3} placeholder="Décris ton besoin..."
                    className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400/40 resize-none" />
                </div>
                <button onClick={submit}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                  Envoyer la demande
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}