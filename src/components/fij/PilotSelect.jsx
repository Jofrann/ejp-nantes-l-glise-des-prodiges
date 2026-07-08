import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ChevronDown, Search, User as UserIcon } from 'lucide-react';

/**
 * PilotSelect — sélectionne un utilisateur réel parmi les comptes enregistrés.
 * On ne stocke plus juste un nom : on lie pilot_user_id + pilot_name + pilot_email.
 */
export default function PilotSelect({ label, userId, onSelect, allowEmpty = true }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    base44.entities.User.list('-created_date', 200)
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (u.full_name || '').toLowerCase().includes(s) || (u.email || '').toLowerCase().includes(s);
  });

  const selected = users.find(u => u.id === userId) || null;

  return (
    <div className="relative">
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full h-10 px-3 rounded-xl border border-border bg-white text-foreground text-sm flex items-center justify-between gap-2 hover:border-secondary/40 transition-colors"
      >
        <span className={`flex items-center gap-2 truncate ${selected ? 'text-foreground' : 'text-muted-foreground/60'}`}>
          <UserIcon className="w-3.5 h-3.5 flex-shrink-0" />
          {selected ? `${selected.full_name || 'Sans nom'} — ${selected.email}` : 'Sélectionner un serviteur…'}
        </span>
        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-xl shadow-lg max-h-64 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="w-full h-8 pl-7 pr-2 rounded-lg bg-surface text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {loading && <p className="text-xs text-muted-foreground px-3 py-2">Chargement…</p>}
            {!loading && allowEmpty && (
              <button
                type="button"
                onClick={() => { onSelect(null); setOpen(false); setSearch(''); }}
                className="w-full text-left px-3 py-2 hover:bg-surface text-xs text-muted-foreground"
              >
                — Aucun / Désaffecter
              </button>
            )}
            {!loading && filtered.length === 0 && (
              <p className="text-xs text-muted-foreground px-3 py-2">Aucun utilisateur trouvé.</p>
            )}
            {filtered.map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => { onSelect(u); setOpen(false); setSearch(''); }}
                className={`w-full text-left px-3 py-2 hover:bg-surface transition-colors ${u.id === userId ? 'bg-secondary/5' : ''}`}
              >
                <p className="text-sm text-foreground truncate">{u.full_name || 'Sans nom'}</p>
                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}