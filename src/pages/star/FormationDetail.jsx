import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, GraduationCap, PlayCircle, FileText, CheckCircle, Clock,
  Loader2, Send, Video, ChevronRight, AlertCircle
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/star/PageHeader';

const STATUS_CONFIG = {
  not_started: { label: 'Non commencé', color: 'muted', icon: PlayCircle },
  in_progress: { label: 'En cours', color: 'blue', icon: Clock },
  submitted: { label: 'En attente de validation', color: 'amber', icon: Clock },
  validated: { label: 'Validé', color: 'green', icon: CheckCircle },
  rejected: { label: 'Refusé', color: 'red', icon: AlertCircle },
  correction: { label: 'À corriger', color: 'orange', icon: AlertCircle },
};

export default function FormationDetail() {
  const { formationId } = useParams();
  const [program, setProgram] = useState(null);
  const [modules, setModules] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState(null);
  const [summary, setSummary] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.TrainingProgram.get(formationId),
      base44.entities.TrainingModule.filter({ program_id: formationId }, 'module_order', 50),
      base44.entities.TrainingSubmission.filter({ program_id: formationId }, '-updated_date', 100),
    ]).then(([prog, mods, subs]) => {
      setProgram(prog);
      setModules(mods || []);
      setSubmissions(subs || []);
      if (mods?.length > 0) setActiveModule(mods[0]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [formationId]);

  const getSubmission = (moduleId) => submissions.find(s => s.module_id === moduleId);

  const handleSelectModule = (mod) => {
    setActiveModule(mod);
    const sub = getSubmission(mod.id);
    setSummary(sub?.summary_text || '');
  };

  const handleSubmitSummary = async () => {
    if (!activeModule || !summary.trim()) return;
    setSaving(true);
    try {
      const existing = getSubmission(activeModule.id);
      const payload = {
        program_id: formationId,
        program_title: program.title,
        module_id: activeModule.id,
        module_title: activeModule.title,
        status: 'submitted',
        summary_text: summary,
        submitted_at: new Date().toISOString(),
      };
      let result;
      if (existing?.id) {
        result = await base44.entities.TrainingSubmission.update(existing.id, payload);
      } else {
        result = await base44.entities.TrainingSubmission.create(payload);
      }
      setSubmissions(prev => {
        const filtered = prev.filter(s => s.module_id !== activeModule.id);
        return [...filtered, result];
      });
    } catch (e) {
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-secondary animate-spin" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <p className="text-sm text-muted-foreground">Formation introuvable.</p>
        <Link to="/app/formations" className="text-secondary text-sm mt-2 inline-block">← Retour</Link>
      </div>
    );
  }

  const currentSub = activeModule ? getSubmission(activeModule.id) : null;
  const currentStatus = currentSub?.status || 'not_started';
  const statusConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.not_started;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Link to="/app/formations" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="w-3.5 h-3.5" /> Retour aux formations
      </Link>

      <PageHeader
        title={program.title}
        intention={program.description || ''}
        breadcrumbs={[{ label: 'Accueil', to: '/app' }, { label: 'Formations', to: '/app/formations' }, { label: program.title }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Modules list */}
        <div className="lg:col-span-1 space-y-2">
          <h3 className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Modules</h3>
          {modules.length === 0 ? (
            <p className="text-xs text-muted-foreground">Aucun module.</p>
          ) : (
            modules.map((mod, i) => {
              const sub = getSubmission(mod.id);
              const st = sub?.status || 'not_started';
              const stConf = STATUS_CONFIG[st] || STATUS_CONFIG.not_started;
              const isActive = activeModule?.id === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => handleSelectModule(mod)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    isActive ? 'bg-indigo-500/5 border-indigo-400/30' : 'bg-card border-border hover:border-indigo-400/20'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                    st === 'validated' ? 'bg-green-500/10 text-green-600' :
                    st === 'submitted' || st === 'correction' ? 'bg-amber-500/10 text-amber-600' :
                    'bg-surface text-muted-foreground'
                  }`}>
                    {st === 'validated' ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{mod.title}</p>
                    <p className="text-[10px] text-muted-foreground">{stConf.label}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Module detail */}
        <div className="lg:col-span-2">
          {activeModule ? (
            <motion.div key={activeModule.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-${statusConfig.color}-500/10 text-${statusConfig.color}-600`}>
                    <statusConfig.icon className="w-3 h-3" /> {statusConfig.label}
                  </span>
                  {activeModule.duration_minutes && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {activeModule.duration_minutes} min
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-heading font-bold text-foreground mb-2">{activeModule.title}</h2>
                {activeModule.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{activeModule.description}</p>
                )}

                {/* Video */}
                {activeModule.video_url && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Video className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-semibold text-foreground">Vidéo du module</span>
                    </div>
                    <video
                      src={activeModule.video_url}
                      controls
                      className="w-full rounded-xl border border-border"
                      poster={activeModule.thumbnail_url}
                    />
                  </div>
                )}

                {/* Document */}
                {activeModule.document_url && (
                  <a
                    href={activeModule.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-indigo-500/5 border border-indigo-400/20 rounded-xl p-3 hover:bg-indigo-500/10 transition-all mb-4"
                  >
                    <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span className="text-xs font-medium text-indigo-600 flex-1">Ouvrir le document PDF</span>
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-600" />
                  </a>
                )}

                {/* Summary form */}
                {activeModule.requires_summary && (
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-secondary" />
                      <span className="text-xs font-semibold text-foreground">Mon résumé</span>
                      {activeModule.requires_summary && (
                        <span className="text-[10px] text-muted-foreground">(obligatoire)</span>
                      )}
                    </div>

                    {currentSub?.review_comment && (
                      <div className="bg-amber-500/5 border border-amber-400/20 rounded-xl p-3 mb-3">
                        <p className="text-[10px] font-semibold text-amber-600 mb-1">Commentaire du formateur :</p>
                        <p className="text-xs text-foreground/80">{currentSub.review_comment}</p>
                      </div>
                    )}

                    <textarea
                      value={summary}
                      onChange={e => setSummary(e.target.value)}
                      rows={5}
                      placeholder="Rédige ici ton résumé du module…"
                      className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-indigo-400/40 resize-none"
                      disabled={currentStatus === 'validated'}
                    />

                    {currentStatus !== 'validated' && (
                      <button
                        onClick={handleSubmitSummary}
                        disabled={saving || !summary.trim()}
                        className="flex items-center gap-2 mt-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        {currentStatus === 'submitted' ? 'Mettre à jour' : 'Soumettre pour validation'}
                      </button>
                    )}

                    {currentStatus === 'validated' && (
                      <div className="flex items-center gap-2 mt-3 text-xs text-success">
                        <CheckCircle className="w-4 h-4" /> Résumé validé par le formateur
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <GraduationCap className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Sélectionne un module pour commencer.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}