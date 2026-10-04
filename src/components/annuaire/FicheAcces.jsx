import React from 'react';
import { Check, X } from 'lucide-react';
import { getRoleLabel } from '@/lib/annuaireConstants';

export default function FicheAcces({ person, memberships, fijAssignments, allDepartments }) {
  const activeMemberships = memberships.filter(m => m.status === 'active' || m.is_active !== false);
  const activeDeptIds = new Set(activeMemberships.map(m => m.department_id));

  return (
    <div>
      <div className="mb-5">
        <p className="text-sm text-muted-foreground mb-1">Accès effectifs</p>
        <p className="text-xs text-muted-foreground/70">Cette section est informative. Les accès sont déterminés par les appartenances et les badges, pas éditables ici.</p>
      </div>

      {/* Accès accordés */}
      <div className="mb-6">
        <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider mb-3">Accès accordés</p>
        <div className="space-y-2">
          {activeMemberships.map(m => (
            <div key={m.membership_id} className="flex items-center justify-between bg-emerald-50/50 border border-emerald-100 rounded-xl px-3.5 py-2.5">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{m.department_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {['responsable', 'coordinateur', 'referent'].includes(m.role_in_dept) ? "Peut gérer l\u2019équipe" : "Accès membre"}
                  </p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium">
                {getRoleLabel(m.role_in_dept)}
              </span>
            </div>
          ))}
          {fijAssignments.map((f, i) => (
            <div key={`f${i}`} className="flex items-center justify-between bg-rose-50/50 border border-rose-100 rounded-xl px-3.5 py-2.5">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{f.fij_name}</p>
                  <p className="text-xs text-muted-foreground">Pilotage FIJ</p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 border border-rose-200 font-medium">
                {f.role === 'pilote' ? 'Pilote' : 'Copilote'}
              </span>
            </div>
          ))}
          {activeMemberships.length === 0 && fijAssignments.length === 0 && (
            <p className="text-sm text-muted-foreground py-2">Aucun accès actif.</p>
          )}
        </div>
      </div>

      {/* Accès non accordés (synthèse) */}
      {allDepartments && allDepartments.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground/60 font-medium uppercase tracking-wider mb-3">Sans accès</p>
          <div className="flex flex-wrap gap-2">
            {allDepartments
              .filter(d => d.is_active !== false && d.status === 'active' && !activeDeptIds.has(d.id))
              .slice(0, 8)
              .map(d => (
                <span key={d.id} className="flex items-center gap-1.5 text-xs text-muted-foreground bg-surface/50 rounded-lg px-2.5 py-1.5">
                  <X className="w-3 h-3 text-muted-foreground/40" />
                  {d.name}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}