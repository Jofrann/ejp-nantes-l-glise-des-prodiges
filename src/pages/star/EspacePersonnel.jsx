import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Upload, Save, Palette, Layout, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const WIDGETS = [
  { key: 'agenda', label: 'Agenda du jour', icon: '📅', default: true },
  { key: 'presence', label: 'Présence à confirmer', icon: '✅', default: true },
  { key: 'formation', label: 'Formation en cours', icon: '🎓', default: true },
  { key: 'objectif', label: 'Objectif du mois', icon: '🎯', default: false },
  { key: 'lecture', label: 'Lecture de la Parole', icon: '📖', default: true },
  { key: 'rdv', label: 'Prochain rendez-vous', icon: '🕐', default: false },
  { key: 'ressources', label: 'Ressources favorites', icon: '📚', default: false },
  { key: 'responsabilite', label: 'Responsabilité prioritaire', icon: '💼', default: false },
  { key: 'notes', label: 'Notes épinglées', icon: '📌', default: false },
  { key: 'livre', label: 'Livre en cours', icon: '📕', default: false },
];

const ACCENTS = [
  { key: 'gold', label: 'Doré', color: 'bg-secondary' },
  { key: 'blue', label: 'Bleu nuit', color: 'bg-primary' },
  { key: 'green', label: 'Vert', color: 'bg-success' },
  { key: 'rose', label: 'Rose', color: 'bg-rose-500' },
  { key: 'purple', label: 'Violet', color: 'bg-purple-500' },
];

export default function EspacePersonnel() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ full_name: '', bio: '', photo_url: '', verset: '' });
  const [visibleWidgets, setVisibleWidgets] = useState(WIDGETS.filter(w => w.default).map(w => w.key));
  const [accent, setAccent] = useState('gold');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setForm({
        full_name: u?.full_name || '',
        bio: u?.bio || '',
        photo_url: u?.photo_url || '',
        verset: u?.verset || '',
      });
    });
  }, []);

  const toggleWidget = (key) => {
    setVisibleWidgets(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const save = async () => {
    setSaving(true);
    await base44.auth.updateMe(form);
    setSaving(false);
    setMsg('Espace personnalisé !');
    setTimeout(() => setMsg(''), 3000);
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, photo_url: file_url }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl font-heading font-bold text-foreground mb-1">Mon espace personnel</h1>
        <p className="text-sm text-muted-foreground">Personnalise ton bureau STAR.</p>
      </motion.div>

      {/* Profil visuel */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Layout className="w-4 h-4 text-secondary" />
          <p className="text-sm font-semibold text-foreground">Profil visuel</p>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-border">
              {form.photo_url ? (
                <img src={form.photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-secondary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-secondary">{form.full_name?.[0] || '?'}</span>
                </div>
              )}
            </div>
            <label className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-secondary flex items-center justify-center cursor-pointer shadow-lg">
              <Upload className="w-3.5 h-3.5 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
            </label>
          </div>
          <div className="flex-1">
            <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              placeholder="Ton nom"
              className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-secondary/40" />
          </div>
        </div>
        <input value={form.verset} onChange={e => setForm(f => ({ ...f, verset: e.target.value }))}
          placeholder="Ton verset personnel (optionnel)"
          className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-secondary/40 mb-2" />
        <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
          rows={2} placeholder="Phrase de saison (optionnel)"
          className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-secondary/40 resize-none" />
      </div>

      {/* Couleur d'accent */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-3">
          <Palette className="w-4 h-4 text-secondary" />
          <p className="text-sm font-semibold text-foreground">Couleur d'accent</p>
        </div>
        <div className="flex gap-3">
          {ACCENTS.map(a => (
            <button key={a.key} onClick={() => setAccent(a.key)}
              className={`w-10 h-10 rounded-xl ${a.color} ${accent === a.key ? 'ring-2 ring-offset-2 ring-secondary' : ''} transition-all`} />
          ))}
        </div>
      </div>

      {/* Widgets */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-3">
          <Layout className="w-4 h-4 text-secondary" />
          <p className="text-sm font-semibold text-foreground">Widgets affichés</p>
        </div>
        <div className="space-y-2">
          {WIDGETS.map(w => (
            <button key={w.key} onClick={() => toggleWidget(w.key)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                visibleWidgets.includes(w.key) ? 'bg-secondary/5 border-secondary/20' : 'bg-surface border-border'
              }`}>
              <span className="text-lg">{w.icon}</span>
              <span className="text-sm text-foreground flex-1 text-left">{w.label}</span>
              <div className={`w-9 h-5 rounded-full transition-colors ${visibleWidgets.includes(w.key) ? 'bg-secondary' : 'bg-border'}`}>
                <div className={`w-4 h-4 rounded-full bg-white m-0.5 transition-transform ${visibleWidgets.includes(w.key) ? 'translate-x-4' : ''}`} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button onClick={save} disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50">
        <Save className="w-4 h-4" /> {saving ? 'Sauvegarde...' : 'Enregistrer'}
      </button>
      {msg && <p className="text-center text-xs text-success mt-2">{msg}</p>}
    </div>
  );
}