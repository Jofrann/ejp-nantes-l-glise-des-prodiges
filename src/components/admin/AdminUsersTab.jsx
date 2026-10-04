import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { UserPlus, Search, Shield, Ban, CheckCircle2, Archive, RefreshCw, Users, Loader2, Mail, Phone, BadgeCheck } from 'lucide-react';

const ALL_BADGES = ['STAR', 'ETUDIANT', 'LEADER', 'BERGERE', 'ADMIN', 'RESPONSABLE', 'PILOTE_FIJ', 'COORDINATION_FIJ'];
const STATUS_LABELS = {
  pending: { label: 'En attente', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  active: { label: 'Actif', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  suspended: { label: 'Suspendu', cls: 'bg-red-100 text-red-700 border-red-200' },
  archived: { label: 'Archivé', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
  rejected: { label: 'Refusé', cls: 'bg-red-100 text-red-700 border-red-200' },
};

const inputCls = "w-full bg-white border border-border text-foreground placeholder-muted-foreground/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-secondary/50";

export default function AdminUsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await base44.entities.User.list('-created_date', 200);
      setUsers(list || []);
    } catch (e) {
      setMsg('Erreur: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(u => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (u.full_name || '').toLowerCase().includes(s) ||
      (u.email || '').toLowerCase().includes(s) ||
      (u.internal_identifier || '').toLowerCase().includes(s)
    );
  });

  const runMigration = async () => {
    setMigrating(true);
    setMsg('');
    try {
      const res = (await base44.functions.invoke('adminManageUser', { action: 'migrate' })).data;
      setMsg(`Migration terminée : ${res.migrated} utilisateur(s) mis à jour, ${res.skipped} ignoré(s).`);
      await load();
    } catch (e) {
      setMsg('Erreur migration: ' + e.message);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        <h2 className="text-foreground font-semibold flex items-center gap-2">
          <Users className="w-4 h-4" /> Utilisateurs ({users.length})
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={runMigration}
            disabled={migrating}
            className="flex items-center gap-1.5 bg-card border border-border text-foreground text-xs font-medium px-3 py-2 rounded-xl hover:bg-surface transition disabled:opacity-50"
          >
            {migrating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Migrer
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-2 rounded-xl hover:bg-primary/90"
          >
            <UserPlus className="w-3.5 h-3.5" /> Nouvel utilisateur
          </button>
        </div>
      </div>

      {msg && <div className="mb-4 p-3 rounded-xl bg-secondary/10 text-secondary text-sm border border-secondary/20">{msg}</div>}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          className={inputCls + ' pl-10'}
          placeholder="Rechercher par nom, email ou identifiant..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => (
            <UserRow key={u.id} user={u} onChanged={load} />
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">Aucun utilisateur trouvé.</p>
          )}
        </div>
      )}

      {showCreate && (
        <CreateUserModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }} />
      )}
    </div>
  );
}

