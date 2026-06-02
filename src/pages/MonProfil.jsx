import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Upload, Save, Shield, Mail, User, Instagram, Phone, FileText } from 'lucide-react';
import ProfilDepartements from '@/components/profil/ProfilDepartements';

const ROLE_LABELS = {
  admin: { label: 'Admin', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
  bureau: { label: 'Bureau', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  referent: { label: 'Référent', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  serviteur: { label: 'Serviteur', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  user: { label: 'Membre', color: 'text-gray-400 bg-gray-400/10 border-gray-400/20' },
};

const inputCls = "w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400/40 transition-colors";

export default function MonProfil() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ full_name: '', bio: '', photo_url: '', instagram_url: '', whatsapp_number: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setForm({
        full_name: u.full_name || '',
        bio: u.bio || '',
        photo_url: u.photo_url || '',
        instagram_url: u.instagram_url || '',
        whatsapp_number: u.whatsapp_number || '',
      });
    });
  }, []);

  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Prévisualisation immédiate
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, photo_url: file_url }));
    setPreview(null);
    setUploading(false);
  };

  const save = async () => {
    setSaving(true);
    await base44.auth.updateMe(form);
    setSaving(false);
    setMsg('Profil mis à jour !');
    setTimeout(() => setMsg(''), 3000);
  };

  const roleInfo = ROLE_LABELS[user?.role] || ROLE_LABELS['user'];
  const avatarSrc = preview || form.photo_url;

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 md:px-8">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Mon profil</h1>
          <p className="text-sm text-gray-500 mt-1">Gérer tes informations personnelles</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white/3 border border-white/10 rounded-2xl overflow-hidden">

          {/* Bandeau photo + identité */}
          <div className="relative bg-gradient-to-br from-amber-400/8 via-transparent to-transparent px-6 py-8 border-b border-white/8">
            <div className="flex items-center gap-5">
              {/* Avatar cliquable */}
              <div className="relative flex-shrink-0">
                <div className={`w-20 h-20 rounded-2xl overflow-hidden border-2 ${uploading ? 'border-amber-400/60' : 'border-white/10'} transition-all`}>
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-amber-400/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-amber-400">
                        {user?.full_name?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>
                <label className={`absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg ${uploading ? 'bg-gray-600' : 'bg-amber-400 hover:bg-amber-300'}`}>
                  <Upload className="w-3.5 h-3.5 text-black" />
                  <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} disabled={uploading} />
                </label>
              </div>

              {/* Infos */}
              <div className="min-w-0 flex-1">
                <p className="text-white font-semibold text-lg leading-tight truncate">
                  {user?.full_name || '—'}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Mail className="w-3 h-3 text-gray-600 flex-shrink-0" />
                  <span className="text-xs text-gray-500 truncate">{user?.email || '—'}</span>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${roleInfo.color}`}>
                    <Shield className="w-3 h-3" />
                    {roleInfo.label}
                  </span>
                </div>
              </div>
            </div>
            {uploading && (
              <p className="text-xs text-amber-400/70 mt-3">Upload de la photo en cours...</p>
            )}
          </div>

          {/* Formulaire */}
          <div className="px-6 py-6 space-y-5">

            <div>
              <label className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider mb-2">
                <User className="w-3 h-3" /> Prénom & Nom
              </label>
              <input
                className={inputCls}
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                placeholder="Ton nom complet"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider mb-2">
                <FileText className="w-3 h-3" /> Bio courte
              </label>
              <textarea
                className={inputCls + ' resize-none'}
                rows={3}
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Quelques mots sur toi, ton ministère..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider mb-2">
                  <Instagram className="w-3 h-3" /> Instagram
                </label>
                <input
                  className={inputCls}
                  value={form.instagram_url}
                  onChange={e => setForm(f => ({ ...f, instagram_url: e.target.value }))}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider mb-2">
                  <Phone className="w-3 h-3" /> WhatsApp
                </label>
                <input
                  className={inputCls}
                  value={form.whatsapp_number}
                  onChange={e => setForm(f => ({ ...f, whatsapp_number: e.target.value }))}
                  placeholder="+33 6 XX XX XX XX"
                />
              </div>
            </div>

            {/* Rôle en lecture seule */}
            <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Rôle au sein de l'EJP Nantes</p>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400/60" />
                <span className="text-sm text-white/80">{roleInfo.label}</span>
                <span className="text-xs text-gray-600 ml-auto">Géré par un admin</span>
              </div>
            </div>
          </div>

          {/* Pied de page avec bouton */}
          <div className="px-6 py-4 border-t border-white/8 flex items-center justify-between bg-white/2">
            {msg ? (
              <span className="text-xs text-green-400 font-medium">{msg}</span>
            ) : (
              <span className="text-xs text-gray-600">Les modifications ne seront pas sauvegardées automatiquement</span>
            )}
            <button
              onClick={save}
              disabled={saving || uploading}
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-black text-sm font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </motion.div>

        {/* Activités dans les départements */}
        {user && <ProfilDepartements userId={user.id} />}

      </div>
    </div>
  );
}