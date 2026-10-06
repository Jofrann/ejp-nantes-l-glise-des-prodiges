import React from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, AlertCircle, Layers } from 'lucide-react';

export default function PilotagePeopleTab({ data }) {
  const { people } = data;
  const {
    total_active = 0,
    multi_dept_members = [],
    responsables = [],
    departments_without_responsible = [],
    departments_needing_reinforcement = [],
  } = people || {};

  return (
    <div className="space-y-6">
      {/* Indicateurs globaux */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card border border-border rounded-2xl p-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-heading font-bold text-foreground">{total_active}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Personnes actives</p>
        </div>
        <div className="glass-card border border-border rounded-2xl p-5">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-3">
            <UserCheck className="w-5 h-5 text-secondary" />
          </div>
          <p className="text-2xl font-heading font-bold text-foreground">{responsables.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Responsables</p>
        </div>
      </div>

      {/* Départements sans responsable */}
      {departments_without_responsible.length > 0 && (
        <div>
          <h2 className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">Rôles non pourvus</h2>
          <div className="glass-card border border-warning/20 rounded-2xl p-4">
            <div className="space-y-2">
              {departments_without_responsible.map((d, i) => (
                <Link key={i} to={`/app/pilotage/departements/${d.slug}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface transition-colors">
                  <AlertCircle className="w-4 h-4 text-warning flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{d.department_name}</p>
                    <p className="text-xs text-muted-foreground">{d.member_count} membre(s), aucun responsable</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Équipes nécessitant du renfort */}
      {departments_needing_reinforcement.length > 0 && (
        <div>
          <h2 className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">Équipes à renforcer</h2>
          <div className="glass-card border border-border rounded-2xl p-4">
            <div className="space-y-2">
              {departments_needing_reinforcement.map((d, i) => (
                <Link key={i} to={`/app/pilotage/departements/${d.slug}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface transition-colors">
                  <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{d.department_name}</p>
                    <p className="text-xs text-muted-foreground">{d.member_count} membre(s) seulement</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Personnes servant dans plusieurs départements */}
      {multi_dept_members.length > 0 && (
        <div>
          <h2 className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">Personnes très sollicitées</h2>
          <div className="glass-card border border-border rounded-2xl p-4">
            <p className="text-xs text-muted-foreground mb-3">Ces personnes servent dans plusieurs départements. Veillons à leur charge.</p>
            <div className="space-y-2">
              {multi_dept_members.map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-surface/50">
                  <Layers className="w-4 h-4 text-secondary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{m.full_name}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{m.dept_count} départements</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Responsables */}
      {responsables.length > 0 && (
        <div>
          <h2 className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">Responsables</h2>
          <div className="glass-card border border-border rounded-2xl p-4">
            <div className="space-y-2">
              {responsables.map((r, i) => (
                <Link key={i} to={`/app/pilotage/departements/${r.department_slug}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{r.full_name}</p>
                    <p className="text-xs text-muted-foreground">{r.department_name}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground capitalize">{r.role_in_dept}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {total_active === 0 && multi_dept_members.length === 0 && responsables.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Pas encore suffisamment de données.</p>
        </div>
      )}
    </div>
  );
}