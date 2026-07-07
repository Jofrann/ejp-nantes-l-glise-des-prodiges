import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Trash2 } from 'lucide-react';
import { isBureauLike } from '@/lib/permissions';

const COLORS = ['amber', 'blue', 'purple', 'rose', 'green', 'indigo'];
const ICONS = ['Music', 'Users', 'Heart', 'Star', 'BookOpen', 'Mic', 'Video', 'Camera', 'Coffee', 'Smile', 'Gift', 'Globe', 'Zap', 'Sun', 'Shield', 'Flower2', 'Baby', 'Home', 'Megaphone', 'Layers'];

const COLOR_DOTS = {
  amber: 'bg-amber-400', blue: 'bg-blue-400', purple: 'bg-purple-400',
  rose: 'bg-rose-400', green: 'bg-green-400', indigo: 'bg-indigo-400',
};

const inputCls = "w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400/50";

export default function EditerDepartement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'nouveau';

  const [form, setForm] = useState({ name: '', description: '', mission: '', icon: 'Users', color: 'amber', cover_url: '', is_active: true, display_order: 0, attente_superieure: '', rythme_travail: '', critere_excellence: '', responsabilites: '', livrables: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [user, setUser] = useState(null);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (isBureauLike(u)) {
        setAuthorized(true);
        if (!isNew) {
          base44.entities.Department.filter({ id }).then(res => {
            if (res?.[0]) setForm({ ...res[0] });
          });
        }
      } else if (!isNew) {
        Promise.all([
          base44.entities.Department.filter({ id }),
          base44.entities.DepartmentMember.filter({ department_id: id, is_active: true })
        ]).then(([res, members]) => {
          if (res?.[0]) setForm({ ...res[0] });
          const isReferent = (members || []).some(m => m.user_id === u?.id && m.role_in_dept === 'referent');
          setAuthorized(isReferent);
        });
      } else {
        setAuthorized(false);
      }
    });
  }, [id]);

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
      navigate(`/departement/${created.id}`);
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
    navigate('/departements');
  };

  if (!user) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-white/15 border-t-amber-400/80 rounded-full animate-spin" />
    </div>
  );

  if (!authorized) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-gray-500 px-5 text-center">
      <p className="text-sm font-semibold text-white mb-1">Accès réservé</p>
      <p className="text-xs text-gray-500 mb-5 max-w-xs">Seuls les responsables peuvent modifier ce département.</p>
      <Link to={isNew ? '/departements' : `/departement/${id}`} className="text-amber-400 text-sm">← Retour</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-xl mx-auto px-5 pt-8 pb-20">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to={isNew ? '/departements' : `/departement/${id}`}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Retour
          </Link>
          <div className="flex items-center gap-3">
            {msg && <span className="text-xs text-green-400">{msg}</span>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-amber-400 text-black text-sm font-semibold px-4 py-2 rounded-xl hover:bg-amber-300 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Sauvegarde...' : isNew ? 'Créer' : 'Sauvegarder'}
            </button>
          </div>
        </div>

        <h1 className="text-xl font-bold text-white mb-6">{isNew ? 'Nouveau département' : 'Modifier le département'}</h1>

        {/* Champs */}
        <div className="space-y-5">

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Nom *</label>
            <input className={inputCls} placeholder="Ex: Louange, Accueil, FIJ..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Sous-titre</label>
            <input className={inputCls} placeholder="Ex: Département musical de l'Église" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Vision / Mission</label>
            <textarea
              className={inputCls}
              rows={3}
              placeholder="Quelques phrases qui décrivent la vision de ce département..."
              value={form.mission || ''}
              onChange={e => setForm(f => ({ ...f, mission: e.target.value }))}
            />
          </div>

          {/* Architecture de mission */}
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs text-amber-400/70 uppercase tracking-wider mb-4">Architecture de mission</p>
            <div className="space-y-5">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Attente supérieure</label>
                <input className={inputCls} placeholder="Ce que ce département vise en priorité..." value={form.attente_superieure || ''} onChange={e => setForm(f => ({ ...f, attente_superieure: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Rythme de travail</label>
                <input className={inputCls} placeholder="Ex: hebdomadaire, ponctuel, saisonnier..." value={form.rythme_travail || ''} onChange={e => setForm(f => ({ ...f, rythme_travail: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Critère d'excellence</label>
                <input className={inputCls} placeholder="Ce qui définit la réussite..." value={form.critere_excellence || ''} onChange={e => setForm(f => ({ ...f, critere_excellence: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Responsabilités</label>
                <textarea className={inputCls} rows={2} placeholder="Responsabilités clés des membres..." value={form.responsabilites || ''} onChange={e => setForm(f => ({ ...f, responsabilites: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Livrables attendus</label>
                <textarea className={inputCls} rows={2} placeholder="Productions concrètes attendues..." value={form.livrables || ''} onChange={e => setForm(f => ({ ...f, livrables: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Couleur */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Couleur thème</label>
            <div className="flex gap-3 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-8 h-8 rounded-full ${COLOR_DOTS[c]} transition-all ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-110' : 'opacity-50 hover:opacity-100'}`}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Icône */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Icône</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => setForm(f => ({ ...f, icon }))}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                    form.icon === icon
                      ? 'bg-amber-400/15 border-amber-400/40 text-amber-400'
                      : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:border-white/20'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Image de couverture */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Image de couverture</label>
            {form.cover_url && (
              <img src={form.cover_url} alt="" className="w-full h-32 object-cover rounded-xl mb-2 border border-white/10" />
            )}
            <input
              className={inputCls + ' mb-2'}
              placeholder="https://..."
              value={form.cover_url || ''}
              onChange={e => setForm(f => ({ ...f, cover_url: e.target.value }))}
            />
            <label className={`flex items-center gap-2 text-xs cursor-pointer ${uploading ? 'text-gray-500' : 'text-amber-400 hover:text-amber-300'}`}>
              <Upload className="w-3.5 h-3.5" />
              {uploading ? 'Upload en cours...' : 'Uploader une image'}
              <input type="file" accept="image/*" className="hidden" onChange={uploadCover} disabled={uploading} />
            </label>
          </div>

          {/* Options */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-amber-400" />
              Département actif
            </label>
          </div>

          {/* Danger zone */}
          {!isNew && (
            <div className="pt-4 border-t border-white/5">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 text-xs text-red-400/60 hover:text-red-400 transition-colors"
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