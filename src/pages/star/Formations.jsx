import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GraduationCap, ChevronRight, PlayCircle, Clock, CheckCircle, Loader2, BookOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/star/PageHeader';

const CATEGORY_STYLES = {
  pcnc: { label: 'PCNC', color: 'indigo' },
  serviteur: { label: 'Serviteur', color: 'emerald' },
  pilote_fij: { label: 'Pilote FIJ', color: 'amber' },
  accueil: { label: 'Accueil', color: 'cyan' },
  communication: { label: 'Communication', color: 'purple' },
  musique: { label: 'Musique', color: 'rose' },
  coordination: { label: 'Coordination', color: 'blue' },
  autre: { label: 'Autre', color: 'slate' },
};

export default function Formations() {
  const [programs, setPrograms] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.TrainingProgram.filter({ status: 'published' }, 'display_order', 50),
      base44.entities.TrainingSubmission.list('-updated_date', 200),
    ]).then(([progs, subs]) => {
      setPrograms(progs || []);
      setSubmissions(subs || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const getProgress = (programId) => {
    const progSubs = submissions.filter(s => s.program_id === programId);
    if (progSubs.length === 0) return { percent: 0, status: 'not_started', validated: 0, total: 0 };
    const validated = progSubs.filter(s => s.status === 'validated').length;
    const inProgress = progSubs.filter(s => ['in_progress', 'submitted', 'correction'].includes(s.status)).length;
    const percent = Math.round((validated / Math.max(progSubs.length, 1)) * 100);
    let status = 'not_started';
    if (validated === progSubs.length && validated > 0) status = 'done';
    else if (inProgress > 0 || validated > 0) status = 'in_progress';
    return { percent, status, validated, total: progSubs.length };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-secondary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <PageHeader
        title="Mes formations"
        intention="Parcours PCNC, modules, vidéos, résumés et validations."
        breadcrumbs={[{ label: 'Accueil', to: '/app' }, { label: 'Formation' }]}
      />

      {programs.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <GraduationCap className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucune formation disponible pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {programs.map((prog, i) => {
            const cat = CATEGORY_STYLES[prog.category] || CATEGORY_STYLES.autre;
            const progress = getProgress(prog.id);
            return (
              <motion.div key={prog.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <Link to={`/app/formations/${prog.id}`} className="block bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-${cat.color}-500/10 border border-${cat.color}-400/20 flex items-center justify-center flex-shrink-0`}>
                      <GraduationCap className={`w-5 h-5 text-${cat.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{prog.title}</p>
                        <span className={`text-[10px] text-${cat.color}-600 bg-${cat.color}-500/10 px-1.5 py-0.5 rounded-full`}>{cat.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{prog.description || 'Aucune description'}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {progress.status === 'done' ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-success">
                          <CheckCircle className="w-3.5 h-3.5" /> Validé
                        </span>
                      ) : progress.status === 'in_progress' ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-warning">
                          <Clock className="w-3.5 h-3.5" /> {progress.percent}%
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          <PlayCircle className="w-3.5 h-3.5" /> Commencer
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                  {progress.total > 0 && (
                    <div className="mt-3">
                      <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                        <div className={`h-full bg-${cat.color}-500 rounded-full transition-all`} style={{ width: `${progress.percent}%` }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{progress.validated}/{progress.total} modules validés</p>
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="mt-6 bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Comment ça marche ?</p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Chaque formation contient des modules avec vidéos et documents.
          Après visionnage, rédige un résumé. Un formateur le valide avant de passer au module suivant.
        </p>
      </div>
    </div>
  );
}