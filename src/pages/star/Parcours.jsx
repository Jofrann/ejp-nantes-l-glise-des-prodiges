import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Map, GraduationCap, Briefcase, Search, Wrench, Clock, Save, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SITUATIONS = [
  { key: 'etudiant', label: 'Étudiant' },
  { key: 'alternant', label: 'Alternant' },
  { key: 'travailleur', label: 'Travailleur' },
  { key: 'recherche_emploi', label: 'En recherche d\'emploi' },
  { key: 'recherche_stage', label: 'En recherche de stage' },
  { key: 'transition', label: 'En transition' },
  { key: 'autre', label: 'Autre' },
];

export default function Parcours() {
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [openSection, setOpenSection] = useState('situation');

  useEffect(() => {
    base44.entities.ServantJourney.list('-updated_date', 1)
      .then(data => {
        setJourney(data && data.length > 0 ? data[0] : {});
        setLoading(false);
      })
      .catch(() => { setJourney({}); setLoading(false); });
  }, []);

  const update = (field, value) => {
    setJourney(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (journey.id) {
        await base44.entities.ServantJourney.update(journey.id, journey);
      } else {
        const created = await base44.entities.ServantJourney.create(journey);
        setJourney(created);
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

  const sections = [
    { key: 'situation', label: 'Situation actuelle', icon: Map },
    { key: 'etudes', label: 'Études', icon: GraduationCap },
    { key: 'travail', label: 'Travail', icon: Briefcase },
    { key: 'recherche', label: 'Recherche', icon: Search },
    { key: 'competences', label: 'Compétences', icon: Wrench },
    { key: 'disponibilites', label: 'Disponibilités', icon: Clock },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-heading font-bold text-foreground mb-1">Mon parcours</h1>
          <p className="text-sm text-muted-foreground">Renseigne ta saison de vie pour mieux être accompagné.</p>
        </div>
        <button onClick={save} disabled={saving}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${saved ? 'bg-success text-white' : 'bg-secondary text-white hover:bg-secondary/90'} disabled:opacity-50`}>
          {saved ? <><Check className="w-4 h-4" /> Enregistré</> : <><Save className="w-4 h-4" /> {saving ? '...' : 'Enregistrer'}</>}
        </button>
      </motion.div>

      <div className="space-y-2">
        {/* Situation */}
        <Section title="Situation actuelle" icon={Map} isOpen={openSection === 'situation'} onToggle={() => setOpenSection(openSection === 'situation' ? null : 'situation')}>
          <div className="grid grid-cols-2 gap-2">
            {SITUATIONS.map(s => (
              <button key={s.key} onClick={() => update('current_status', s.key)}
                className={`px-3 py-2.5 rounded-lg text-xs font-medium border transition-all ${journey.current_status === s.key ? 'bg-secondary/10 border-secondary/30 text-secondary' : 'bg-surface border-border text-muted-foreground hover:border-secondary/20'}`}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Ville</label>
            <input value={journey.city || ''} onChange={e => update('city', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm" placeholder="Ta ville" />
          </div>
          <div className="mt-3">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Résumé</label>
            <textarea value={journey.summary || ''} onChange={e => update('summary', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm" rows={2} placeholder="Décris ta situation en une phrase..." />
          </div>
        </Section>

        {/* Études */}
        <Section title="Études" icon={GraduationCap} isOpen={openSection === 'etudes'} onToggle={() => setOpenSection(openSection === 'etudes' ? null : 'etudes')}>
          <div className="space-y-3">
            <Field label="Établissement" value={journey.education_school} onChange={v => update('education_school', v)} placeholder="Nom de l'école" />
            <Field label="Formation" value={journey.education_program} onChange={v => update('education_program', v)} placeholder="Type de formation" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Niveau" value={journey.education_level} onChange={v => update('education_level', v)} placeholder="Ex: L3, M1..." />
              <Field label="Année" value={journey.education_year} onChange={v => update('education_year', v)} placeholder="2025" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={journey.education_needs_internship || false} onChange={e => update('education_needs_internship', e.target.checked)}
                className="w-4 h-4 rounded border-input accent-secondary" />
              <span className="text-xs text-foreground">Je recherche un stage</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={journey.education_support_needed || false} onChange={e => update('education_support_needed', e.target.checked)}
                className="w-4 h-4 rounded border-input accent-secondary" />
              <span className="text-xs text-foreground">J'ai besoin d'accompagnement académique</span>
            </label>
          </div>
        </Section>

        {/* Travail */}
        <Section title="Travail" icon={Briefcase} isOpen={openSection === 'travail'} onToggle={() => setOpenSection(openSection === 'travail' ? null : 'travail')}>
          <div className="space-y-3">
            <Field label="Domaine" value={journey.work_field} onChange={v => update('work_field', v)} placeholder="Ex: Informatique, Santé..." />
            <Field label="Métier" value={journey.work_job_title} onChange={v => update('work_job_title', v)} placeholder="Ton poste" />
            <Field label="Entreprise (optionnel)" value={journey.work_company} onChange={v => update('work_company', v)} placeholder="Nom de l'entreprise" />
            <Field label="Rythme / type de contrat" value={journey.work_schedule_type} onChange={v => update('work_schedule_type', v)} placeholder="Ex: Temps plein, 35h..." />
          </div>
        </Section>

        {/* Recherche */}
        <Section title="Recherche" icon={Search} isOpen={openSection === 'recherche'} onToggle={() => setOpenSection(openSection === 'recherche' ? null : 'recherche')}>
          <div className="space-y-3">
            <Field label="Type de recherche" value={journey.search_type} onChange={v => update('search_type', v)} placeholder="Stage, alternance, emploi..." />
            <Field label="Domaine visé" value={journey.search_field} onChange={v => update('search_field', v)} placeholder="Domaine recherché" />
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Échéance</label>
              <input type="date" value={journey.search_deadline || ''} onChange={e => update('search_deadline', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm" />
            </div>
          </div>
        </Section>

        {/* Compétences */}
        <Section title="Compétences" icon={Wrench} isOpen={openSection === 'competences'} onToggle={() => setOpenSection(openSection === 'competences' ? null : 'competences')}>
          <p className="text-xs text-muted-foreground mb-3">Liste tes compétences. Tu peux indiquer si tu souhaites servir avec.</p>
          <div className="space-y-2">
            {(journey.skills || []).map((skill, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input value={skill.name || ''} onChange={e => { const skills = [...(journey.skills || [])]; skills[idx] = { ...skill, name: e.target.value }; update('skills', skills); }}
                  className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" placeholder="Compétence" />
                <input value={skill.level || ''} onChange={e => { const skills = [...(journey.skills || [])]; skills[idx] = { ...skill, level: e.target.value }; update('skills', skills); }}
                  className="w-24 px-3 py-2 rounded-lg border border-input bg-background text-sm" placeholder="Niveau" />
                <button onClick={() => { const skills = (journey.skills || []).filter((_, i) => i !== idx); update('skills', skills); }}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">✕</button>
              </div>
            ))}
            <button onClick={() => update('skills', [...(journey.skills || []), { name: '', level: '', willing_to_serve: false }])}
              className="w-full py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-secondary/30 hover:text-secondary transition-colors">
              + Ajouter une compétence
            </button>
          </div>
        </Section>

        {/* Disponibilités */}
        <Section title="Disponibilités" icon={Clock} isOpen={openSection === 'disponibilites'} onToggle={() => setOpenSection(openSection === 'disponibilites' ? null : 'disponibilites')}>
          <div className="space-y-3">
            <Field label="Jours disponibles" value={journey.availability_days} onChange={v => update('availability_days', v)} placeholder="Ex: Sam, Dim" />
            <Field label="Soirées disponibles" value={journey.availability_evenings} onChange={v => update('availability_evenings', v)} placeholder="Ex: Jeudi, Vendredi" />
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Contraintes</label>
              <textarea value={journey.availability_constraints || ''} onChange={e => update('availability_constraints', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm" rows={2} placeholder="Tes contraintes horaires..." />
            </div>
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input type="checkbox" checked={journey.support_needed || false} onChange={e => update('support_needed', e.target.checked)}
                className="w-4 h-4 rounded border-input accent-secondary" />
              <span className="text-xs text-foreground">Je souhaite être contacté pour un accompagnement</span>
            </label>
            {journey.support_needed && (
              <Field label="Type d'accompagnement" value={journey.support_type} onChange={v => update('support_type', v)} placeholder="Ex: Orientation, CV, méthode..." />
            )}
          </div>
        </Section>
      </div>

      <button onClick={save} disabled={saving}
        className={`w-full mt-6 py-3 rounded-xl text-sm font-semibold transition-colors ${saved ? 'bg-success text-white' : 'bg-secondary text-white hover:bg-secondary/90'} disabled:opacity-50`}>
        {saved ? '✓ Parcours enregistré' : saving ? 'Enregistrement...' : 'Enregistrer mon parcours'}
      </button>
    </div>
  );
}

function Section({ title, icon: Icon, isOpen, onToggle, children }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center">
            <Icon className="w-4 h-4 text-secondary" />
          </div>
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      <input value={value || ''} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm" placeholder={placeholder} />
    </div>
  );
}