import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, CheckCircle, AlertCircle, CalendarClock } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const ABSENCE_REASONS = [
  { value: 'travail', label: 'Travail' },
  { value: 'etudes', label: 'Études' },
  { value: 'sante', label: 'Santé' },
  { value: 'famille', label: 'Famille' },
  { value: 'deplacement', label: 'Déplacement' },
  { value: 'service_ailleurs', label: 'Service ailleurs' },
  { value: 'autre', label: 'Autre' },
];

export default function EventDetailPanel({ event, open, onClose, existingResponse, onResponded }) {
  const [status, setStatus] = useState(existingResponse?.status || 'no_response');
  const [reason, setReason] = useState(existingResponse?.reason_category || '');
  const [lateTime, setLateTime] = useState(existingResponse?.estimated_arrival_time || '');
  const [comment, setComment] = useState(existingResponse?.comment || '');
  const [saving, setSaving] = useState(false);

  const handleRespond = async (newStatus) => {
    setSaving(true);
    try {
      const payload = {
        event_id: event.id,
        event_title: event.title,
        event_date: event.event_date,
        status: newStatus,
        reason_category: newStatus === 'absent' ? reason : undefined,
        estimated_arrival_time: newStatus === 'late' ? lateTime : undefined,
        comment: comment || undefined,
      };
      let result;
      if (existingResponse?.id) {
        result = await base44.entities.AttendanceResponse.update(existingResponse.id, payload);
      } else {
        result = await base44.entities.AttendanceResponse.create(payload);
      }
      onResponded?.(result);
      onClose();
    } catch (e) {
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && event && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-foreground/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className="fixed right-0 top-16 bottom-0 z-[90] glass-panel w-[92vw] max-w-sm p-5 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-heading font-bold text-foreground">Détail</h3>
              <button onClick={onClose} className="text-muted-foreground p-1 rounded-lg hover:bg-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-5">
              <p className="text-sm font-bold text-foreground leading-tight">{event.title}</p>
              {event.description && (
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{event.description}</p>
              )}
              <div className="flex flex-col gap-1.5 mt-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarClock className="w-3.5 h-3.5 text-secondary" />
                  <span>{new Date(event.event_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>
                {event.event_time && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 text-secondary" />
                    <span>{event.event_time}</span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-secondary" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Présence */}
            <div className="border-t border-border pt-4">
              <p className="text-xs font-heading font-semibold text-foreground mb-3">Ma présence</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  onClick={() => handleRespond('present')}
                  disabled={saving}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all disabled:opacity-50 ${
                    status === 'present'
                      ? 'bg-success/10 border-success/30 text-success'
                      : 'bg-card border-border text-muted-foreground hover:border-success/20'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-[10px] font-medium">Présent</span>
                </button>
                <button
                  onClick={() => handleRespond('absent')}
                  disabled={saving}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all disabled:opacity-50 ${
                    status === 'absent'
                      ? 'bg-danger/10 border-danger/30 text-danger'
                      : 'bg-card border-border text-muted-foreground hover:border-danger/20'
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-[10px] font-medium">Absent</span>
                </button>
                <button
                  onClick={() => handleRespond('late')}
                  disabled={saving}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all disabled:opacity-50 ${
                    status === 'late'
                      ? 'bg-warning/10 border-warning/30 text-warning'
                      : 'bg-card border-border text-muted-foreground hover:border-warning/20'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span className="text-[10px] font-medium">Retard</span>
                </button>
              </div>

              {(status === 'absent' || !status) && (
                <div className="mb-3">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Motif d'absence</label>
                  <select
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-secondary/40"
                  >
                    <option value="">Sélectionner...</option>
                    {ABSENCE_REASONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {status === 'late' && (
                <div className="mb-3">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Heure d'arrivée estimée</label>
                  <input
                    type="time"
                    value={lateTime}
                    onChange={e => setLateTime(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-secondary/40"
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Commentaire (optionnel)</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={2}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-secondary/40 resize-none"
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}