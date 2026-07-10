import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Eye, Repeat } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const BLOCK_TYPES = [
  { value: 'etudes', label: 'Études' },
  { value: 'travail', label: 'Travail' },
  { value: 'priere', label: 'Prière' },
  { value: 'repos', label: 'Repos' },
  { value: 'deplacement', label: 'Déplacement' },
  { value: 'service', label: 'Service' },
  { value: 'formation', label: 'Formation' },
  { value: 'personnel', label: 'Personnel' },
  { value: 'autre', label: 'Autre' },
];

const VISIBILITY_OPTIONS = [
  { value: 'private', label: 'Privé — seul moi vois le détail' },
  { value: 'unavailable_only', label: 'Indisponible — mes responsables voient juste "Indisponible"' },
  { value: 'shared_responsibles', label: 'Visible par mes responsables autorisés' },
];

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'Aucune' },
  { value: 'daily', label: 'Tous les jours' },
  { value: 'weekly', label: 'Toutes les semaines' },
  { value: 'biweekly', label: 'Toutes les 2 semaines' },
  { value: 'monthly', label: 'Tous les mois' },
];

export default function TimeBlockForm({ open, onClose, date, startTime, endTime, existing, onSaved }) {
  const [title, setTitle] = useState(existing?.title || '');
  const [blockType, setBlockType] = useState(existing?.block_type || 'personnel');
  const [blockDate, setBlockDate] = useState(date || new Date().toISOString().split('T')[0]);
  const [startT, setStartT] = useState(startTime || '09:00');
  const [endT, setEndT] = useState(endTime || '10:00');
  const [recurrence, setRecurrence] = useState(existing?.recurrence || 'none');
  const [comment, setComment] = useState(existing?.comment || '');
  const [visibility, setVisibility] = useState(existing?.visibility || 'private');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !blockDate || !startT || !endT) return;
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        block_type: blockType,
        start_date: blockDate,
        start_time: startT,
        end_time: endT,
        recurrence,
        comment: comment.trim() || undefined,
        visibility,
      };
      let result;
      if (existing?.id) {
        result = await base44.entities.PersonalTimeBlock.update(existing.id, payload);
      } else {
        result = await base44.entities.PersonalTimeBlock.create(payload);
      }
      onSaved?.(result);
      onClose();
    } catch (e) {
      // Error bubbles up
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existing?.id) return;
    setSaving(true);
    try {
      await base44.entities.PersonalTimeBlock.delete(existing.id);
      onSaved?.({ ...existing, _deleted: true });
      onClose();
    } catch (e) {
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-foreground/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-[90] glass-panel rounded-3xl p-6 w-[92vw] max-w-md max-h-[88vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-heading font-bold text-foreground">
                {existing ? 'Modifier l\'occupation' : 'Ajouter une occupation'}
              </h3>
              <button onClick={onClose} className="text-muted-foreground p-1 rounded-lg hover:bg-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Titre</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Révision, sport, prière..."
                  className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-secondary/40"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Type</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {BLOCK_TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setBlockType(t.value)}
                      className={`text-[11px] font-medium px-2 py-2 rounded-lg border transition-all ${
                        blockType === t.value
                          ? 'bg-secondary/10 border-secondary/30 text-secondary'
                          : 'bg-card border-border text-muted-foreground hover:border-secondary/20'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Date</label>
                  <input
                    type="date"
                    value={blockDate}
                    onChange={e => setBlockDate(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-secondary/40"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Début</label>
                    <input
                      type="time"
                      value={startT}
                      onChange={e => setStartT(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl px-2 py-2.5 text-sm text-foreground focus:outline-none focus:border-secondary/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Fin</label>
                    <input
                      type="time"
                      value={endT}
                      onChange={e => setEndT(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl px-2 py-2.5 text-sm text-foreground focus:outline-none focus:border-secondary/40"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1"><Repeat className="w-3 h-3" /> Récurrence</label>
                <select
                  value={recurrence}
                  onChange={e => setRecurrence(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-secondary/40"
                >
                  {RECURRENCE_OPTIONS.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1"><Eye className="w-3 h-3" /> Visibilité</label>
                <select
                  value={visibility}
                  onChange={e => setVisibility(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-secondary/40"
                >
                  {VISIBILITY_OPTIONS.map(v => (
                    <option key={v.value} value={v.value}>{v.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Commentaire (optionnel)</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={2}
                  placeholder="Note personnelle..."
                  className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-secondary/40 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-6">
              {existing?.id && (
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-danger bg-danger/10 border border-danger/20 hover:bg-danger/20 transition-all disabled:opacity-50"
                >
                  Supprimer
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground bg-surface border border-border hover:bg-muted transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !title.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-secondary hover:bg-secondary/90 transition-all disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : existing ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}