import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Plus, Search, MoreVertical, Trash2, UserCheck } from 'lucide-react';
import { GROWTH_STATUS_LABELS, GROWTH_STATUS_COLORS, canCreateFijMember, canDeleteFijMember } from '@/lib/fijPermissions';

export default function MembersTab({ fij, members, user, onReload, basePath }) {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const canAdd = canCreateFijMember(user, fij);
  const canDelete = canDeleteFijMember(user, fij);

  const filtered = members.filter(m =>
    m.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (memberId) => {
    if (!confirm('Supprimer ce membre ?')) return;
    await base44.entities.FijMember.delete(memberId);
    setMenuOpen(null);
    onReload();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un membre..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-1 focus:ring-secondary"
          />
        </div>
        {canAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-3.5 h-3.5" /> Membre
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10">
          <UserCheck className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{search ? 'Aucun résultat' : 'Aucun membre'}</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(member => (
            <div key={member.id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
              <Link to={`${basePath}/${fij.id}/membres/${member.id}`} className="flex-1 flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-xs font-semibold text-muted-foreground flex-shrink-0">
                  {member.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{member.full_name}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${GROWTH_STATUS_COLORS[member.growth_status || 'passif']}`}>
                      {GROWTH_STATUS_LABELS[member.growth_status || 'passif']}
                    </span>
                    {member.phone && <span className="text-[10px] text-muted-foreground">{member.phone}</span>}
                  </div>
                </div>
              </Link>
              {canDelete && (
                <div className="relative">
                  <button onClick={() => setMenuOpen(menuOpen === member.id ? null : member.id)} className="p-1 text-muted-foreground hover:text-foreground">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {menuOpen === member.id && (
                    <div className="absolute right-0 top-7 z-10 bg-card border border-border rounded-lg shadow-lg py-1 w-32">
                      <button onClick={() => handleDelete(member.id)} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-danger hover:bg-danger/5">
                        <Trash2 className="w-3 h-3" /> Supprimer
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAdd && <AddMemberModal fij={fij} onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); onReload(); }} />}
    </div>
  );
}

function AddMemberModal({ fij, onClose, onSaved }) {
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', age: '', city: fij.city || '', growth_status: 'passif' });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.full_name.trim()) return;
    setSaving(true);
    await base44.entities.FijMember.create({
      ...form,
      age: form.age ? parseInt(form.age) : undefined,
      fij_id: fij.id,
      fij_name: fij.name,
      entry_date: new Date().toISOString().split('T')[0],
      is_active: true,
    });
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl p-5 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-foreground mb-4">Nouveau membre — {fij.name}</h3>
        <div className="space-y-3">
          <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Nom complet *" className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary" />
          <div className="grid grid-cols-2 gap-2">
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Téléphone" className="px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary" />
            <input value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} placeholder="Age" type="number" className="px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary" />
          </div>
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary" />
          <select value={form.growth_status} onChange={e => setForm({ ...form, growth_status: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary">
            {Object.entries(GROWTH_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 px-3 py-2 text-sm border border-border rounded-lg text-foreground hover:bg-surface">Annuler</button>
          <button onClick={submit} disabled={saving || !form.full_name.trim()} className="flex-1 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50">
            {saving ? '...' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
}