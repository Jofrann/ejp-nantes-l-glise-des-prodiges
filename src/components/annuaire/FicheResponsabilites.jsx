import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, X, Loader2, Heart } from 'lucide-react';

export default function FicheResponsabilites({ person, fijAssignments, activeFijs, onChanged }) {
  const [showAssign, setShowAssign] = useState(false);
  const [busy, setBusy] = useState(false);

  // FIJ où la personne n'est ni pilote ni copilote
  const availableFijs = (activeFijs || []).filter(f =>
    !fijAssignments.some(a => a.fij_id === f.id)
  );

  const removeAssignment = async (fijId, fijName) => {
    if (!confirm(`Retirer ${person.first_name} du pilotage de ${fijName} ?`)) return;
    setBusy(true);
    try {
      // Mettre à null le pilot_user_id ou copilot_user_id selon le rôle
      const assignment = fijAssignments.find(a => a.fij_id === fijId);
      const updateField = assignment.role === 'pilote' ? 'pilot_user_id' : 'copilot_user_id';
      const updateData = { [updateField]: null };
      if (assignment.role === 'pilote') { updateData.pilot_name = null; updateData.pilot_email = null; }
      else { updateData.copilot_name = null; updateData.copilot_email = null; }

      await base44.entities.FIJ.update(fijId, updateData);
      onChanged?.();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-5">
        <p className="text-sm text-muted-foreground mb-1">Responsabilités spécialisées</p>
        <p className="text-xs text-muted-foreground/70">Pilotage FIJ — source de vérité : entité FIJ (pilot_user_id / copilot_user_id).</p>
      </div>

      {fijAssignments.length === 0 ? (
        <div className="bg-surface/50 rounded-xl p-6 text-center">
          <Heart className="w-8 h-8 text-rose-200 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Aucune responsabilité FIJ active.</p>
          {availableFijs.length > 0 && (
            <button onClick={() => setShowAssign(true)} className="mt-2 text-xs text-secondary hover:underline">
              + Assigner à une FIJ
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {fijAssignments.map((f, i) => (
            <div key={i} className="flex items-center justify-between bg-rose-50/50 border border-rose-100 rounded-xl p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Pilote FIJ</p>
                  <p className="text-xs text-muted-foreground">{f.fij_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 border border-rose-200 font-medium">
                  {f.role === 'pilote' ? 'Pilote' : 'Copilote'}
                </span>
                <button
                  onClick={() => removeAssignment(f.fij_id, f.fij_name)}
                  disabled={busy}
                  className="text-muted-foreground hover:text-danger transition text-xs px-2 py-1"
                >
                  Retirer
                </button>
              </div>
            </div>
          ))}
          {availableFijs.length > 0 && (
            <button
              onClick={() => setShowAssign(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-secondary hover:text-secondary/80 transition mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Assigner à une autre FIJ
            </button>
          )}
        </div>
      )}

      {showAssign && (
        <AssignFijModal
          person={person}
          availableFijs={availableFijs}
          onClose={() => setShowAssign(false)}
          onAssigned={() => { setShowAssign(false); onChanged?.(); }}
        />
      )}
    </div>
  );
}

function AssignFijModal({ person, availableFijs, onClose, onAssigned }) {
  const [fijId, setFijId] = useState('');
  const [role, setRole] = useState('pilot');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!fijId) { setError('Choisis une FIJ'); return; }
    setLoading(true);
    try {
      await base44.functions.invoke('adminManageUser', {
        action: 'assign_fij_pilot',
        user_id: person.id,
        fij_id: fijId,
        role,
      });
      onAssigned();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-foreground font-semibold text-sm">Assigner à une FIJ</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        {availableFijs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Aucune FIJ disponible.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {error && <div className="p-3 rounded-xl bg-danger/10 text-danger text-sm border border-danger/20">{error}</div>}
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1.5">FIJ</label>
              <select value={fijId} onChange={e => setFijId(e.target.value)} className="w-full bg-white border border-border text-foreground rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-secondary/50" required>
                <option value="">Choisir...</option>
                {availableFijs.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1.5">Rôle</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-white border border-border text-foreground rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-secondary/50">
                <option value="pilot">Pilote</option>
                <option value="copilot">Copilote</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={onClose} className="flex-1 h-11 rounded-xl bg-card border border-border text-foreground text-sm font-medium hover:bg-surface">Annuler</button>
              <button type="submit" disabled={loading} className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Assigner'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}