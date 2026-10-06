import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Users, ArrowRight } from 'lucide-react';
import DeptIcon from '@/components/departements/DeptIcon';
import { getDepartmentRoute } from '@/lib/departmentRouting';
import { isHiddenFromService } from '@/lib/departmentModules';

const COLOR_MAP = {
  amber:  { border: 'border-secondary/20', text: 'text-secondary', bg: 'bg-secondary/10' },
  blue:   { border: 'border-blue-400/20',  text: 'text-blue-600',  bg: 'bg-blue-500/10'  },
  purple: { border: 'border-purple-400/20',text: 'text-purple-600',bg: 'bg-purple-500/10' },
  rose:   { border: 'border-rose-400/20',  text: 'text-rose-600',  bg: 'bg-rose-500/10'  },
  green:  { border: 'border-green-400/20', text: 'text-green-600', bg: 'bg-green-500/10'  },
  indigo: { border: 'border-indigo-400/20',text: 'text-indigo-600',bg: 'bg-indigo-500/10' },
};

const ROLE_LABELS = {
  responsable: 'Responsable',
  referent: 'Référent',
  coordinateur: 'Coordinateur',
  adjoint: 'Adjoint',
  pilote: 'Pilote',
  serviteur: 'Serviteur',
  membre: 'Membre',
};

export default function ProfilDepartements({ userId, memberships: propMemberships, departments: propDepartments }) {
  // Use props if provided (avoids duplicate loading), otherwise empty
  const memberships = propMemberships || [];
  const departments = propDepartments || [];

  // Filter: user's own active memberships, excluding hidden-from-service departments
  const myActiveMemberships = memberships.filter(m =>
    m.user_id === userId &&
    (m.status === 'active' || (!m.status && m.is_active !== false))
  );

  const myServiceMemberships = myActiveMemberships.filter(m => {
    const dept = departments.find(d => d.id === m.department_id);
    return dept && dept.is_active !== false && !isHiddenFromService(dept.slug);
  });

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-secondary" />
        <h2 className="text-sm font-semibold text-foreground">Mes services</h2>
        <span className="text-xs text-muted-foreground bg-surface px-2 py-0.5 rounded-full">{myServiceMemberships.length}</span>
      </div>

      {myServiceMemberships.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl px-5 py-8 text-center shadow-sm">
          <Users className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Tu n'es encore membre d'aucun département.</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Un admin peut t'ajouter à un département.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {myServiceMemberships.map((m, i) => {
            const dept = departments.find(d => d.id === m.department_id);
            if (!dept) return null;
            const colors = COLOR_MAP[dept.color] || COLOR_MAP.amber;
            const roleLabel = ROLE_LABELS[m.role_in_dept] || 'Membre';
            const isResponsable = ['responsable', 'referent', 'coordinateur'].includes(m.role_in_dept);

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={getDepartmentRoute(dept)}
                  className={`flex items-center gap-4 bg-card border ${colors.border} rounded-2xl px-4 py-3.5 hover:shadow-sm transition-all group shadow-sm`}
                >
                  <div className={`w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
                    <DeptIcon name={dept.icon} className={`w-5 h-5 ${colors.text}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{dept.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {isResponsable ? (
                        <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                          <Crown className="w-2.5 h-2.5" /> {roleLabel}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">{roleLabel}</span>
                      )}
                      {m.note && (
                        <span className="text-[10px] text-muted-foreground truncate">· {m.note}</span>
                      )}
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}