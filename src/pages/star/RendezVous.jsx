import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock, Plus, X, Clock, Check, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/star/PageHeader';

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
  normal: { label: 'Normal', cls: 'text-muted-foreground bg-surface border-border' },
  important: { label: 'Important', cls: 'text-warning bg-warning/10 border-warning/20' },
  urgent: { label: 'Urgent', cls: 'text-danger bg-danger/10 border-danger/20' },
};

const STATUSES = {
  pending: { label: 'En attente', cls: 'text-warning bg-warning/10 border-warning/20' },
  accepted: { label: 'Accepté', cls: 'text-success bg-success/10 border-success/20' },
  proposed: { label: 'Créneau proposé', cls: 'text-info bg-info/10 border-info/20' },
  completed: { label: 'Terminé', cls: 'text-muted-foreground bg-surface border-border' },
  cancelled: { label: 'Annulé', cls: 'text-muted-foreground bg-surface border-border' },
  transferred: { label: 'Transféré', cls: 'text-info bg-info/10 border-info/20' },
};

export default function RendezVous() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ request_type: 'bergere', subject: '', urgency: 'normal', message: '', proposed_slots: '' });

  const load = () => {
    base44.entities.AppointmentRequest.list('-created_date', 50)
      .then(data => { setRequests(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.subject.trim()) return;
    await base44.entities.AppointmentRequest.create({ ...form, status: 'pending' });
    setForm({ request_type: 'bergere', subject: '', urgency: 'normal', message: '', proposed_slots: '' });
    setShowForm(false);
    load();
  };

  const cancel = async (id) => {
    await base44.entities.AppointmentRequest.update(id, { status: 'cancelled' });
    load();
  };

  const pending = requests.filter(r => r.status === 'pending' || r.status === 'accepted' || r.status === 'proposed');
  const history = requests.filter(r => r.status === 'completed' || r.status === 'cancelled' || r.status === 'transferred');

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <PageHeader
        title="Rendez-vous"
        intention="Demande un RDV sans devoir écrire à cinq personnes."
        breadcrumbs={[{ label: 'Accueil', to: '/app' }, { label: 'Accompagnement' }, { label: 'Rendez-vous' }]}
        actions={
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-white text-xs font-semibold hover:bg-secondary/90 transition-colors">
            <Plus className="w-4 h-4" /> Demander
          </button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-border border-t-secondary rounded-full animate-spin" /></div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-surface border border-border mb-4">
            <CalendarClock className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">Aucune demande</p>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">Tu peux demander un rendez-vous quand tu en ressens le besoin.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">En cours</p>
              {pending.map(r => <RdvCard key={r.id} rdv={r} onCancel={cancel} />)}
            </div>
          )}
          {history.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Historique</p>
              <div className="opacity-70">{history.map(r => <RdvCard key={r.id} rdv={r} onCancel={cancel} />)}</div>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <RdvForm form={form} setForm={setForm} onClose={() => setShowForm(false)} onSave={submit} />
        )}
      </AnimatePresence>
    </div>
  );
}

function RdvCard({ rdv, onCancel }) {
  const typeLabel = RDV_TYPES.find(t => t.key === rdv.request_type)?.label || rdv.request_type;
  const urg = URGENCIES[rdv.urgency] || URGENCIES.normal;
  const st = STATUSES[rdv.status] || STATUSES.pending;
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-semibold text-secondary">{typeLabel}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${urg.cls}`}>{urg.label}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${st.cls}`}>{st.label}</span>
          </div>
          <h3 className="text-sm font-semibold text-foreground">{rdv.subject}</h3>
          {rdv.message && <p className="text-xs text-muted-foreground mt-1">{rdv.message}</p>}
          {rdv.proposed_slots && <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1"><Clock className="w-3 h-3" /> Disponibilités : {rdv.proposed_slots}</p>}
          {rdv.review_comment && <p className="text-[11px] text-success mt-2 flex items-center gap-1"><Check className="w-3 h-3" /> {rdv.review_comment}</p>}
        </div>
        {(rdv.status === 'pending') && (
          <button onClick={() => onCancel(rdv.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0" title="Annuler">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

function RdvForm({ form, setForm, onClose, onSave }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        className="fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-sm" />
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-[70] bg-card rounded-t-3xl border-t border-border p-6 pb-8 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-foreground">Demander un rendez-vous</h3>
          <button onClick={onClose} className="text-muted-foreground p-1"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Type de rendez-vous</label>
            <select value={form.request_type} onChange={e => setForm({ ...form, request_type: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm">
              {RDV_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Sujet *</label>
            <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm" placeholder="Objet du rendez-vous" autoFocus />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Niveau d'urgence</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(URGENCIES).map(([key, val]) => (
                <button key={key} onClick={() => setForm({ ...form, urgency: key })}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${form.urgency === key ? val.cls + ' ring-2 ring-offset-1 ring-secondary/30' : 'bg-surface border-border text-muted-foreground'}`}>
                  {val.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Message</label>
            <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm" rows={3} placeholder="Précise ta demande..." />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Disponibilités</label>
            <input value={form.proposed_slots} onChange={e => setForm({ ...form, proposed_slots: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm" placeholder="Ex: Soirées cette semaine, samedi matin..." />
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-info/5 border border-info/10">
            <AlertCircle className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground">Ta demande reste confidentielle. Elle sera visible uniquement par la personne concernée.</p>
          </div>
          <button onClick={onSave} disabled={!form.subject.trim()}
            className="w-full py-3 rounded-xl bg-secondary text-white text-sm font-semibold hover:bg-secondary/90 disabled:opacity-40 transition-colors">
            Envoyer la demande
          </button>
        </div>
      </motion.div>
    </>
  );
}