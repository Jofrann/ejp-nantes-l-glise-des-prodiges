import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Users, ArrowRight } from 'lucide-react';
import DeptIcon from '@/components/departements/DeptIcon';

const COLOR_MAP = {
  amber:  { border: 'border-secondary/20', text: 'text-secondary', bg: 'bg-secondary/10' },
  blue:   { border: 'border-blue-400/20',  text: 'text-blue-600',  bg: 'bg-blue-500/10'  },
  purple: { border: 'border-purple-400/20',text: 'text-purple-600',bg: 'bg-purple-500/10' },
  rose:   { border: 'border-rose-400/20',  text: 'text-rose-600',  bg: 'bg-rose-500/10'  },
  green:  { border: 'border-green-400/20', text: 'text-green-600', bg: 'bg-green-500/10'  },
  indigo: { border: 'border-indigo-400/20',text: 'text-indigo-600',bg: 'bg-indigo-500/10' },
};

export default function ProfilDepartements({ userId }) {
  const [memberships, setMemberships] = useState([]);
  const [departments, setDepartments] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    base44.entities.DepartmentMember.filter({ user_id: userId, is_active: true }).then(async (mems) => {
      setMemberships(mems || []);
      if (mems?.length) {
        const depts = await base44.entities.Department.list();
        const map = {};
        (depts || []).forEach(d => { map[d.id] = d; });
        setDepartments(map);
      }
      setLoading(false);
    });
  }, [userId]);

  if (loading) return (
    <div className="h-16 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-border border-t-secondary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-secondary" />
        <h2 className="text-sm font-semibold text-foreground">Mes départements</h2>
        <span className="text-xs text-muted-foreground bg-surface px-2 py-0.5 rounded-full">{memberships.length}</span>
      </div>

      {memberships.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl px-5 py-8 text-center shadow-sm">
          <Users className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Tu n'es encore membre d'aucun département.</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Un admin peut t'ajouter à un département.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {memberships.map((m, i) => {
            const dept = departments[m.department_id];
            if (!dept) return null;
            const colors = COLOR_MAP[dept.color] || COLOR_MAP.amber;
            const isReferent = m.role_in_dept === 'referent';

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/app/departements/${dept.slug || dept.id}`}
                  className={`flex items-center gap-4 bg-card border ${colors.border} rounded-2xl px-4 py-3.5 hover:shadow-sm transition-all group shadow-sm`}
                >
                  {/* Icône dept */}
                  <div className={`w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
                    <DeptIcon name={dept.icon} className={`w-5 h-5 ${colors.text}`} />
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{dept.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {isReferent ? (
                        <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                          <Crown className="w-2.5 h-2.5" /> Référent
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Membre</span>
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