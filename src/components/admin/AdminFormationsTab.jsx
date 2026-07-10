import React, { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Save, Upload, ChevronDown, ChevronRight, GraduationCap, Video, FileText, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { value: 'pcnc', label: 'PCNC' },
  { value: 'serviteur', label: 'Serviteur' },
  { value: 'pilote_fij', label: 'Pilote FIJ' },
  { value: 'accueil', label: 'Accueil' },
  { value: 'communication', label: 'Communication' },
  { value: 'musique', label: 'Musique' },
  { value: 'coordination', label: 'Coordination' },
  { value: 'autre', label: 'Autre' },
];

const iCls = "w-full bg-white border border-border text-foreground rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-secondary/50";

function ProgramCard({ program, modules, submissions, onUpdate, onRemove, onAddModule, onUpdateModule, onRemoveModule, onReviewSubmission }) {
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState({ ...program });
  const [uploading, setUploading] = useState(null);

  const save = useCallback((patch) => {
    setForm(f => ({ ...f, ...patch }));
    onUpdate(program.id, patch);
  }, [program.id, onUpdate]);

  const uploadFile = async (e, field, moduleId) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(moduleId || 'cover');
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploading(null);
    if (moduleId) {
      onUpdateModule(moduleId, { [field]: file_url });
    } else {
      save({ [field]: file_url });
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 flex-1 text-left">
          {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          <GraduationCap className="w-4 h-4 text-secondary" />
          <span className="text-sm font-semibold text-foreground">{form.title || 'Sans titre'}</span>
          <span className="text-[10px] text-muted-foreground bg-surface px-1.5 py-0.5 rounded-full">{modules.length} modules</span>
        </button>
        <button onClick={() => onRemove(program.id)} className="text-danger/60 hover:text-danger transition-colors ml-2">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <input className={iCls + ' mb-2'} placeholder="Titre" value={form.title || ''} onChange={e => setForm(f => ({...f, title: e.target.value}))} onBlur={e => save({ title: e.target.value })} />
      <textarea className={iCls + ' mb-2'} rows={2} placeholder="Description" value={form.description || ''} onChange={e => setForm(f => ({...f, description: e.target.value}))} onBlur={e => save({ description: e.target.value })} />

      <div className="grid grid-cols-2 gap-2 mb-2">
        <select className={iCls} value={form.category || 'pcnc'} onChange={e => save({ category: e.target.value })}>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select className={iCls} value={form.status || 'published'} onChange={e => save({ status: e.target.value })}>
          <option value="draft">Brouillon</option>
          <option value="published">Publié</option>
          <option value="archived">Archivé</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer mb-2">
        <input type="checkbox" checked={form.is_public || false} onChange={e => save({ is_public: e.target.checked })} className="accent-secondary" />
        Visible par tous les serviteurs
      </label>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="border-t border-border pt-3 mt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-foreground">Modules</span>
                <button onClick={() => onAddModule(program)} className="flex items-center gap-1 text-xs text-secondary hover:text-secondary/80">
                  <Plus className="w-3 h-3" /> Ajouter un module
                </button>
              </div>

              {modules.map((mod, i) => {
                const modSubs = submissions.filter(s => s.module_id === mod.id);
                return (
                  <div key={mod.id} className="bg-surface/50 border border-border rounded-xl p-3 mb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-muted-foreground">{i + 1}</span>
                      <input className={iCls + ' flex-1'} placeholder="Titre du module" value={mod.title || ''} onBlur={e => onUpdateModule(mod.id, { title: e.target.value })} />
                      <button onClick={() => onRemoveModule(mod.id)} className="text-danger/60 hover:text-danger">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea className={iCls + ' mb-2'} rows={1} placeholder="Description" value={mod.description || ''} onChange={e => { const v = e.target.value; }} onBlur={e => onUpdateModule(mod.id, { description: e.target.value })} />

                    <div className="flex flex-wrap gap-2 mb-2">
                      <label className="flex items-center gap-1 text-[10px] text-indigo-600 cursor-pointer hover:text-indigo-700">
                        {uploading === mod.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Video className="w-3 h-3" />}
                        Vidéo
                        <input type="file" accept="video/*" className="hidden" onChange={e => uploadFile(e, 'video_url', mod.id)} />
                      </label>
                      <label className="flex items-center gap-1 text-[10px] text-indigo-600 cursor-pointer hover:text-indigo-700">
                        <FileText className="w-3 h-3" /> Document
                        <input type="file" accept="application/pdf" className="hidden" onChange={e => uploadFile(e, 'document_url', mod.id)} />
                      </label>
                      <label className="flex items-center gap-1 text-[10px] text-muted-foreground cursor-pointer">
                        <input type="checkbox" checked={mod.requires_summary !== false} onChange={e => onUpdateModule(mod.id, { requires_summary: e.target.checked })} className="accent-secondary" />
                        Résumé requis
                      </label>
                    </div>

                    {mod.video_url && <p className="text-[10px] text-green-600 mb-1">✓ Vidéo uploadée</p>}
                    {mod.document_url && <p className="text-[10px] text-green-600 mb-1">✓ Document uploadé</p>}

                    {/* Submissions */}
                    {modSubs.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-[10px] font-semibold text-muted-foreground">Soumissions ({modSubs.length}) :</p>
                        {modSubs.map(sub => (
                          <div key={sub.id} className="bg-white border border-border rounded-lg p-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-medium text-foreground">{sub.module_title}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                                sub.status === 'validated' ? 'bg-green-500/10 text-green-600' :
                                sub.status === 'submitted' ? 'bg-amber-500/10 text-amber-600' :
                                sub.status === 'rejected' ? 'bg-red-500/10 text-red-600' :
                                'bg-surface text-muted-foreground'
                              }`}>{sub.status}</span>
                            </div>
                            {sub.summary_text && <p className="text-[10px] text-muted-foreground line-clamp-2 mb-1">{sub.summary_text}</p>}
                            {sub.status === 'submitted' && (
                              <div className="flex gap-1 mt-1">
                                <input className="flex-1 bg-white border border-border rounded px-1.5 py-1 text-[10px]" placeholder="Commentaire…" id={`review-${sub.id}`} />
                                <button onClick={() => onReviewSubmission(sub.id, 'validated', document.getElementById(`review-${sub.id}`).value)} className="bg-green-500/10 text-green-600 rounded p-1 hover:bg-green-500/20">
                                  <CheckCircle className="w-3 h-3" />
                                </button>
                                <button onClick={() => onReviewSubmission(sub.id, 'correction', document.getElementById(`review-${sub.id}`).value)} className="bg-amber-500/10 text-amber-600 rounded p-1 hover:bg-amber-500/20">
                                  <XCircle className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminFormationsTab() {
  const [programs, setPrograms] = useState([]);
  const [modules, setModules] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.TrainingProgram.list('display_order', 50),
      base44.entities.TrainingModule.list('module_order', 200),
      base44.entities.TrainingSubmission.filter({ status: 'submitted' }, '-submitted_at', 100),
    ]).then(([p, m, s]) => {
      setPrograms(p || []);
      setModules(m || []);
      setSubmissions(s || []);
      setLoading(false);
    });
  }, []);

  const addProgram = async () => {
    const p = await base44.entities.TrainingProgram.create({ title: 'Nouvelle formation', category: 'pcnc', status: 'draft', is_public: false, display_order: programs.length });
    setPrograms(prev => [...prev, p]);
  };

  const updateProgram = async (id, data) => {
    await base44.entities.TrainingProgram.update(id, data);
    setPrograms(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const removeProgram = async (id) => {
    await base44.entities.TrainingProgram.delete(id);
    setPrograms(prev => prev.filter(p => p.id !== id));
    setModules(prev => prev.filter(m => m.program_id !== id));
  };

  const addModule = async (program) => {
    const m = await base44.entities.TrainingModule.create({
      program_id: program.id,
      program_title: program.title,
      title: 'Nouveau module',
      module_order: modules.filter(m => m.program_id === program.id).length,
      requires_summary: true,
    });
    setModules(prev => [...prev, m]);
  };

  const updateModule = async (id, data) => {
    await base44.entities.TrainingModule.update(id, data);
    setModules(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  };

  const removeModule = async (id) => {
    await base44.entities.TrainingModule.delete(id);
    setModules(prev => prev.filter(m => m.id !== id));
  };

  const reviewSubmission = async (subId, status, comment) => {
    const user = await base44.auth.me();
    const updated = await base44.entities.TrainingSubmission.update(subId, {
      status,
      review_comment: comment || '',
      reviewed_by_id: user.id,
      reviewed_by_name: user.full_name,
      reviewed_at: new Date().toISOString(),
    });
    setSubmissions(prev => prev.map(s => s.id === subId ? updated : s).filter(s => s.status === 'submitted'));
  };

  if (loading) return <Loader2 className="w-5 h-5 text-secondary animate-spin" />;

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-foreground font-semibold">Formations ({programs.length})</h2>
        <button onClick={addProgram} className="flex items-center gap-2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-2 rounded-xl hover:bg-primary/90">
          <Plus className="w-3.5 h-3.5" /> Nouvelle formation
        </button>
      </div>

      {submissions.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-400/20 rounded-2xl p-3 mb-4">
          <p className="text-xs text-amber-600 font-semibold mb-1">{submissions.length} résumé(s) en attente de validation</p>
          <p className="text-[10px] text-muted-foreground">Déplie la formation concernée pour valider ou demander correction.</p>
        </div>
      )}

      {programs.map(p => (
        <ProgramCard
          key={p.id}
          program={p}
          modules={modules.filter(m => m.program_id === p.id)}
          submissions={submissions.filter(s => s.program_id === p.id)}
          onUpdate={updateProgram}
          onRemove={removeProgram}
          onAddModule={addModule}
          onUpdateModule={updateModule}
          onRemoveModule={removeModule}
          onReviewSubmission={reviewSubmission}
        />
      ))}
    </div>
  );
}