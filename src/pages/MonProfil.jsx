import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Save, Shield, User, Instagram, Phone, FileText, Compass, BadgeCheck, AlertCircle } from 'lucide-react';
import ProfilDepartements from '@/components/profil/ProfilDepartements';
import { getInternalIdentifier, getBadges, isAccountActive } from '@/lib/permissions';

const inputCls = "w-full bg-white border border-border text-foreground placeholder-muted-foreground/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-secondary/40 transition-colors";

const BADGE_LABELS = {
  ADMIN: 'Admin',
  BUREAU: 'Bureau',
  BERGERE: 'Bergère',
  RESPONSABLE: 'Responsable',
  LEADER: 'Leader',
  PILOTE_FIJ: 'Pilote FIJ',
  COORDINATION_FIJ: 'Coordination FIJ',
  STAR: 'STAR',
  ETUDIANT: 'Étudiant',
};

const BADGE_STYLES = {
  ADMIN: 'bg-danger/10 text-danger border-danger/20',
  BUREAU: 'bg-secondary/10 text-secondary border-secondary/20',
  BERGERE: 'bg-secondary/10 text-secondary border-secondary/20',
  RESPONSABLE: 'bg-primary/10 text-primary border-primary/20',
  LEADER: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
  PILOTE_FIJ: 'bg-rose-500/10 text-rose-600 border-rose-400/20',
  COORDINATION_FIJ: 'bg-purple-500/10 text-purple-600 border-purple-400/20',
  STAR: 'bg-indigo-500/10 text-indigo-600 border-indigo-400/20',
  ETUDIANT: 'bg-emerald-500/10 text-emerald-600 border-emerald-400/20',
};

const STATUS_LABELS = {
  active: { label: 'Compte actif', color: 'text-success bg-success/10 border-success/20' },
  pending: { label: 'Compte en attente', color: 'text-warning bg-warning/10 border-warning/20' },
  suspended: { label: 'Compte suspendu', color: 'text-danger bg-danger/10 border-danger/20' },
  archived: { label: 'Compte archivé', color: 'text-muted-foreground bg-muted border-border' },
  rejected: { label: 'Compte refusé', color: 'text-danger bg-danger/10 border-danger/20' },
};

