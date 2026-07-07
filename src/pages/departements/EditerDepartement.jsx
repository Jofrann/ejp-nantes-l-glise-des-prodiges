import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Trash2 } from 'lucide-react';
import { isBureauLike } from '@/lib/permissions';
import PageBreadcrumb from '@/components/navigation/PageBreadcrumb';

const COLORS = ['amber', 'blue', 'purple', 'rose', 'green', 'indigo'];
const ICONS = ['Music', 'Users', 'Heart', 'Star', 'BookOpen', 'Mic', 'Video', 'Camera', 'Coffee', 'Smile', 'Gift', 'Globe', 'Zap', 'Sun', 'Shield', 'Flower2', 'Baby', 'Home', 'Megaphone', 'Layers'];

const COLOR_DOTS = {
  amber: 'bg-secondary', blue: 'bg-blue-500', purple: 'bg-purple-500',
  rose: 'bg-rose-500', green: 'bg-green-500', indigo: 'bg-indigo-500',
};

const inputCls = "w-full bg-white border border-border text-foreground placeholder-muted-foreground/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-secondary/50";

async function findDepartmentBySlugOrId(slugOrId) {
  let res = await base44.entities.Department.filter({ id: slugOrId });
  if (res?.[0]) return res[0];
  res = await base44.entities.Department.filter({ slug: slugOrId });
  return res?.[0] || null;
}

