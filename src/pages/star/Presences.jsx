import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, AlertCircle, ChevronRight, Calendar, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const ABSENCE_REASONS = [
  { key: 'travail', label: 'Travail' },
  { key: 'etudes', label: 'Études' },
  { key: 'sante', label: 'Santé' },
  { key: 'famille', label: 'Famille' },
  { key: 'deplacement', label: 'Déplacement' },
  { key: 'service_ailleurs', label: 'Service ailleurs' },
  { key: 'autre', label: 'Autre' },
];

const STATUS_INFO = {
  present: { label: 'Présent', cls: 'bg-success/10 text-success border-success/20', icon: CheckCircle },
  absent: { label: 'Absent', cls: 'bg-danger/10 text-danger border-danger/20', icon: AlertCircle },
  late: { label: 'Retard', cls: 'bg-warning/10 text-warning border-warning/20', icon: Clock },
};

export default function Presences() {
  const [events, setEvents] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [absenceEvent, setAbsenceEvent] = useState(null);
  const [lateEvent, setLateEvent] = useState(null);
  const [absenceForm, setAbsenceForm] = useState({ reason_category: 'travail', comment: '' });
  const [lateForm, setLateForm] = useState({ estimated_arrival_time: '', comment: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [evs, resp] = await Promise.all([
        base44.entities.Event.list('-event_date', 20),
        base44.entities.AttendanceResponse.list('-created_date', 50),
      ]);
      const today = new Date().toISOString().split('T')[0];
      setEvents((evs || []).filter(e => e.is_active && e.event_date >= today));
      const map = {};
      (resp || []).forEach(r => { map[r.event_id] = r; });
      setResponses(map);
    } catch (e) {}
    setLoading(false);
  };

  const markPresent = async (ev) => {
    const existing = responses[ev.id];
    if (existing) {
      await base44.entities.AttendanceResponse.update(existing.id, { status: 'present', reason_category: null, estimated_arrival_time: null });
    } else {
      await base44.entities.AttendanceResponse.create({ event_id: ev.id, event_title: ev.title, event_date: ev.event_date, status: 'present' });
    }
    loadData();
  };

  const submitAbsence = async () => {
    const ev = absenceEvent;
    if (!ev) return;
    const existing = responses[ev.id];
    const payload = { status: 'absent', reason_category: absenceForm.reason_category, comment: absenceForm.comment, estimated_arrival_time: null };
    if (existing) {
      await base44.entities.AttendanceResponse.update(existing.id, payload);
    } else {
      await base44.entities.AttendanceResponse.create({ event_id: ev.id, event_title: ev.title, event_date: ev.event_date, ...payload });
    }
    setAbsenceEvent(null);
    setAbsenceForm({ reason_category: 'travail', comment: '' });
    loadData();
  };

  const submitLate = async () => {
    const ev = lateEvent;
    if (!ev) return;
    const existing = responses[ev.id];
    const payload = { status: 'late', estimated_arrival_time: lateForm.estimated_arrival_time, comment: lateForm.comment, reason_category: null };
    if (existing) {
      await base44.entities.AttendanceResponse.update(existing.id, payload);
    } else {
      await base44.entities.AttendanceResponse.create({ event_id: ev.id, event_title: ev.title, event_date: ev.event_date, ...payload });
    }
    setLateEvent(null);
    setLateForm({ estimated_arrival_time: '', comment: '' });
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-border border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl font-heading font-bold text-foreground mb-1">Mes présences</h1>
        <p className="text-sm text-muted-foreground">Confirme ta présence, signale une absence ou un retard.</p>
      </motion.div>

      {events.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-surface border border-border mb-4">
            <CheckCircle className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">Aucune présence à confirmer</p>
          <p className="text-xs text-muted-foreground">Tu es à jour. Tu peux consulter ton agenda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">À confirmer</h2>
          {events.map((ev, i) => {
            const date = new Date(ev.event_date);
            const isToday = ev.event_date === new Date().toISOString().split('T')[0];
            const resp = responses[ev.id];
            const statusInfo = resp ? STATUS_INFO[resp.status] : null;
            return (
              <motion.div key={ev.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-shrink-0 w-11 text-center bg-secondary/10 border border-secondary/20 rounded-xl py-1.5">
                      <p className="text-[10px] text-secondary font-medium uppercase">
                        {date.toLocaleDateString('fr-FR', { month: 'short' })}
                      </p>
                      <p className="text-sm font-bold text-secondary leading-none">{date.getDate()}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{ev.title}</p>
                      {ev.event_time && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Clock className="w-3 h-3" /> {ev.event_time}
                        </span>
                      )}
                    </div>
                    {isToday && <span className="text-[10px] text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">Aujourd'hui</span>}
                  </div>

                  {statusInfo ? (
                    <div className="space-y-2">
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold ${statusInfo.cls}`}>
                        <statusInfo.icon className="w-3.5 h-3.5" />
                        {statusInfo.label}
                        {resp.reason_category && <span className="text-muted-foreground">· {ABSENCE_REASONS.find(r => r.key === resp.reason_category)?.label || resp.reason_category}</span>}
                        {resp.estimated_arrival_time && <span className="text-muted-foreground">· {resp.estimated_arrival_time}</span>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => markPresent(ev)} className="flex-1 flex items-center justify-center gap-1.5 bg-surface hover:bg-success/10 text-muted-foreground hover:text-success text-xs font-medium py-1.5 rounded-lg transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" /> Présent
                        </button>
                        <button onClick={() => { setAbsenceEvent(ev); setAbsenceForm({ reason_category: resp.reason_category || 'travail', comment: resp.comment || '' }); }} className="flex-1 flex items-center justify-center gap-1.5 bg-surface hover:bg-danger/10 text-muted-foreground hover:text-danger text-xs font-medium py-1.5 rounded-lg transition-colors">
                          <AlertCircle className="w-3.5 h-3.5" /> Absent
                        </button>
                        <button onClick={() => { setLateEvent(ev); setLateForm({ estimated_arrival_time: resp.estimated_arrival_time || '', comment: resp.comment || '' }); }} className="flex-1 flex items-center justify-center gap-1.5 bg-surface hover:bg-warning/10 text-muted-foreground hover:text-warning text-xs font-medium py-1.5 rounded-lg transition-colors">
                          <Clock className="w-3.5 h-3.5" /> Retard
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => markPresent(ev)} className="flex-1 flex items-center justify-center gap-1.5 bg-success/10 hover:bg-success/20 text-success text-xs font-semibold py-2 rounded-lg transition-colors">
                        <CheckCircle className="w-3.5 h-3.5" /> Présent
                      </button>
                      <button onClick={() => { setAbsenceEvent(ev); setAbsenceForm({ reason_category: 'travail', comment: '' }); }} className="flex-1 flex items-center justify-center gap-1.5 bg-danger/10 hover:bg-danger/20 text-danger text-xs font-semibold py-2 rounded-lg transition-colors">
                        <AlertCircle className="w-3.5 h-3.5" /> Absent
                      </button>
                      <button onClick={() => { setLateEvent(ev); setLateForm({ estimated_arrival_time: '', comment: '' }); }} className="flex-1 flex items-center justify-center gap-1.5 bg-warning/10 hover:bg-warning/20 text-warning text-xs font-semibold py-2 rounded-lg transition-colors">
                        <Clock className="w-3.5 h-3.5" /> Retard
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-border">
        <Link to="/app/agenda" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Calendar className="w-4 h-4" />
          Voir tous les événements
          <ChevronRight className="w-4 h-4 ml-auto" />
        </Link>
      </div>

      {/* Formulaire d'absence */}
      <AnimatePresence>
        {absenceEvent && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAbsenceEvent(null)}
              className="fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-sm" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-card rounded-t-3xl border-t border-border p-6 pb-8">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Signaler une absence</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{absenceEvent.title}</p>
                </div>
                <button onClick={() => setAbsenceEvent(null)} className="text-muted-foreground p-1"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Motif</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ABSENCE_REASONS.map(r => (
                      <button key={r.key} onClick={() => setAbsenceForm({ ...absenceForm, reason_category: r.key })}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${absenceForm.reason_category === r.key ? 'bg-secondary/10 border-secondary/30 text-secondary' : 'bg-surface border-border text-muted-foreground'}`}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Commentaire (optionnel)</label>
                  <textarea value={absenceForm.comment} onChange={e => setAbsenceForm({ ...absenceForm, comment: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm" rows={2} placeholder="Un mot pour le responsable..." />
                </div>
                <button onClick={submitAbsence} className="w-full py-3 rounded-xl bg-danger text-white text-sm font-semibold hover:bg-danger/90 transition-colors">
                  Confirmer mon absence
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Formulaire de retard */}
      <AnimatePresence>
        {lateEvent && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLateEvent(null)}
              className="fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-sm" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-card rounded-t-3xl border-t border-border p-6 pb-8">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Signaler un retard</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{lateEvent.title}</p>
                </div>
                <button onClick={() => setLateEvent(null)} className="text-muted-foreground p-1"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Heure estimée d'arrivée</label>
                  <input type="time" value={lateForm.estimated_arrival_time} onChange={e => setLateForm({ ...lateForm, estimated_arrival_time: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Commentaire (optionnel)</label>
                  <textarea value={lateForm.comment} onChange={e => setLateForm({ ...lateForm, comment: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm" rows={2} placeholder="Un mot pour le responsable..." />
                </div>
                <button onClick={submitLate} className="w-full py-3 rounded-xl bg-warning text-white text-sm font-semibold hover:bg-warning/90 transition-colors">
                  Signaler mon retard
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}