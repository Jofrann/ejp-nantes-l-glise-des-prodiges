import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, UserPlus, Search } from 'lucide-react';

const inputCls = "w-full bg-white border border-border text-foreground placeholder-muted-foreground/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-secondary/50";

export default function AjouterMembreModal({ departmentId, existingUserIds = [], onClose, onAdded }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [roleInDept, setRoleInDept] = useState('membre');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.User.list().then(all => {
      const serviteurs = (all || []).filter(u =>
        ['serviteur', 'referent', 'bureau', 'admin'].includes(u.role) &&
        !existingUserIds.includes(u.id)
      );
      setUsers(serviteurs);
    });
  }, []);

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    await base44.entities.DepartmentMember.create({
      department_id: departmentId,
      user_id: selected.id,
      full_name: selected.full_name,
      photo_url: selected.photo_url || '',
      role_in_dept: roleInDept,
      note,
      joined_at: new Date().toISOString().split('T')[0],
      is_active: true,
    });
    setSaving(false);
    onAdded?.();
  };

  const ROLE_LABELS = {
    admin: 'Admin', bureau: 'Bureau', referent: 'Référent', serviteur: 'Serviteur', user: 'Membre',
  };
  const ROLE_COLORS = {
    admin: 'text-danger', bureau: 'text-secondary', referent: 'text-primary', serviteur: 'text-purple-600', user: 'text-muted-foreground',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-secondary" />
            <p className="text-sm font-semibold text-foreground">Ajouter un serviteur</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Recherche utilisateur */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Choisir un serviteur</label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                className={inputCls + ' pl-9'}
                placeholder="Rechercher par nom ou email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setSelected(null); }}
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-border bg-surface/50 p-1">
              {filtered.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Aucun serviteur disponible</p>
              ) : filtered.map(u => {
                const initials = u.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelected(u)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                      selected?.id === u.id ? 'bg-secondary/10 border border-secondary/30' : 'hover:bg-surface border border-transparent'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-surface border border-border flex items-center justify-center">
                      {u.photo_url ? (
                        <img src={u.photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground">{initials}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium truncate">{u.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <span className={`text-[10px] ${ROLE_COLORS[u.role] || 'text-muted-foreground'}`}>
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rôle dans le département */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Rôle dans le département</label>
            <select className={inputCls} value={roleInDept} onChange={e => setRoleInDept(e.target.value)}>
              <option value="membre">Membre</option>
              <option value="referent">Référent</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Rôle précis (optionnel)</label>
            <input className={inputCls} placeholder="Ex: Guitariste, Coordinateur..." value={note} onChange={e => setNote(e.target.value)} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-surface transition-all">
              Annuler
            </button>
            <button type="submit" disabled={saving || !selected} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50">
              {saving ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}