export default function EditerDepartement() {
  const { slug: slugOrId } = useParams();
  const navigate = useNavigate();
  const isNew = slugOrId === 'nouveau';

  const [form, setForm] = useState({ name: '', description: '', mission: '', icon: 'Users', color: 'amber', cover_url: '', is_active: true, display_order: 0, attente_superieure: '', rythme_travail: '', critere_excellence: '', responsabilites: '', livrables: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [user, setUser] = useState(null);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      if (isBureauLike(u)) {
        setAuthorized(true);
        if (!isNew) {
          const found = await findDepartmentBySlugOrId(slugOrId);
          if (found) setForm({ ...found });
        }
      } else if (!isNew) {
        const found = await findDepartmentBySlugOrId(slugOrId);
        if (found) setForm({ ...found });
        const members = await base44.entities.DepartmentMember.filter({ department_id: found?.id, is_active: true });
        const isReferent = (members || []).some(m => m.user_id === u?.id && m.role_in_dept === 'referent');
        setAuthorized(isReferent);
      } else {
        setAuthorized(false);
      }
    });
  }, [slugOrId]);

  const uploadCover = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, cover_url: file_url }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    if (isNew) {
      const created = await base44.entities.Department.create(form);
      navigate(`/app/departements/${created.id}`);
    } else {
      await base44.entities.Department.update(form.id, form);
      setMsg('Sauvegardé !');
      setTimeout(() => setMsg(''), 2500);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer ce département ? Cette action est irréversible.')) return;
    await base44.entities.Department.delete(form.id);
    navigate('/app/departements');
  };

  if (!user) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-border border-t-secondary rounded-full animate-spin" />
    </div>
  );

  if (!authorized) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground px-5 text-center">
      <p className="text-sm font-semibold text-foreground mb-1">Accès réservé</p>
      <p className="text-xs text-muted-foreground mb-5 max-w-xs">Seuls les responsables peuvent modifier ce département.</p>
      <Link to={isNew ? '/app/departements' : `/app/departements/${form.slug || form.id || slugOrId}`} className="text-secondary text-sm">← Retour</Link>
    </div>
  );

  const deptPath = form.slug || form.id || slugOrId;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-xl mx-auto px-5 pt-8 pb-20">

        {/* Fil d'Ariane */}
        <PageBreadcrumb
          items={
            isNew
              ? [
                  { label: 'Tableau de bord', to: '/app' },
                  { label: 'Départements', to: '/app/departements' },
                  { label: 'Nouveau département', to: '/app/departements/nouveau/parametres' },
                ]
              : [
                  { label: 'Tableau de bord', to: '/app' },
                  { label: 'Départements', to: '/app/departements' },
                  { label: form.name || 'Département', to: `/app/departements/${deptPath}` },
                  { label: 'Paramètres', to: `/app/departements/${deptPath}/parametres` },
                ]
          }
          backTo={isNew ? '/app/departements' : `/app/departements/${deptPath}`}
          backLabel={isNew ? '← Départements' : '← Département'}
          rightAction={
            <div className="flex items-center gap-3">
              {msg && <span className="text-xs text-success">{msg}</span>}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Sauvegarde...' : isNew ? 'Créer' : 'Sauvegarder'}
              </button>
            </div>
          }
        />

        <h1 className="text-xl font-bold text-foreground mb-6">{isNew ? 'Nouveau département' : 'Modifier le département'}</h1>

        {/* Champs */}
        <div className="space-y-5">

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Nom *</label>
            <input className={inputCls} placeholder="Ex: Louange, Accueil, FIJ..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Sous-titre</label>
            <input className={inputCls} placeholder="Ex: Département musical de l'Église" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Vision / Mission</label>
            <textarea
              className={inputCls}
              rows={3}
              placeholder="Quelques phrases qui décrivent la vision de ce département..."
              value={form.mission || ''}
              onChange={e => setForm(f => ({ ...f, mission: e.target.value }))}
            />
          </div>

          {/* Architecture de mission */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-secondary uppercase tracking-wider mb-4">Architecture de mission</p>
            <div className="space-y-5">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Attente supérieure</label>
                <input className={inputCls} placeholder="Ce que ce département vise en priorité..." value={form.attente_superieure || ''} onChange={e => setForm(f => ({ ...f, attente_superieure: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Rythme de travail</label>
                <input className={inputCls} placeholder="Ex: hebdomadaire, ponctuel, saisonnier..." value={form.rythme_travail || ''} onChange={e => setForm(f => ({ ...f, rythme_travail: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Critère d'excellence</label>
                <input className={inputCls} placeholder="Ce qui définit la réussite..." value={form.critere_excellence || ''} onChange={e => setForm(f => ({ ...f, critere_excellence: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Responsabilités</label>
                <textarea className={inputCls} rows={2} placeholder="Responsabilités clés des membres..." value={form.responsabilites || ''} onChange={e => setForm(f => ({ ...f, responsabilites: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Livrables attendus</label>
                <textarea className={inputCls} rows={2} placeholder="Productions concrètes attendues..." value={form.livrables || ''} onChange={e => setForm(f => ({ ...f, livrables: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Couleur */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Couleur thème</label>
            <div className="flex gap-3 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-8 h-8 rounded-full ${COLOR_DOTS[c]} transition-all ${form.color === c ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110' : 'opacity-50 hover:opacity-100'}`}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Icône */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Icône</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => setForm(f => ({ ...f, icon }))}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                    form.icon === icon
                      ? 'bg-secondary/15 border-secondary/40 text-secondary'
                      : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-secondary/30'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Image de couverture */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Image de couverture</label>
            {form.cover_url && (
              <img src={form.cover_url} alt="" className="w-full h-32 object-cover rounded-xl mb-2 border border-border" />
            )}
            <input
              className={inputCls + ' mb-2'}
              placeholder="https://..."
              value={form.cover_url || ''}
              onChange={e => setForm(f => ({ ...f, cover_url: e.target.value }))}
            />
            <label className={`flex items-center gap-2 text-xs cursor-pointer ${uploading ? 'text-muted-foreground' : 'text-secondary hover:text-secondary/80'}`}>
              <Upload className="w-3.5 h-3.5" />
              {uploading ? 'Upload en cours...' : 'Uploader une image'}
              <input type="file" accept="image/*" className="hidden" onChange={uploadCover} disabled={uploading} />
            </label>
          </div>

          {/* Options */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-secondary" />
              Département actif
            </label>
          </div>

          {/* Danger zone */}
          {!isNew && (
            <div className="pt-4 border-t border-border">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 text-xs text-danger/60 hover:text-danger transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Supprimer ce département
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}