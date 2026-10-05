import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Clock, Award, ListChecks, Package, Users, ArrowRight, ExternalLink } from 'lucide-react';
import DeptRoleBadge from './DeptRoleBadge';
import MissionCard from './MissionCard';
import { getSpecializedSpaceLink } from '@/lib/departmentModules';

export default function DeptOverviewTab({ dept, members, roleInDept, canManage, colors }) {
  const referents = members.filter(m => ['responsable', 'referent', 'coordinateur'].includes(m.role_in_dept));
  const activeCount = members.length;
  const specializedLink = getSpecializedSpaceLink(dept.slug);

  return (
    <div className="space-y-6">
      {/* Mon rôle */}
      <section>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Mon rôle</p>
        <div className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4">
          <DeptRoleBadge role={roleInDept} size="lg" />
          <span className="text-sm text-muted-foreground">
            {canManage
              ? 'Tu as des capacités de gestion dans ce département.'
              : 'Tu es membre actif de ce département.'}
          </span>
        </div>
      </section>

      {/* Lien vers espace spécialisé (FIJ) */}
      {specializedLink && (
        <section>
          <Link
            to={specializedLink.to}
            className={`flex items-center gap-4 bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-2xl p-4 transition-all hover:shadow-md`}
          >
            <div className={`w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
              <ExternalLink className={`w-5 h-5 ${colors.text}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{specializedLink.label}</p>
              <p className="text-xs text-muted-foreground truncate">{specializedLink.description}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </Link>
        </section>
      )}

      {/* Référents */}
      {referents.length > 0 && (
        <section>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">
            {referents.length > 1 ? 'Référents' : 'Référent'}
          </p>
          <div className="space-y-2">
            {referents.map(m => {
              const initials = m.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
              return (
                <div key={m.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
                  <div className={`w-9 h-9 rounded-xl flex-shrink-0 overflow-hidden border ${colors.border}`}>
                    {m.photo_url ? (
                      <img src={m.photo_url} alt={m.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full ${colors.bg} flex items-center justify-center`}>
                        <span className={`text-[11px] font-bold ${colors.text}`}>{initials}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{m.full_name}</p>
                    {m.note && <p className="text-xs text-muted-foreground truncate">{m.note}</p>}
                  </div>
                  <DeptRoleBadge role={m.role_in_dept} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Espace de mission */}
      {(dept.attente_superieure || dept.rythme_travail || dept.critere_excellence || dept.responsabilites || dept.livrables) && (
        <section>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Espace de mission</p>
          <div className="space-y-3">
            {dept.attente_superieure && (
              <MissionCard icon={Target} label="Attente supérieure" text={dept.attente_superieure} colors={colors} />
            )}
            {dept.rythme_travail && (
              <MissionCard icon={Clock} label="Rythme de travail" text={dept.rythme_travail} colors={colors} />
            )}
            {dept.critere_excellence && (
              <MissionCard icon={Award} label="Critère d'excellence" text={dept.critere_excellence} colors={colors} />
            )}
            {dept.responsabilites && (
              <MissionCard icon={ListChecks} label="Responsabilités" text={dept.responsabilites} colors={colors} />
            )}
            {dept.livrables && (
              <MissionCard icon={Package} label="Livrables attendus" text={dept.livrables} colors={colors} />
            )}
          </div>
        </section>
      )}

      {/* Statut département */}
      <section>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          {activeCount} membre{activeCount > 1 ? 's' : ''} actif{activeCount > 1 ? 's' : ''}
        </div>
      </section>
    </div>
  );
}