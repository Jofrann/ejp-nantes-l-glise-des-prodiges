import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Loader2, X, Calendar } from 'lucide-react';
import { DEPT_ROLES, getRoleLabel, formatDate } from '@/lib/annuaireConstants';

export default function FicheServices({ person, memberships, activeDepartments, onChanged }) {
  const [showAdd, setShowAdd] = useState(false);
  const [busy, setBusy] = useState(false);

  const activeMemberships = memberships.filter(m => m.status === 'active' || m.is_active !== false);
  const archivedMemberships = memberships.filter(m => m.status !== 'active' && m.is_active === false);

  const removeMembership = async (membershipId, deptName) => {
    if (!confirm(`${person.first_name} n'aura plus accès à ${deptName}. Son historique sera conservé.`)) return;
    setBusy(true);
    try {
      await base44.functions.invoke('adminManageUser', {
        action: 'remove_membership',
        membership_id: membershipId,
      });
      onChanged?.();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  const changeRole = async (membershipId, newRole) => {
    setBusy(true);
    try {
      await base44.functions.invoke('adminManageUser', {
        action: 'change_role',
        membership_id: membershipId,
        new_role: newRole,
      });
      onChanged?.();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {/* Services actifs */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground/60 uppercase tracking-widest">Services actifs</p>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-secondary hover:text-secondary/80 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter à un département
          </button>
        </div>

        {activeMemberships.length === 0 ? (
          <div className="bg-surface/50 rounded-xl p-6 text-center">
            <p className="text-sm text-muted-foreground">Aucun service actif.</p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-2 text-xs text-secondary hover:underline"
            >
              + Ajouter à un département
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {activeMemberships.map(m => (
              <div key={m.membership_id} className="bg-card border border-border rounded-xl p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{m.department_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Depuis le {formatDate(m.joined_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeMembership(m.membership_id, m.department_name)}
                    disabled={busy}
                    className="text-muted-foreground hover:text-danger transition p-1.5 rounded-lg hover:bg-danger/5 disabled:opacity-50"
                    title="Retirer du département"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-3">
                  <label className="text-[10px] text-muted-foreground/60 uppercase tracking-wider block mb-1.5">Rôle dans le département</label>
                  <select
                    value={m.role_in_dept}
                    onChange={(e) => changeRole(m.membership_id, e.target.value)}
                    disabled={busy}
                    className="w-full bg-white border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-secondary/50 disabled:opacity-50"
                  >
                    {DEPT_ROLES.map(r => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historique des services */}
      {archivedMemberships.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground/60 uppercase tracking-widest mb-3">Historique des services</p>
          <div className="space-y-1.5">
            {archivedMemberships.map(m => (
              <div key={m.membership_id} className="flex items-center justify-between bg-surface/30 rounded-lg px-3 py-2">
                <div>
                  <p className="text-xs text-muted-foreground">{m.department_name} — {getRoleLabel(m.role_in_dept)}</p>
                  <p className="text-[10px] text-muted-foreground/60">{formatDate(m.joined_at)} → {formatDate(m.ended_at)}</p>
                </div>
                <span className="text-[10px] text-muted-foreground/50">Archivé</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAdd && (
        <AddMembershipModal
          person={person}
          activeDepartments={activeDepartments}
          existingDeptIds={activeMemberships.map(m => m.department_id)}
          onClose={() => setShowAdd(false)}
          onAdded={() => { setShowAdd(false); onChanged?.(); }}
        />
      )}
    </div>
  );
}

function AddMembershipModal({ person, activeDepartments, existingDeptIds, onClose, onAdded }) {
  const [deptId, setDeptId] = useState('');
  const [role, setRole] = useState('serviteur');
  const [joinedAt, setJoinedAt] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableDepts = activeDepartments.filter(d => !existingDeptIds.includes(d.id));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!deptId) { setError('Choisis un département'); return; }
    setLoading(true);
    try {
      await base44.functions.invoke('adminManageUser', {
        action: 'add_membership',
        user_id: person.id,
        department_id: deptId,
        role_in_dept: role,
        joined_at: joinedAt,
      });
      onAdded();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-foreground font-semibold text-sm">Ajouter à un département</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>

        {availableDepts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">{person.first_name} fait déjà partie de tous les départements actifs.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {error && <div className="p-3 rounded-xl bg-danger/10 text-danger text-sm border border-danger/20">{error}</div>}
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1.5">Département</label>
              <select value={deptId} onChange={e => setDeptId(e.target.value)} className="w-full bg-white border border-border text-foreground rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-secondary/50" required>
                <option value="">Choisir...</option>
                {availableDepts.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1.5">Rôle</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-white border border-border text-foreground rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-secondary/50">
                {DEPT_ROLES.map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1.5">Date de début</label>
              <input type="date" value={joinedAt} onChange={e => setJoinedAt(e.target.value)} className="w-full bg-white border border-border text-foreground rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-secondary/50" />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={onClose} className="flex-1 h-11 rounded-xl bg-card border border-border text-foreground text-sm font-medium hover:bg-surface">Annuler</button>
              <button type="submit" disabled={loading} className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}