import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Upload, Save, User, Mail, Shield } from 'lucide-react';

export default function MonProfil() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ full_name: '', bio: '', photo_url: '', instagram_url: '', whatsapp_number: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);

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
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, photo_url: file_url }));
    setUploading(false);
  };

  const save = async () => {
    setSaving(true);
    await base44.auth.updateMe(form);
    setSaving(false);
    setMsg('Profil mis à jour !');
    setTimeout(() => setMsg(''), 3000);
  };

  const inputCls = "w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400/50";

  const ROLE_LABELS = {
    admin: 'Admin',
    bureau: 'Bureau',
    referent: 'Référent',
    serviteur: 'Serviteur',
    user: 'Membre',
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 md:px-8">
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-semibold text-white mb-1">Mon profil</h1>
          <p className="text-sm text-gray-500 mb-8">Modifie tes informations personnelles</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white/3 border border-white/10 rounded-2xl p-6 space-y-5">

          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative">
              {form.photo_url ? (
                <img src={form.photo_url} alt="avatar" className="w-20 h-20 rounded-2xl object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-400">
                    {user?.full_name?.[0] || '?'}
                  </span>
                </div>
              )}
              <label className={`absolute -bottom-2 -right-2 w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-400 transition-colors ${uploading ? 'opacity-50' : ''}`}>
                <Upload className="w-3.5 h-3.5 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} disabled={uploading} />
              </label>
            </div>
            <div>
              <p className="text-white font-semibold">{user?.full_name || '—'}</p>
              <div className="flex items-center gap-1 mt-1">
                <Shield className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-purple-400">{ROLE_LABELS[user?.role] || user?.role || '—'}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3 text-gray-600" />
                <span className="text-xs text-gray-600">{user?.email || '—'}</span>
              </div>
            </div>
          </div>

          <hr className="border-white/8" />

          {/* Champs */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Prénom & Nom</label>
            <input className={inputCls} value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Ton nom complet" />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Bio courte</label>
            <textarea className={inputCls} rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Quelques mots sur toi..." />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Instagram</label>
            <input className={inputCls} value={form.instagram_url} onChange={e => setForm(f => ({ ...f, instagram_url: e.target.value }))} placeholder="https://instagram.com/..." />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">WhatsApp (numéro)</label>
            <input className={inputCls} value={form.whatsapp_number} onChange={e => setForm(f => ({ ...f, whatsapp_number: e.target.value }))} placeholder="+33 6 XX XX XX XX" />
          </div>

          <div className="flex items-center justify-between pt-2">
            {msg && <span className="text-xs text-green-400">{msg}</span>}
            <div className="ml-auto">
              <button onClick={save} disabled={saving}
                className="flex items-center gap-2 bg-purple-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-purple-400 transition-all disabled:opacity-50">
                <Save className="w-4 h-4" />
                {saving ? 'Sauvegarde...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}