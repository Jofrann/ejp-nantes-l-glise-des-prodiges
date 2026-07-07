import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import FijPageShell, { LoadingSpinner, EmptyState } from '@/components/fij/FijPageShell';
import { useFijData } from '@/hooks/useFijData';
import { Mail, Plus, X, Send, Clock } from 'lucide-react';

export default function Communications() {
  const { user, fijs, loading, accessLevel } = useFijData();
  const [comms, setComms] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = () => {
    base44.entities.FijCommunication.filter({}, '-created_date', 100).then(c => {
      setComms(c || []);
      setDataLoading(false);
    });
  };
  useEffect(() => { load(); }, []);

  if (loading || dataLoading) return <LoadingSpinner />;

  const isCoord = accessLevel === 'coordination' || accessLevel === 'direction';

  let visible = comms;
  if (!isCoord) {
    // Pilots see only what's targeted to them
    visible = comms.filter(c =>
      c.target_scope === 'all_pilots' ||
      (c.target_scope === 'specific_fij' && c.target_fij_ids?.some(id =>
        fijs.some(f => f.id === id && (f.pilot_user_id === user?.id || (f.co_pilot_user_ids || []).includes(user?.id)))
      ))
    );
  }
  if (filter !== 'all') visible = visible.filter(c => c.type === filter);

  const sendNow = async (comm) => {
    await base44.entities.FijCommunication.update(comm.id, { status: 'sent' });
    setComms(cs => cs.map(c => c.id === comm.id ? { ...c, status: 'sent' } : c));
  };

  return (
    <FijPageShell
      accessLevel={accessLevel}
      title="Communications"
      subtitle="Thèmes, annonces et rappels destinés aux pilotes"
      actions={isCoord ? (
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 text-xs font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg px-3 py-1.5 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nouveau
        </button>
      ) : undefined}
    >
      {/* Filtres */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {[
          { v: 'all', l: 'Tous' },
          { v: 'theme', l: 'Thèmes' },
          { v: 'announcement', l: 'Annonces' },
          { v: 'reminder', l: 'Rappels' },
          { v: 'recap', l: 'Récapitulatifs' },
        ].map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f.v ? 'bg-secondary/15 text-secondary border border-secondary/20' : 'text-muted-foreground hover:text-foreground border border-transparent'
            }`}>
            {f.l}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={Mail} title="Aucune communication" sub={isCoord ? "Crée un thème ou une annonce." : "Les communications apparaîtront ici."} />
      ) : (
        <div className="space-y-2">
          {visible.map((comm, i) => (
            <motion.div
              key={comm.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="bg-card border border-border rounded-xl p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      comm.type === 'theme' ? 'bg-purple-500/10 text-purple-600'
                      : comm.type === 'announcement' ? 'bg-primary/10 text-primary'
                      : comm.type === 'reminder' ? 'bg-secondary/10 text-secondary'
                      : 'bg-success/10 text-success'
                    }`}>
                      {comm.type === 'theme' ? 'Thème' : comm.type === 'announcement' ? 'Annonce' : comm.type === 'reminder' ? 'Rappel' : 'Récap'}
                    </span>
                    {comm.status === 'sent' && <span className="text-[10px] text-success">Envoyé</span>}
                    {comm.status === 'scheduled' && <span className="text-[10px] text-primary flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> Programmé</span>}
                    {comm.status === 'draft' && <span className="text-[10px] text-muted-foreground">Brouillon</span>}
                  </div>
                  <p className="text-sm font-medium text-foreground mt-1">{comm.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{comm.content}</p>
                  {comm.sent_by_name && <p className="text-[10px] text-muted-foreground mt-1">par {comm.sent_by_name}</p>}
                </div>
                {isCoord && comm.status === 'draft' && (
                  <button onClick={() => sendNow(comm)} className="flex items-center gap-1 text-xs text-success hover:text-success/80 border border-success/30 rounded-lg px-2 py-1 transition-colors flex-shrink-0">
                    <Send className="w-3 h-3" /> Envoyer
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && <CommFormModal fijs={fijs} userName={user?.full_name} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
      </AnimatePresence>
    </FijPageShell>
  );
}

function CommFormModal({ fijs, userName, onClose, onSaved }) {
  const [form, setForm] = useState({ type: 'announcement', title: '', content: '', target_scope: 'all_pilots', target_fij_ids: [] });
  const [saving, setSaving] = useState(false);
  const inputCls = "w-full h-10 px-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary";

  const save = async () => {
    setSaving(true);
    await base44.entities.FijCommunication.create({ ...form, sent_by_name: userName, status: 'draft' });
    onSaved();
    setSaving(false);
  };

  const toggleFij = (id) => {
    setForm(f => ({ ...f, target_fij_ids: f.target_fij_ids.includes(id) ? f.target_fij_ids.filter(x => x !== id) : [...f.target_fij_ids, id] }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        onClick={e => e.stopPropagation()} className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Nouvelle communication</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Type</label>
            <select className={inputCls} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="theme">Thème hebdomadaire</option>
              <option value="announcement">Annonce officielle</option>
              <option value="reminder">Rappel</option>
              <option value="recap">Récapitulatif</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Titre *</label>
            <input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Titre" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Contenu *</label>
            <textarea className={inputCls + ' h-28 resize-none'} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Contenu du message..." />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Destinataires</label>
            <select className={inputCls} value={form.target_scope} onChange={e => setForm(f => ({ ...f, target_scope: e.target.value, target_fij_ids: [] }))}>
              <option value="all_pilots">Tous les pilotes</option>
              <option value="specific_fij">FIJ spécifiques</option>
              <option value="coordination">Coordination</option>
            </select>
          </div>
          {form.target_scope === 'specific_fij' && (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {fijs.map(f => (
                <label key={f.id} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-surface">
                  <input type="checkbox" checked={form.target_fij_ids.includes(f.id)} onChange={() => toggleFij(f.id)} className="w-4 h-4 accent-secondary" />
                  <span className="text-sm text-muted-foreground">{f.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="sticky bottom-0 bg-card border-t border-border px-5 py-4 flex gap-2">
          <button onClick={onClose} className="flex-1 text-sm text-muted-foreground border border-border rounded-xl py-2.5 hover:bg-surface">Annuler</button>
          <button onClick={save} disabled={saving || !form.title || !form.content} className="flex-1 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl py-2.5 disabled:opacity-50">
            {saving ? '...' : 'Créer brouillon'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}