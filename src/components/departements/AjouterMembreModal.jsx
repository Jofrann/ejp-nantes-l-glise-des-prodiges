import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, UserPlus, Search } from 'lucide-react';

const inputCls = "w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400/50";

export default function AjouterMembreModal({ departmentId, existingUserIds = [], onClose, onAdded }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [roleInDept, setRoleInDept] = useState('membre');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.User.list().then(all => {
      // Filtrer les rôles serviteur/referent/bureau/admin et ceux pas déjà dans le dept
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
    admin: 'text-red-400', bureau: 'text-amber-400', referent: 'text-blue-400', serviteur: 'text-purple-400', user: 'text-gray-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-amber-400" />
            <p className="text-sm font-semibold text-white">Ajouter un serviteur</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Recherche utilisateur */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Choisir un serviteur</label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
              <input
                className={inputCls + ' pl-9'}
                placeholder="Rechercher par nom ou email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setSelected(null); }}
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-white/10 bg-black/20 p-1">
              {filtered.length === 0 ? (
                <p className="text-xs text-gray-600 text-center py-4">Aucun serviteur disponible</p>
              ) : filtered.map(u => {
                const initials = u.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelected(u)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                      selected?.id === u.id ? 'bg-amber-400/15 border border-amber-400/30' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-white/10 flex items-center justify-center">
                      {u.photo_url ? (
                        <img src={u.photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-white">{initials}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{u.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    </div>
                    <span className={`text-[10px] ${ROLE_COLORS[u.role] || 'text-gray-500'}`}>
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rôle dans le département */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Rôle dans le département</label>
            <select className={inputCls} value={roleInDept} onChange={e => setRoleInDept(e.target.value)}>
              <option value="membre">Membre</option>
              <option value="referent">Référent</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Rôle précis (optionnel)</label>
            <input className={inputCls} placeholder="Ex: Guitariste, Coordinateur..." value={note} onChange={e => setNote(e.target.value)} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              Annuler
            </button>
            <button type="submit" disabled={saving || !selected} className="flex-1 py-2.5 rounded-xl bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300 transition-all disabled:opacity-50">
              {saving ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}