function UserRow({ user, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const statusInfo = STATUS_LABELS[user.account_status] || STATUS_LABELS.pending;

  const changeStatus = async (newStatus) => {
    setBusy(true);
    try {
      await base44.functions.invoke('adminManageUser', { action: newStatus === 'active' ? 'activate' : newStatus, user_id: user.id });
      await onChanged();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center flex-shrink-0 text-xs font-bold text-muted-foreground">
            {(user.first_name?.[0] || '?').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-foreground truncate">
                {user.first_name} {user.last_name}
              </p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusInfo.cls}`}>{statusInfo.label}</span>
            </div>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            {user.internal_identifier && (
              <p className="text-[10px] text-secondary truncate font-mono">{user.internal_identifier}</p>
            )}
            {Array.isArray(user.badges) && user.badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {user.badges.map(b => (
                  <span key={b} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20 font-medium">{b}</span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setShowEdit(true)}
              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground border border-border hover:border-secondary/30 bg-card hover:bg-surface rounded-lg transition"
              title="Modifier"
            >
              <BadgeCheck className="w-3.5 h-3.5" />
            </button>
            {user.account_status !== 'suspended' && (
              <button
                onClick={() => changeStatus('suspend')}
                disabled={busy}
                className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-danger border border-border hover:border-danger/30 bg-card rounded-lg transition disabled:opacity-50"
                title="Suspendre"
              >
                <Ban className="w-3.5 h-3.5" />
              </button>
            )}
            {user.account_status === 'suspended' && (
              <button
                onClick={() => changeStatus('active')}
                disabled={busy}
                className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-success border border-border hover:border-success/30 bg-card rounded-lg transition disabled:opacity-50"
                title="Réactiver"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            )}
            {user.account_status !== 'archived' && (
              <button
                onClick={() => changeStatus('archive')}
                disabled={busy}
                className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-muted-foreground border border-border bg-card rounded-lg transition disabled:opacity-50"
                title="Archiver"
              >
                <Archive className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
      {showEdit && (
        <EditUserModal user={user} onClose={() => setShowEdit(false)} onSaved={() => { setShowEdit(false); onChanged(); }} />
      )}
    </>
  );
}

function CreateUserModal({ onClose, onCreated }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleBadge = (b) => {
    setBadges(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!firstName || !lastName || !email) { setError('Prénom, nom et email requis'); return; }
    setLoading(true);
    try {
      const res = await base44.functions.invoke('adminManageUser', {
        action: 'create',
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        badges,
      });
      onCreated();
    } catch (err) {
      setError(err.message || 'Échec de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell onClose={onClose} title="Créer un utilisateur">
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="p-3 rounded-xl bg-danger/10 text-danger text-sm border border-danger/20">{error}</div>}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground font-medium block mb-1">Prénom</label>
            <input className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium block mb-1">Nom</label>
            <input className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-medium block mb-1">Email</label>
          <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-medium block mb-1">Téléphone (optionnel)</label>
          <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-medium block mb-2">Badges</label>
          <div className="flex flex-wrap gap-2">
            {ALL_BADGES.map(b => (
              <button
                key={b}
                type="button"
                onClick={() => toggleBadge(b)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                  badges.includes(b)
                    ? 'bg-secondary/15 border-secondary/40 text-secondary'
                    : 'bg-card border-border text-muted-foreground hover:border-secondary/30'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 h-11 rounded-xl bg-card border border-border text-foreground text-sm font-medium hover:bg-surface transition">
            Annuler
          </button>
          <button type="submit" disabled={loading} className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Création...</> : 'Créer & inviter'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function EditUserModal({ user, onClose, onSaved }) {
  const [firstName, setFirstName] = useState(user.first_name || '');
  const [lastName, setLastName] = useState(user.last_name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [badges, setBadges] = useState(user.badges || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleBadge = (b) => {
    setBadges(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await base44.functions.invoke('adminManageUser', {
        action: 'update',
        user_id: user.id,
        first_name: firstName,
        last_name: lastName,
        phone,
        badges,
      });
      onSaved();
    } catch (err) {
      setError(err.message || 'Échec de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell onClose={onClose} title={`Modifier — ${user.first_name} ${user.last_name}`}>
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="p-3 rounded-xl bg-danger/10 text-danger text-sm border border-danger/20">{error}</div>}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground font-medium block mb-1">Prénom</label>
            <input className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium block mb-1">Nom</label>
            <input className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-medium block mb-1">Téléphone</label>
          <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-medium block mb-2">Badges</label>
          <div className="flex flex-wrap gap-2">
            {ALL_BADGES.map(b => (
              <button
                key={b}
                type="button"
                onClick={() => toggleBadge(b)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                  badges.includes(b)
                    ? 'bg-secondary/15 border-secondary/40 text-secondary'
                    : 'bg-card border-border text-muted-foreground hover:border-secondary/30'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 h-11 rounded-xl bg-card border border-border text-foreground text-sm font-medium hover:bg-surface transition">
            Annuler
          </button>
          <button type="submit" disabled={loading} className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> ...</> : 'Enregistrer'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-foreground font-semibold text-sm">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}