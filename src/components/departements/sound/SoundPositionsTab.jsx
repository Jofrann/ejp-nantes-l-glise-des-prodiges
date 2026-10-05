import React, { useState } from 'react';
import { SlidersHorizontal, Plus, X, Check, Edit2, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { POSITION_OPTIONS, POSITION_SHORT, POSITION_LABELS } from '@/lib/soundConstants';

export default function SoundPositionsTab({ soundData, isResponsable, colors, onRefresh }) {
  const { profiles = [], members = [] } = soundData;
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const profileMap = {};
  (profiles || []).forEach(p => { if (p.user_id) profileMap[p.user_id] = p; });

  return (
    <div className="space-y-4">
      {/* Liste des postes disponibles */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Postes techniques</p>
        <div className="flex flex-wrap gap-2">
          {POSITION_OPTIONS.map(p => (
            <span key={p.value} className="text-xs px-3 py-1.5 rounded-full bg-surface border border-border text-muted-foreground">
              {p.label}
            </span>
          ))}
        </div>
      </div>

      {/* Profils des membres */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Postes des membres</p>
          {isResponsable && (
            <button onClick={() => setShowForm(true)} className={`flex items-center gap-1 text-xs ${colors.text}`}>
              <Plus className="w-3 h-3" /> Assigner
            </button>
          )}
        </div>

        {(members || []).length === 0 ? (
          <div className="text-center py-8">
            <SlidersHorizontal className="w-7 h-7 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Aucun membre dans le département.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map(m => {
              const profile = profileMap[m.user_id];
              return (
                <div key={m.id} className="bg-card border border-border rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{m.full_name}</p>
                      {m.internal_identifier && <p className="text-[11px] text-muted-foreground font-mono">{m.internal_identifier}</p>}
                    </div>
                    {isResponsable && (
                      <button onClick={() => setEditing({ user_id: m.user_id, full_name: m.full_name, positions: profile?.positions || [], notes: profile?.notes || '', profile_id: profile?.id })} className="text-muted-foreground hover:text-foreground">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {profile?.positions?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {profile.positions.map(pos => (
                        <span key={pos} className="text-[10px] px-2 py-0.5 rounded-full bg-surface border border-border text-muted-foreground">
                          {POSITION_SHORT[pos] || pos}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground/60 mt-1">Aucun poste assigné</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal édition profil */}
      {(editing || showForm) && isResponsable && (
        <ProfileEditModal
          member={editing || { user_id: '', full_name: '', positions: [], notes: '' }}
          members={members}
          colors={colors}
          slug={soundData.department.slug}
          onClose={() => { setEditing(null); setShowForm(false); }}
          onSaved={() => { setEditing(null); setShowForm(false); onRefresh?.(); }}
        />
      )}
    </div>
  );
}

function ProfileEditModal({ member, members, colors, slug, onClose, onSaved }) {
  const [form, setForm] = useState({ user_id: member.user_id, full_name: member.full_name, positions: member.positions || [], notes: member.notes || '' });
  const [saving, setSaving] = useState(false);

  const togglePosition = (pos) => {
    setForm(f => ({
      ...f,
      positions: f.positions.includes(pos) ? f.positions.filter(p => p !== pos) : [...f.positions, pos],
    }));
  };

  const save = async () => {
    if (!form.user_id) return;
    setSaving(true);
    try {
      await base44.functions.invoke('manageSoundItem', {
        department_slug: slug,
        operation: 'save_profile',
        item: form,
      });
      onSaved();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold">Postes techniques</p>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        {!member.user_id && (
          <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm mb-3" value={form.user_id} onChange={e => { const m = members.find(m => m.user_id === e.target.value); setForm(f => ({ ...f, user_id: e.target.value, full_name: m?.full_name || '' })); }}>
            <option value="">Sélectionner un membre...</option>
            {members.map(m => <option key={m.id} value={m.user_id}>{m.full_name}</option>)}
          </select>
        )}

        <p className="text-xs text-muted-foreground mb-2">Postes</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {POSITION_OPTIONS.map(p => (
            <button
              key={p.value}
              onClick={() => togglePosition(p.value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                form.positions.includes(p.value)
                  ? `${colors.bg} ${colors.text} ${colors.border}`
                  : 'bg-surface border-border text-muted-foreground'
              }`}
            >
              {form.positions.includes(p.value) && <Check className="w-3 h-3 inline mr-1" />}
              {p.label}
            </button>
          ))}
        </div>

        <textarea className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm mb-3" rows={2} placeholder="Notes (optionnel)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />

        <button onClick={save} disabled={saving || !form.user_id} className={`w-full ${colors.bg} ${colors.text} border ${colors.border} py-2.5 rounded-xl text-sm font-medium disabled:opacity-50`}>
          {saving ? '...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}