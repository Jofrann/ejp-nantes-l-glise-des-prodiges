import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, UserPlus } from 'lucide-react';

export default function AjouterMembreModal({ departmentId, onClose, onAdded }) {
  const [form, setForm] = useState({
    full_name: '',
    note: '',
    role_in_dept: 'membre',
    joined_at: new Date().toISOString().split('T')[0],
    photo_url: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) return;
    setSaving(true);
    await base44.entities.DepartmentMember.create({
      ...form,
      department_id: departmentId,
      is_active: true,
    });
    setSaving(false);
    onAdded?.();
  };

  const inputCls = "w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400/50";

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-amber-400" />
            <p className="text-sm font-semibold text-white">Ajouter un membre</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Nom complet *</label>
            <input
              className={inputCls}
              placeholder="Prénom Nom"
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Rôle dans le département</label>
            <select
              className={inputCls}
              value={form.role_in_dept}
              onChange={e => setForm(f => ({ ...f, role_in_dept: e.target.value }))}
            >
              <option value="membre">Membre</option>
              <option value="referent">Référent</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Rôle précis (optionnel)</label>
            <input
              className={inputCls}
              placeholder="Ex: Guitariste, Coordinateur..."
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Date d'intégration</label>
            <input
              type="date"
              className={inputCls}
              value={form.joined_at}
              onChange={e => setForm(f => ({ ...f, joined_at: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Photo URL (optionnel)</label>
            <input
              className={inputCls}
              placeholder="https://..."
              value={form.photo_url}
              onChange={e => setForm(f => ({ ...f, photo_url: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving || !form.full_name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300 transition-all disabled:opacity-50"
            >
              {saving ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}