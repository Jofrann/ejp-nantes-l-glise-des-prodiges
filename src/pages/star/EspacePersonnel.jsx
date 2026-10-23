import {useWorkspaceAppearance} from '@/components/star/WorkspaceAppearance';
import {APPEARANCE_DEFAULTS,APPEARANCE_ACCENTS,normalizeAppearance} from '@/lib/workspaceAppearance';
import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Settings, Save, Check, Palette, Layout, Star, Shield, ChevronRight, RotateCcw, Eye, ArrowUp, ArrowDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/star/PageHeader';

const WIDGETS = [
  { key: 'actions', label: 'Actions du jour', icon: '⚡', default: true },
  { key: 'agenda', label: 'Agenda court', icon: '📅', default: true },
  { key: 'rythme', label: 'Mon rythme STAR', icon: '📊', default: true },
  { key: 'formations', label: 'Mes formations', icon: '🎓', default: true },
  { key: 'croissance', label: 'Ma croissance', icon: '🌱', default: true },
  { key: 'ressources', label: 'Ressources utiles', icon: '📰', default: true },
  { key: 'responsabilites', label: 'Responsabilités actives', icon: '💼', default: true },
];

const ACCENTS = APPEARANCE_ACCENTS;

const SHORTCUTS = [
  { key: 'agenda', label: 'Agenda' },
  { key: 'presences', label: 'Présences' },
  { key: 'objectifs', label: 'Objectifs' },
  { key: 'rendez-vous', label: 'Rendez-vous' },
  { key: 'ressources', label: 'Ressources' },
];

const DEFAULT_VERSE = {
  text: "Chacun selon le don qu'il a reçu, employez-le à vous servir les uns des autres.",
  reference: "1 Pierre 4:10",
};

const DEFAULT_WIDGET_ORDER = WIDGETS.map(w => w.key);

