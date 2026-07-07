import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Plus, ChevronRight, Crown } from 'lucide-react';
import DeptIcon from '@/components/departements/DeptIcon';
import PageBreadcrumb from '@/components/navigation/PageBreadcrumb';
import { isBureauLike } from '@/lib/permissions';

const COLOR_MAP = {
  amber:  { border: 'border-secondary/25',  text: 'text-secondary',  bg: 'bg-secondary/10',  glow: 'from-secondary/10' },
  blue:   { border: 'border-blue-400/25',   text: 'text-blue-600',   bg: 'bg-blue-500/10',   glow: 'from-blue-500/10'  },
  purple: { border: 'border-purple-400/25', text: 'text-purple-600', bg: 'bg-purple-500/10', glow: 'from-purple-500/10'},
  rose:   { border: 'border-rose-400/25',   text: 'text-rose-600',   bg: 'bg-rose-500/10',   glow: 'from-rose-500/10'  },
  green:  { border: 'border-green-400/25',  text: 'text-green-600',  bg: 'bg-green-500/10',  glow: 'from-green-500/10' },
  indigo: { border: 'border-indigo-400/25', text: 'text-indigo-600', bg: 'bg-indigo-500/10', glow: 'from-indigo-500/10'},
};

export default function ListeDepartements() {
  const [depts, setDepts] = useState([]);
  const [counts, setCounts] = useState({});
  const [referentCounts, setReferentCounts] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.Department.list('display_order', 50),
      base44.entities.DepartmentMember.filter({ is_active: true }, null, 200),
    ]).then(([u, deps, members]) => {
      setUser(u);
      const allDepts = (deps || []).filter(d => d.is_active);
      const admin = isBureauLike(u);
      const myDeptIds = (members || []).filter(m => m.user_id === u?.id).map(m => m.department_id);
      const visibleDepts = admin ? allDepts : allDepts.filter(d => myDeptIds.includes(d.id));
      setDepts(visibleDepts);
      const c = {};
      const r = {};
      (members || []).forEach(m => {
        c[m.department_id] = (c[m.department_id] || 0) + 1;
        if (m.role_in_dept === 'referent') {
          r[m.department_id] = (r[m.department_id] || 0) + 1;
        }
      });
      setCounts(c);
      setReferentCounts(r);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-border border-t-secondary rounded-full animate-spin" />
    </div>
  );

  const isAdmin = isBureauLike(user);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-5 pt-10 pb-20">

        {/* Fil d'Ariane */}
        <PageBreadcrumb
          items={[
            { label: 'Tableau de bord', to: '/app' },
            { label: 'Départements', to: '/app/departements' },
          ]}
          backTo="/app"
          backLabel="← Tableau de bord"
        />

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-xs text-secondary uppercase tracking-widest mb-2">Espace Serviteur</p>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-foreground">Départements</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {depts.length} département{depts.length > 1 ? 's' : ''} actif{depts.length > 1 ? 's' : ''}
              </p>
            </div>
            {isAdmin && (
              <Link
                to="/app/departements/nouveau/parametres"
                className="flex items-center gap-2 text-xs bg-secondary/10 hover:bg-secondary/20 border border-secondary/25 text-secondary px-4 py-2.5 rounded-xl transition-all font-medium flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Nouveau département
              </Link>
            )}
          </div>
        </motion.div>

        {/* Grille */}
        {depts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm">Aucun département rattaché pour l'instant.</p>
            {!isAdmin && <p className="text-xs text-muted-foreground/70 mt-2">Contacte un responsable pour rejoindre une équipe.</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {depts.map((dept, i) => {
              const colors = COLOR_MAP[dept.color] || COLOR_MAP.amber;
              const memberCount = counts[dept.id] || 0;
              const refCount = referentCounts[dept.id] || 0;

              return (
                <motion.div
                  key={dept.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    to={dept.slug === 'fij' ? '/app/departements/fij' : `/app/departements/${dept.slug || dept.id}`}
                    className={`group flex flex-col h-full bg-card border ${colors.border} rounded-2xl overflow-hidden hover:shadow-md transition-all shadow-sm`}
                  >
                    {/* Couverture */}
                    <div className="relative h-28 overflow-hidden">
                      {dept.cover_url ? (
                        <img src={dept.cover_url} alt={dept.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${colors.glow} to-card flex items-center justify-center`}>
                          <DeptIcon name={dept.icon} className={`w-10 h-10 ${colors.text} opacity-30`} />
                        </div>
                      )}
                      {/* Overlay gradient bas */}
                      <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />
                      {/* Badge icône */}
                      <div className={`absolute bottom-3 left-4 w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                        <DeptIcon name={dept.icon} className={`w-5 h-5 ${colors.text}`} />
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="flex flex-col flex-1 p-4 gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground leading-snug">{dept.name}</p>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 mt-0.5" />
                      </div>

                      {dept.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{dept.description}</p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-3 mt-auto pt-3 border-t border-border">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{memberCount} membre{memberCount > 1 ? 's' : ''}</span>
                        </div>
                        {refCount > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Crown className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{refCount} référent{refCount > 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}