export default function MonProfil() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ full_name: '', bio: '', photo_url: '', instagram_url: '', whatsapp_number: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [preview, setPreview] = useState(null);
  const [fijs, setFijs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [memberships, setMemberships] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.FIJ.filter({ is_active: true }, { limit: 50 }),
      base44.entities.Department.filter({ is_active: true }, { sort: 'display_order', limit: 50 }),
      base44.entities.DepartmentMember.filter({}, { limit: 100 }),
    ]).then(([u, f, d, m]) => {
      setUser(u);
      setFijs(f?.items || f || []);
      setDepartments(d?.items || d || []);
      setMemberships(m?.items || m || []);
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
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setForm(f => ({ ...f, photo_url: file_url }));
    } catch (err) {
      // fallback: keep existing photo
    }
    setPreview(null);
    setUploading(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe(form);
      setMsg('Profil mis à jour !');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('Erreur lors de la sauvegarde');
    }
    setSaving(false);
  };

  const internalId = getInternalIdentifier(user);
  const badges = getBadges(user);
  const statusInfo = STATUS_LABELS[user?.account_status] || STATUS_LABELS['pending'];
  const avatarSrc = preview || form.photo_url;

  // FIJ responsibilities (source : FIJ.pilot_user_id / copilot_user_id)
  const myPilotFijs = fijs.filter(f =>
    f.pilot_user_id === user?.id || f.copilot_user_id === user?.id
  );

  // Coordination FIJ (source : DepartmentMember dans coordination-fij)
  const coordFijDept = departments.find(d => d.slug === 'coordination-fij');
  const isCoordFij = coordFijDept
    ? memberships.some(m =>
        m.user_id === user?.id &&
        m.department_id === coordFijDept.id &&
        (m.status === 'active' || (!m.status && m.is_active !== false))
      )
    : false;

  const hasFijResponsibilities = myPilotFijs.length > 0 || isCoordFij;

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-8">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Mon profil</h1>
          <p className="text-sm text-muted-foreground mt-1">Ton identité et tes rattachements à EJP Nantes</p>
        </motion.div>

        {/* === IDENTITÉ === */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm mb-4">

          <div className="relative bg-gradient-to-br from-secondary/8 via-transparent to-transparent px-6 py-8 border-b border-border">
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <div className={`w-20 h-20 rounded-2xl overflow-hidden border-2 ${uploading ? 'border-secondary/60' : 'border-border'} transition-all`}>
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-secondary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-secondary">
                        {user?.full_name?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>
                <label className={`absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg ${uploading ? 'bg-muted-foreground' : 'bg-secondary hover:bg-secondary/80'}`}>
                  <Upload className="w-3.5 h-3.5 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} disabled={uploading} />
                </label>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-foreground font-semibold text-lg leading-tight truncate">
                  {user?.full_name || '—'}
                </p>
                {internalId && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs text-secondary font-medium truncate">{internalId}</span>
                  </div>
                )}
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${statusInfo.color}`}>
                    <Shield className="w-3 h-3" />
                    {statusInfo.label}
                  </span>
                </div>
              </div>
            </div>
            {uploading && (
              <p className="text-xs text-secondary mt-3">Upload de la photo en cours...</p>
            )}
          </div>

          {/* Formulaire editable */}
          <div className="px-6 py-6 space-y-5">

            <div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-2">
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
              <label className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-2">
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
                <label className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-2">
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
                <label className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-2">
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
          </div>

          <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-surface/50">
            {msg ? (
              <span className="text-xs text-success font-medium">{msg}</span>
            ) : (
              <span className="text-xs text-muted-foreground">Les modifications seront sauvegardées</span>
            )}
            <button
              onClick={save}
              disabled={saving || uploading}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </motion.div>

        {/* === BADGES === */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-3">
            <BadgeCheck className="w-4 h-4 text-secondary" />
            <h2 className="text-sm font-semibold text-foreground">Mes badges</h2>
            <span className="text-xs text-muted-foreground bg-surface px-2 py-0.5 rounded-full">{badges.length}</span>
          </div>
          {badges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {badges.map(badge => (
                <span
                  key={badge}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${BADGE_STYLES[badge] || 'bg-muted text-muted-foreground border-border'}`}
                >
                  <Shield className="w-3 h-3" />
                  {BADGE_LABELS[badge] || badge}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Aucun badge attribué pour le moment.</p>
          )}
          <p className="text-[10px] text-muted-foreground/60 mt-3">Les badges sont gérés par les administrateurs.</p>
        </motion.div>

        {/* === SERVICES (DepartmentMember) === */}
        {user && <ProfilDepartements userId={user.id} memberships={memberships} departments={departments} />}

        {/* === RESPONSABILITÉS FIJ === */}
        {hasFijResponsibilities && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-2xl p-5 shadow-sm mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Compass className="w-4 h-4 text-secondary" />
              <h2 className="text-sm font-semibold text-foreground">Mes responsabilités FIJ</h2>
            </div>
            <div className="space-y-2.5">
              {myPilotFijs.map(fij => (
                <Link
                  key={`pilot-${fij.id}`}
                  to="/app/responsabilites/fij-pilote"
                  className="flex items-center gap-3 bg-rose-500/5 border border-rose-400/20 rounded-xl p-3.5 hover:border-rose-400/40 transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-400/20 flex items-center justify-center flex-shrink-0">
                    <Compass className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{fij.name || 'FIJ'}</p>
                    <p className="text-xs text-rose-600 font-medium">
                      {fij.pilot_user_id === user?.id ? 'Pilote FIJ' : 'Copilote FIJ'}
                    </p>
                  </div>
                </Link>
              ))}
              {isCoordFij && (
                <Link
                  to="/app/responsabilites/fij-coordination"
                  className="flex items-center gap-3 bg-purple-500/5 border border-purple-400/20 rounded-xl p-3.5 hover:border-purple-400/40 transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center flex-shrink-0">
                    <Compass className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">Coordination FIJ</p>
                    <p className="text-xs text-purple-600 font-medium">Coordination</p>
                  </div>
                </Link>
              )}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}