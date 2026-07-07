import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import FijPageShell, { LoadingSpinner, EmptyState } from '@/components/fij/FijPageShell';
import { useFijData } from '@/hooks/useFijData';
import { Users, Plus, MapPin, Clock, X, Heart, PauseCircle, PlayCircle } from 'lucide-react';

export default function Registre() {
  const { fijs, loading, accessLevel, reload } = useFijData();
  const [showForm, setShowForm] = useState(false);
  const [editingFij, setEditingFij] = useState(null);

  if (loading) return <LoadingSpinner />;

  const sorted = [...fijs].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  return (
    <FijPageShell
      accessLevel={accessLevel}
      title="Registre des FIJ"
      subtitle="Liste officielle des Familles d'Impact Jeunes"
      requiredRoles={['coordination', 'direction']}
      actions={
        <button
          onClick={() => { setEditingFij(null); setShowForm(true); }}
          className="flex items-center gap-1.5 text-xs font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg px-3 py-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Ajouter
        </button>
      }
    >
      {sorted.length === 0 ? (
        <EmptyState icon={Users} title="Aucune FIJ enregistrée" sub="Ajoute la première FIJ pour commencer." />
      ) : (
        <div className="space-y-2">
          {sorted.map((fij, i) => (
            <motion.div
              key={fij.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
            >
              <div className="flex items-center gap-3 p-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{fij.name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${
                      fij.status === 'active' ? 'bg-success/10 text-success'
                      : fij.status === 'opening' ? 'bg-primary/10 text-primary'
                      : fij.status === 'paused' ? 'bg-purple-500/10 text-purple-600'
                      : 'bg-muted text-muted-foreground'
                    }`}>
                      {fij.status === 'active' ? 'Active' : fij.status === 'opening' ? 'Ouverture' : fij.status === 'paused' ? 'Pause' : 'Fermée'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {fij.city && <span className="text-xs text-muted-foreground flex items-center gap-0.5"><MapPin className="w-3 h-3" />{fij.city}</span>}
                    {fij.pilot_name && <span className="text-xs text-muted-foreground">Pilote: {fij.pilot_name}</span>}
                    <span className="text-xs text-muted-foreground">{fij.member_count || 0} membres</span>
                  </div>
                  {(fij.meeting_day || fij.meeting_time) && (
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {fij.meeting_day || '—'}{fij.meeting_time ? ` à ${fij.meeting_time}` : ''}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => { setEditingFij(fij); setShowForm(true); }}
                    className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-surface transition-colors"
                  >
                    Modifier
                  </button>
                  <Link
                    to={`/app/departements/fij/fij/${fij.id}`}
                    className="text-xs text-secondary hover:text-secondary/80 px-2 py-1 rounded-lg hover:bg-secondary/5 transition-colors"
                  >
                    Ouvrir
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <FijFormModal
            fij={editingFij}
            onClose={() => setShowForm(false)}
            onSaved={() => { setShowForm(false); reload(); }}
          />
        )}
      </AnimatePresence>
    </FijPageShell>
  );
}

function FijFormModal({ fij, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: fij?.name || '',
    city: fij?.city || '',
    status: fij?.status || 'active',
    meeting_day: fij?.meeting_day || '',
    meeting_time: fij?.meeting_time || '',
    pilot_name: fij?.pilot_name || '',
    pilot_email: fij?.pilot_email || '',
    member_count: fij?.member_count || 0,
    address: fij?.address || '',
    description: fij?.description || '',
    is_nantes: fij?.is_nantes || false,
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      if (fij) {
        await base44.entities.FIJ.update(fij.id, form);
      } else {
        await base44.entities.FIJ.create(form);
      }
      onSaved();
    } catch (e) {
      alert('Erreur: ' + e.message);
    }
    setSaving(false);
  };

  const inputCls = "w-full h-10 px-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-xl"
      >
        <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">{fij ? 'Modifier la FIJ' : 'Nouvelle FIJ'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Nom *</label>
            <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="FIJ Nantes Centre" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Ville *</label>
            <input className={inputCls} value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Nantes" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Statut</label>
            <select className={inputCls} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="active">Active</option>
              <option value="opening">En ouverture</option>
              <option value="paused">En pause</option>
              <option value="closed">Fermée</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Jour de réunion</label>
              <input className={inputCls} value={form.meeting_day} onChange={e => setForm(f => ({ ...f, meeting_day: e.target.value }))} placeholder="Vendredi" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Heure</label>
              <input className={inputCls} value={form.meeting_time} onChange={e => setForm(f => ({ ...f, meeting_time: e.target.value }))} placeholder="19:00" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Nom du pilote</label>
            <input className={inputCls} value={form.pilot_name} onChange={e => setForm(f => ({ ...f, pilot_name: e.target.value }))} placeholder="Jean Dupont" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Email du pilote</label>
            <input className={inputCls} value={form.pilot_email} onChange={e => setForm(f => ({ ...f, pilot_email: e.target.value }))} placeholder="pilote@email.com" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Adresse</label>
            <input className={inputCls} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="12 rue Example" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Nombre de membres</label>
            <input type="number" className={inputCls} value={form.member_count} onChange={e => setForm(f => ({ ...f, member_count: parseInt(e.target.value) || 0 }))} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description</label>
            <textarea className={inputCls + ' h-20 resize-none'} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description courte..." />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_nantes} onChange={e => setForm(f => ({ ...f, is_nantes: e.target.checked }))} className="w-4 h-4 rounded accent-secondary" />
            <span className="text-sm text-muted-foreground">FIJ basée à Nantes</span>
          </label>
        </div>
        <div className="sticky bottom-0 bg-card border-t border-border px-5 py-4 flex gap-2">
          <button onClick={onClose} className="flex-1 text-sm text-muted-foreground border border-border rounded-xl py-2.5 hover:bg-surface transition-colors">Annuler</button>
          <button onClick={save} disabled={saving || !form.name || !form.city} className="flex-1 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl py-2.5 transition-colors disabled:opacity-50">
            {saving ? 'Sauvegarde...' : fij ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}