export default function EspacePersonnel() {
  const [searchParams] = useSearchParams();
  const activeSection = searchParams.get('section') || 'all';
  const [user, setUser] = useState(null);
  const [pref, setPref] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadError,setLoadError] = useState('');
  const [saveError,setSaveError] = useState('');
  const appearance=useWorkspaceAppearance();
  const previewAppearance=appearance?.previewAppearance,clearPreview=appearance?.clearPreview;
  useEffect(()=>{if(pref && previewAppearance)previewAppearance(pref);},[pref,previewAppearance]);
  useEffect(()=>()=>clearPreview?.(),[clearPreview]);
  const previousAppearance=useRef(normalizeAppearance(appearance?.stored||{}));
  useEffect(()=>{if(!appearance?.stored)return;const next=normalizeAppearance(appearance.stored);
    const changed=Object.fromEntries(Object.entries(next).filter(([key,value])=>previousAppearance.current[key]!==value));previousAppearance.current=next;
    setPref(prev=>prev?{...prev,...(appearance.stored.id?{id:appearance.stored.id}:{}),...changed}:prev);
  },[appearance?.stored]);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.personal['UserWorkspacePreference'].list('-updated_date', 1),
    ]).then(([u, prefs]) => {
      setUser(u);
      const existing = prefs && prefs.length > 0 ? prefs[0] : null;
      if (existing) {
        setPref({...APPEARANCE_DEFAULTS,...existing});
      } else {
        setPref({
          personal_verse_text: '',
          personal_verse_reference: '',
          season_phrase: '',
          ...APPEARANCE_DEFAULTS,
          default_agenda_view: 'list',
          display_density: 'comfortable',
          visible_widgets: WIDGETS.filter(w => w.default).map(w => w.key),
          widget_order: DEFAULT_WIDGET_ORDER,
          favorite_shortcuts: [],
          show_right_panel: true,
          notif_email: true,
          notif_presence_reminder: true,
          notif_training_reminder: true,
          notif_reading_reminder: false,
        });
      }
      setLoading(false);
    }).catch(() => {setLoadError('Ton espace personnel ne peut pas être chargé. Recharge la page pour réessayer.');setLoading(false);});
  }, []);

  const update = (field, value) => {
    setPref(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const toggleWidget = (key) => {
    const widgets = pref.visible_widgets || [];
    update('visible_widgets', widgets.includes(key) ? widgets.filter(w => w !== key) : [...widgets, key]);
  };

  const moveWidget = (index, direction) => {
    const order = [...(pref.widget_order || DEFAULT_WIDGET_ORDER)];
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target], order[index]];
    update('widget_order', order);
  };

  const toggleShortcut = (key) => {
    const shortcuts = pref.favorite_shortcuts || [];
    update('favorite_shortcuts', shortcuts.includes(key) ? shortcuts.filter(s => s !== key) : [...shortcuts, key]);
  };

  const resetVerse = () => {
    update('personal_verse_text', '');
    update('personal_verse_reference', '');
  };

  const resetWidgets = () => {
    update('visible_widgets', WIDGETS.filter(w => w.default).map(w => w.key));
    update('widget_order', DEFAULT_WIDGET_ORDER);
  };

  const save = async () => {
    setSaving(true); setSaveError('');
    try {
      const result = pref.id ? await base44.personal['UserWorkspacePreference'].update(pref.id,pref) : await base44.personal['UserWorkspacePreference'].create(pref);
      setPref(result);
      appearance?.commitPreferences(result);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {setSaveError(e.message || 'Tes préférences n’ont pas été enregistrées. Réessaie.');}
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-border border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  if(loadError || !pref)return <div role="alert" className="p-6">{loadError || 'Préférences indisponibles.'}</div>;
  const showSection = (section) => activeSection === 'all' || activeSection === section;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <PageHeader
        title="Mon espace personnel"
        intention="Personnalise ton bureau STAR."
        breadcrumbs={[{ label: 'Accueil', to: '/app' }, { label: 'Espace personnel' }]}
        actions={
          <button onClick={save} disabled={saving}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${saved ? 'bg-success text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'} disabled:opacity-50`}>
            {saved ? <><Check className="w-4 h-4" /> Enregistré</> : <><Save className="w-4 h-4" /> {saving ? '...' : 'Enregistrer'}</>}
          </button>
        }
      />

      {saveError && <p role="alert" className="private-load-error">{saveError}</p>}
      <div className="space-y-4">
        {/* Verset & phrase personnelle */}
        {showSection('verset') && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-secondary" />
              <h3 className="text-sm font-semibold text-foreground">Verset & phrase personnelle</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Texte du verset</label>
                <textarea value={pref.personal_verse_text || ''} onChange={e => update('personal_verse_text', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm min-h-[70px] resize-none"
                  placeholder={DEFAULT_VERSE.text} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Référence</label>
                <input value={pref.personal_verse_reference || ''} onChange={e => update('personal_verse_reference', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm"
                  placeholder={DEFAULT_VERSE.reference} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phrase de saison</label>
                <input value={pref.season_phrase || ''} onChange={e => update('season_phrase', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm"
                  placeholder="Ce que Dieu te dit pour cette saison..." />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={resetVerse}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-surface border border-border rounded-lg px-3 py-2 hover:border-secondary/30 transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" /> Réinitialiser au verset par défaut
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground/70 italic">Le verset personnel est privé par défaut. Si vide, le verset par défaut (1 Pierre 4:10) s'affiche sur ton bureau.</p>
            </div>
          </div>
        )}

        {/* Apparence */}
        {showSection('apparence') && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4 text-secondary" />
              <h3 className="text-sm font-semibold text-foreground">Apparence</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">L’aperçu s’applique immédiatement. Enregistre pour conserver tes choix sur ton compte ; quitter sans enregistrer annule l’aperçu.</p>
            <div className="space-y-4">
              <fieldset><legend className="text-xs font-medium mb-2">Thème</legend><div className="appearance-options">{[['light','Clair'],['dark','Sombre'],['system','Système']].map(([value,label])=><button key={value} aria-pressed={pref.appearance_mode===value} onClick={()=>update('appearance_mode',value)}>{label}</button>)}</div></fieldset>
              <button className="appearance-motion" role="switch" aria-label="Réduire les animations" aria-checked={pref.reduce_motion===true} onClick={()=>update('reduce_motion',!pref.reduce_motion)}><span><b>Réduire les animations</b><small>Les animations restent actives par défaut.</small></span><span>{pref.reduce_motion?'Activé':'Désactivé'}</span></button>
              <div>
                <span className="text-xs font-medium text-muted-foreground mb-1.5 block">Couleur d'accent</span>
                <div className="flex gap-2 flex-wrap">
                  {ACCENTS.map(a => (
                    <button key={a.key} onClick={() => update('accent_color', a.key)}
                      style={{backgroundColor:a.swatch}} aria-label={a.label} aria-pressed={pref.accent_color===a.key}
                      className={`w-11 h-11 rounded-full transition-all ${pref.accent_color === a.key ? 'ring-2 ring-offset-2 ring-foreground/20 scale-110' : 'opacity-60 hover:opacity-100'}`}
                      title={a.label}>{pref.accent_color===a.key && <Check aria-hidden="true" className="w-4 h-4 text-white mx-auto"/>}</button>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground mb-1.5 block">Densité d'affichage</span>
                <div className="grid grid-cols-2 gap-2">
                  {['compact', 'comfortable'].map(d => (
                    <button key={d} aria-pressed={pref.display_density===d} onClick={() => update('display_density', d)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${pref.display_density === d ? 'bg-secondary/10 border-secondary/20 text-secondary' : 'bg-surface border-border text-muted-foreground'}`}>
                      {d === 'compact' ? 'Compact' : 'Confortable'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="appearance-agenda-view" className="text-xs font-medium text-muted-foreground mb-1.5 block">Vue agenda par défaut</label>
                <select id="appearance-agenda-view" value={pref.default_agenda_view} onChange={e => update('default_agenda_view', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm">
                  <option value="list">Liste</option>
                  <option value="day">Jour</option>
                  <option value="week">Semaine</option>
                  <option value="month">Mois</option>
                </select>
              </div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-foreground flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Afficher la colonne contextuelle (desktop)</span>
                <button role="switch" aria-label="Afficher la colonne contextuelle" aria-checked={pref.show_right_panel !== false} onClick={() => update('show_right_panel', pref.show_right_panel !== false ? false : true)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${pref.show_right_panel !== false ? 'bg-secondary' : 'bg-border'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${pref.show_right_panel !== false ? 'left-5' : 'left-0.5'}`} />
                </button>
              </label>
            </div>
          </div>
        )}

        {/* Widgets */}
        {showSection('widgets') && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-secondary" />
                <h3 className="text-sm font-semibold text-foreground">Widgets affichés sur l'accueil</h3>
              </div>
              <button onClick={resetWidgets} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                <RotateCcw className="w-3 h-3" /> Réinitialiser
              </button>
            </div>
            <div className="space-y-1.5">
              {(pref.widget_order || DEFAULT_WIDGET_ORDER).map((key, index) => {
                const widget = WIDGETS.find(w => w.key === key);
                if (!widget) return null;
                const visible = (pref.visible_widgets || []).includes(key);
                return (
                  <div key={key} className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${visible ? 'bg-secondary/5 border-secondary/20' : 'bg-surface border-border'}`}>
                    <div className="flex flex-col">
                      <button onClick={() => moveWidget(index, -1)} disabled={index === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button onClick={() => moveWidget(index, 1)} disabled={index === (pref.widget_order || DEFAULT_WIDGET_ORDER).length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-base">{widget.icon}</span>
                    <span className="flex-1 text-xs font-medium text-foreground">{widget.label}</span>
                    <button onClick={() => toggleWidget(key)}
                      className={`w-9 h-5 rounded-full transition-colors relative ${visible ? 'bg-secondary' : 'bg-border'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${visible ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Raccourcis favoris */}
        {showSection('raccourcis') && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-secondary" />
              <h3 className="text-sm font-semibold text-foreground">Raccourcis favoris</h3>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">Choisis les raccourcis affichés dans la colonne contextuelle de ton bureau.</p>
            <div className="grid grid-cols-2 gap-2">
              {SHORTCUTS.map(s => {
                const active = (pref.favorite_shortcuts || []).includes(s.key);
                return (
                  <button key={s.key} onClick={() => toggleShortcut(s.key)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${active ? 'bg-secondary/10 border-secondary/20 text-foreground' : 'bg-surface border-border text-muted-foreground'}`}>
                    <span className="flex-1 text-left">{s.label}</span>
                    {active && <Check className="w-3.5 h-3.5 text-secondary" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Notifications */}
        {showSection('notifications') && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-secondary" />
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            </div>
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
        )}
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
        className={`w-full mt-6 py-3 rounded-xl text-sm font-semibold transition-colors ${saved ? 'bg-success text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'} disabled:opacity-50`}>
        {saved ? '✓ Préférences enregistrées' : saving ? 'Enregistrement...' : 'Enregistrer mes préférences'}
      </button>
    </div>
  );
}