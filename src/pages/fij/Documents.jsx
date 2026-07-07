import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import FijPageShell, { LoadingSpinner, EmptyState } from '@/components/fij/FijPageShell';
import { useFijData } from '@/hooks/useFijData';
import { FolderOpen, Plus, X, FileText, Upload } from 'lucide-react';

export default function Documents() {
  const { user, loading, accessLevel } = useFijData();
  const [docs, setDocs] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = () => {
    base44.entities.FijDocument.filter({}, '-created_date', 100).then(d => {
      setDocs(d || []);
      setDataLoading(false);
    });
  };
  useEffect(() => { load(); }, []);

  if (loading || dataLoading) return <LoadingSpinner />;

  const isCoord = accessLevel === 'coordination' || accessLevel === 'direction';
  let visible = docs;
  if (!isCoord) {
    visible = docs.filter(d => d.visibility === 'all_fij' || d.visibility === 'pilots');
  }
  if (filter !== 'all') visible = visible.filter(d => d.category === filter);

  return (
    <FijPageShell
      accessLevel={accessLevel}
      title="Documents"
      subtitle="Procédures, formulaires, thèmes et archives"
      actions={isCoord ? (
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 text-xs font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg px-3 py-1.5 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Ajouter
        </button>
      ) : undefined}
    >
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {[
          { v: 'all', l: 'Tous' },
          { v: 'procedure', l: 'Procédures' },
          { v: 'form', l: 'Formulaires' },
          { v: 'theme', l: 'Thèmes' },
          { v: 'report', l: 'Rapports' },
          { v: 'archive', l: 'Archives' },
        ].map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f.v ? 'bg-secondary/15 text-secondary border border-secondary/20' : 'text-muted-foreground hover:text-foreground border border-transparent'
            }`}>
            {f.l}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={FolderOpen} title="Aucun document" sub={isCoord ? "Ajoute le premier document." : "Les documents apparaîtront ici."} />
      ) : (
        <div className="space-y-2">
          {visible.map((doc, i) => (
            <motion.a
              key={doc.id}
              href={doc.file_url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-secondary/30 transition-colors group shadow-sm"
            >
              <div className="w-9 h-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate group-hover:text-secondary transition-colors">{doc.title}</p>
                {doc.description && <p className="text-xs text-muted-foreground truncate">{doc.description}</p>}
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface text-muted-foreground">{doc.category}</span>
                  {doc.visibility && <span className="text-[10px] text-muted-foreground">· {doc.visibility}</span>}
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && <DocFormModal userName={user?.full_name} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
      </AnimatePresence>
    </FijPageShell>
  );
}

function DocFormModal({ userName, onClose, onSaved }) {
  const [form, setForm] = useState({ title: '', description: '', category: 'procedure', visibility: 'all_fij', file_url: '' });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputCls = "w-full h-10 px-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary";

  const uploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, file_url }));
    setUploading(false);
  };

  const save = async () => {
    setSaving(true);
    await base44.entities.FijDocument.create({ ...form, uploaded_by_name: userName });
    onSaved();
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        onClick={e => e.stopPropagation()} className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-xl">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Nouveau document</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Titre *</label>
            <input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Procédure d'ouverture" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description</label>
            <textarea className={inputCls + ' h-16 resize-none'} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Catégorie</label>
              <select className={inputCls} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value="procedure">Procédure</option>
                <option value="form">Formulaire</option>
                <option value="theme">Thème</option>
                <option value="report">Rapport</option>
                <option value="archive">Archive</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Visibilité</label>
              <select className={inputCls} value={form.visibility} onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))}>
                <option value="all_fij">Tous</option>
                <option value="pilots">Pilotes</option>
                <option value="coordination">Coordination</option>
                <option value="direction">Direction</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Fichier</label>
            {form.file_url ? (
              <div className="flex items-center gap-2 bg-success/5 border border-success/20 rounded-xl px-3 py-2.5">
                <FileText className="w-4 h-4 text-success" />
                <span className="text-xs text-success flex-1 truncate">Fichier téléversé</span>
                <button onClick={() => setForm(f => ({ ...f, file_url: '' }))} className="text-xs text-danger">Retirer</button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 border border-dashed border-border rounded-xl py-4 cursor-pointer hover:bg-surface transition-colors">
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{uploading ? 'Téléversement...' : 'Choisir un fichier'}</span>
                <input type="file" className="hidden" onChange={uploadFile} disabled={uploading} />
              </label>
            )}
          </div>
        </div>
        <div className="px-5 py-4 border-t border-border flex gap-2">
          <button onClick={onClose} className="flex-1 text-sm text-muted-foreground border border-border rounded-xl py-2.5 hover:bg-surface">Annuler</button>
          <button onClick={save} disabled={saving || !form.title || !form.file_url} className="flex-1 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl py-2.5 disabled:opacity-50">
            {saving ? '...' : 'Publier'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}