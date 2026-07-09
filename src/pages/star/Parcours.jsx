import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Map, GraduationCap, Briefcase, Search, Wrench, Clock, Heart } from 'lucide-react';

const SITUATIONS = [
  { key: 'etudiant', label: 'Étudiant' },
  { key: 'alternant', label: 'Alternant' },
  { key: 'travailleur', label: 'Travailleur' },
  { key: 'recherche_emploi', label: 'En recherche d\'emploi' },
  { key: 'recherche_stage', label: 'En recherche de stage' },
  { key: 'transition', label: 'En transition' },
  { key: 'autre', label: 'Autre' },
];

const SECTIONS = [
  { key: 'etudes', label: 'Études', icon: GraduationCap, fields: ['Établissement', 'Formation', 'Niveau', 'Année', 'Ville'] },
  { key: 'travail', label: 'Travail', icon: Briefcase, fields: ['Domaine', 'Métier', 'Entreprise', 'Rythme'] },
  { key: 'recherche', label: 'Recherche', icon: Search, fields: ['Type de recherche', 'Domaine visé', 'Échéance'] },
  { key: 'competences', label: 'Compétences', icon: Wrench, fields: ['Compétence', 'Niveau', 'Souhait de servir avec'] },
  { key: 'disponibilites', label: 'Disponibilités', icon: Clock, fields: ['Jours disponibles', 'Soirées disponibles', 'Contraintes'] },
];

export default function Parcours() {
  const [situation, setSituation] = useState('');
  const [openSection, setOpenSection] = useState(null);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl font-heading font-bold text-foreground mb-1">Mon parcours</h1>
        <p className="text-sm text-muted-foreground">Renseigne ta saison de vie pour mieux être accompagné.</p>
      </motion.div>

      {/* Situation actuelle */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
            <Map className="w-5 h-5 text-cyan-600" />
          </div>
          <p className="text-sm font-semibold text-foreground">Situation actuelle</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {SITUATIONS.map(s => (
            <button key={s.key} onClick={() => setSituation(s.key)}
              className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                situation === s.key ? 'bg-cyan-500/10 text-cyan-600 border-cyan-400/30' : 'bg-surface text-muted-foreground border-border'
              }`}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-2">
        {SECTIONS.map(({ key, label, icon: Icon, fields }) => (
          <div key={key} className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setOpenSection(openSection === key ? null : key)}
              className="w-full flex items-center gap-3 p-4 hover:bg-surface/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-cyan-600" />
              </div>
              <span className="text-sm font-semibold text-foreground flex-1 text-left">{label}</span>
              <span className="text-xs text-muted-foreground">À remplir</span>
            </button>
            {openSection === key && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="px-4 pb-4">
                <div className="space-y-3 pt-2 border-t border-border">
                  {fields.map(f => (
                    <div key={f}>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">{f}</label>
                      <input placeholder={f}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-400/40" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Besoin d'accompagnement */}
      <div className="mt-6 bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="w-4 h-4 text-rose-600" />
          <p className="text-sm font-semibold text-foreground">Besoin d'accompagnement ?</p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          Vie académique, orientation, CV, entretien, organisation personnelle... Tu peux demander de l'aide.
        </p>
        <button className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 text-sm font-semibold py-2.5 rounded-xl transition-colors">
          Demander un accompagnement
        </button>
      </div>
    </div>
  );
}