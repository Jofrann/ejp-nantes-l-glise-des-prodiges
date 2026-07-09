import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GraduationCap, ChevronRight, PlayCircle, FileText, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const PCNC_PROGRAMS = [
  { id: 'pcnc001', title: 'PCNC 001', desc: 'Fondations du parcours', progress: 0, status: 'recommended' },
  { id: 'pcnc101', title: 'PCNC 101', desc: 'Approfondissement', progress: 0, status: 'recommended' },
  { id: 'pcnc201', title: 'PCNC 201', desc: 'Maturation', progress: 0, status: 'recommended' },
  { id: 'serviteur', title: 'Formation Serviteur', desc: 'Bases du service', progress: 0, status: 'recommended' },
  { id: 'accueil', title: 'Formation Accueil', desc: "Service d'accueil", progress: 0, status: 'recommended' },
  { id: 'communication', title: 'Formation Communication', desc: 'Médias et publications', progress: 0, status: 'recommended' },
  { id: 'musique', title: 'Formation Musique', desc: 'Louange et technique', progress: 0, status: 'recommended' },
  { id: 'coordination', title: 'Formation Coordination', desc: "Gestion d'équipe", progress: 0, status: 'restricted' },
  { id: 'fij_pilot', title: 'Formation Pilote FIJ', desc: 'Gestion d\'une FIJ', progress: 0, status: 'restricted' },
];

export default function Formations() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-border border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl font-heading font-bold text-foreground mb-1">Mes formations</h1>
        <p className="text-sm text-muted-foreground">Parcours PCNC, modules, résumés et validations.</p>
      </motion.div>

      <div className="space-y-3">
        {PCNC_PROGRAMS.map((prog, i) => (
          <motion.div key={prog.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{prog.title}</p>
                  <p className="text-xs text-muted-foreground">{prog.desc}</p>
                </div>
                {prog.status === 'restricted' && (
                  <span className="text-[10px] text-muted-foreground bg-surface px-2 py-0.5 rounded-full">Sur accès</span>
                )}
              </div>
              {prog.progress > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-medium text-foreground">{prog.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${prog.progress}%` }} />
                  </div>
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <button className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 text-xs font-semibold py-2 rounded-lg transition-colors">
                  <PlayCircle className="w-3.5 h-3.5" /> Commencer
                </button>
                <button className="flex items-center justify-center gap-1.5 bg-surface hover:bg-muted text-muted-foreground text-xs font-medium py-2 px-3 rounded-lg transition-colors">
                  <FileText className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Comment ça marche ?</p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Chaque formation contient des vidéos à regarder et un résumé à rédiger.
          Un formateur valide ensuite ton module avant de passer au suivant.
        </p>
      </div>
    </div>
  );
}