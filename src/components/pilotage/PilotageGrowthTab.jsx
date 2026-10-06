import React from 'react';
import { GraduationCap, Target, TrendingUp } from 'lucide-react';

export default function PilotageGrowthTab({ data }) {
  const { growth } = data;
  const { active_formations = 0, active_objectives = 0 } = growth || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card border border-border rounded-2xl p-5">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-3">
            <GraduationCap className="w-5 h-5 text-secondary" />
          </div>
          <p className="text-2xl font-heading font-bold text-foreground">{active_formations}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Formations actives</p>
        </div>
        <div className="glass-card border border-border rounded-2xl p-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-heading font-bold text-foreground">{active_objectives}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Objectifs actifs</p>
        </div>
      </div>

      <div className="glass-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Progression collective</p>
            <p className="text-xs text-muted-foreground">Synthèse de la croissance spirituelle et du service</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Les détails individuels (notes, difficultés, parcours personnel) restent dans l'espace personnel de chaque serviteur.
          Pilotage affiche uniquement des indicateurs collectifs non sensibles.
        </p>
      </div>

      {active_formations === 0 && active_objectives === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">Pas encore suffisamment de données de croissance.</p>
        </div>
      )}
    </div>
  );
}