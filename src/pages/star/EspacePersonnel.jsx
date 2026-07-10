import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Settings, Save, Check, Palette, Layout, Star, Shield, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/star/PageHeader';

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
  { key: 'gold', label: 'Doré', cls: 'bg-secondary' },
  { key: 'blue', label: 'Bleu nuit', cls: 'bg-primary' },
  { key: 'green', label: 'Vert', cls: 'bg-success' },
  { key: 'rose', label: 'Rose', cls: 'bg-rose-500' },
  { key: 'purple', label: 'Violet', cls: 'bg-purple-500' },
];

export default function EspacePersonnel() {
  const [user, setUser] = useState(null);
  const [pref, setPref] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.UserWorkspacePreference.list('-updated_date', 1),
    ]).then(([u, prefs]) => {
      setUser(u);
      const existing = prefs && prefs.length > 0 ? prefs[0] : null;
      if (existing) {
        setPref(existing);
      } else {
        setPref({
          verset: '',
          phrase_saison: '',
          accent_color: 'gold',
          default_agenda_view: 'list',
          display_density: 'comfortable',
          visible_widgets: WIDGETS.filter(w => w.default).map(w => w.key),
          notif_email: true,
          notif_presence_reminder: true,
          notif_training_reminder: true,
          notif_reading_reminder: false,
        });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const update = (field, value) => {
    setPref(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const toggleWidget = (key) => {
    const widgets = pref.visible_widgets || [];
    update('visible_widgets', widgets.includes(key) ? widgets.filter(w => w !== key) : [...widgets, key]);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (pref.id) {
        await base44.entities.UserWorkspacePreference.update(pref.id, pref);
      } else {
        const created = await base44.entities.UserWorkspacePreference.create(pref);
        setPref(created);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { /* bubble */ }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-border border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <PageHeader
        title="Mon espace personnel"
        intention="Personnalise ton bureau STAR."
        breadcrumbs={[{ label: 'Accueil', to: '/app' }, { label: 'Espace personnel' }]}
        actions={
          <button onClick={save} disabled={saving}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${saved ? 'bg-success text-white' : 'bg-secondary text-white hover:bg-secondary/90'} disabled:opacity-50`}>
            {saved ? <><Check className="w-4 h-4" /> Enregistré</> : <><Save className="w-4 h-4" /> {saving ? '...' : 'Enregistrer'}</>}
          </button>
        }
      />

      <div className="space-y-4">
        {/* Profil visuel */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-secondary" />
            <h3 className="text-sm font-semibold text-foreground">Profil visuel</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Verset personnel</label>
              <input value={pref.verset || ''} onChange={e => update('verset', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm" placeholder="Ton verset préféré..." />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phrase de saison</label>
              <input value={pref.phrase_saison || ''} onChange={e => update('phrase_saison', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm" placeholder="Ce que Dieu te dit pour cette saison..." />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1.5"><Palette className="w-3 h-3" /> Couleur d'accent</label>
              <div className="flex gap-2">
                {ACCENTS.map(a => (
                  <button key={a.key} onClick={() => update('accent_color', a.key)}
                    className={`w-9 h-9 rounded-full ${a.cls} transition-all ${pref.accent_color === a.key ? 'ring-2 ring-offset-2 ring-foreground/20 scale-110' : 'opacity-60 hover:opacity-100'}`}
                    title={a.label} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Widgets */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Layout className="w-4 h-4 text-secondary" />
            <h3 className="text-sm font-semibold text-foreground">Widgets affichés sur l'accueil</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {WIDGETS.map(w => {
              const visible = (pref.visible_widgets || []).includes(w.key);
              return (
                <button key={w.key} onClick={() => toggleWidget(w.key)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${visible ? 'bg-secondary/10 border-secondary/20 text-foreground' : 'bg-surface border-border text-muted-foreground'}`}>
                  <span className="text-base">{w.icon}</span>
                  <span className="flex-1 text-left">{w.label}</span>
                  {visible && <Check className="w-3.5 h-3.5 text-secondary" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Préférences */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4 text-secondary" />
            <h3 className="text-sm font-semibold text-foreground">Préférences</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Vue agenda par défaut</label>
              <select value={pref.default_agenda_view} onChange={e => update('default_agenda_view', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm">
                <option value="list">Liste</option>
                <option value="day">Jour</option>
                <option value="week">Semaine</option>
                <option value="month">Mois</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Densité d'affichage</label>
              <div className="grid grid-cols-2 gap-2">
                {['compact', 'comfortable'].map(d => (
                  <button key={d} onClick={() => update('display_density', d)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${pref.display_density === d ? 'bg-secondary/10 border-secondary/20 text-secondary' : 'bg-surface border-border text-muted-foreground'}`}>
                    {d === 'compact' ? 'Compact' : 'Confortable'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Notifications</h3>
          <div className="space-y-3">
            {[
              { key: 'notif_email', label: 'Notifications par email' },
              { key: 'notif_presence_reminder', label: 'Rappels de présence' },
              { key: 'notif_training_reminder', label: 'Rappels de formation' },
              { key: 'notif_reading_reminder', label: 'Rappel lecture quotidienne' },
            ].map(n => (
              <label key={n.key} className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-foreground">{n.label}</span>
                <button onClick={() => update(n.key, !pref[n.key])}
                  className={`w-10 h-5 rounded-full transition-colors relative ${pref[n.key] ? 'bg-secondary' : 'bg-border'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${pref[n.key] ? 'left-5' : 'left-0.5'}`} />
                </button>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Confidentialité */}
      <Link to="/app/espace-personnel/confidentialite" className="flex items-center gap-3 mt-4 bg-card border border-border rounded-2xl p-4 hover:shadow-sm transition-all">
        <div className="w-9 h-9 rounded-xl bg-slate-500/10 border border-slate-400/20 flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-slate-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Confidentialité & RGPD</p>
          <p className="text-xs text-muted-foreground">Gérez vos consentements et vos droits sur vos données</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </Link>

      <button onClick={save} disabled={saving}
        className={`w-full mt-6 py-3 rounded-xl text-sm font-semibold transition-colors ${saved ? 'bg-success text-white' : 'bg-secondary text-white hover:bg-secondary/90'} disabled:opacity-50`}>
        {saved ? '✓ Préférences enregistrées' : saving ? 'Enregistrement...' : 'Enregistrer mes préférences'}
      </button>
    </div>
  );
}