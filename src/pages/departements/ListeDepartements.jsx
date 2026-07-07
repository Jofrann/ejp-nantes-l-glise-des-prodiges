import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Plus, ChevronRight, Crown } from 'lucide-react';
import DeptIcon from '@/components/departements/DeptIcon';
import PageBreadcrumb from '@/components/navigation/PageBreadcrumb';
import { isBureauLike } from '@/lib/permissions';

const COLOR_MAP = {
  amber:  { border: 'border-amber-400/25',  text: 'text-amber-400',  bg: 'bg-amber-400/10',  glow: 'from-amber-400/10' },
  blue:   { border: 'border-blue-400/25',   text: 'text-blue-400',   bg: 'bg-blue-400/10',   glow: 'from-blue-400/10'  },
  purple: { border: 'border-purple-400/25', text: 'text-purple-400', bg: 'bg-purple-400/10', glow: 'from-purple-400/10'},
  rose:   { border: 'border-rose-400/25',   text: 'text-rose-400',   bg: 'bg-rose-400/10',   glow: 'from-rose-400/10'  },
  green:  { border: 'border-green-400/25',  text: 'text-green-400',  bg: 'bg-green-400/10',  glow: 'from-green-400/10' },
  indigo: { border: 'border-indigo-400/25', text: 'text-indigo-400', bg: 'bg-indigo-400/10', glow: 'from-indigo-400/10'},
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
      // Filtrer selon les rattachements (sauf bureau/bergere/admin qui voient tout)
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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-white/15 border-t-amber-400/80 rounded-full animate-spin" />
    </div>
  );

  const isAdmin = isBureauLike(user);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
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
          <p className="text-xs text-amber-400/60 uppercase tracking-widest mb-2">Espace Serviteur</p>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-white">Départements</h1>
              <p className="text-sm text-gray-500 mt-1">
                {depts.length} département{depts.length > 1 ? 's' : ''} actif{depts.length > 1 ? 's' : ''}
              </p>
            </div>
            {isAdmin && (
              <Link
                to="/app/departements/nouveau/parametres"
                className="flex items-center gap-2 text-xs bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/25 text-amber-400 px-4 py-2.5 rounded-xl transition-all font-medium flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Nouveau département
              </Link>
            )}
          </div>
        </motion.div>

        {/* Grille */}
        {depts.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm">Aucun département rattaché pour l'instant.</p>
            {!isAdmin && <p className="text-xs text-gray-700 mt-2">Contacte un responsable pour rejoindre une équipe.</p>}
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
                    className={`group flex flex-col h-full bg-zinc-900/60 border ${colors.border} rounded-2xl overflow-hidden hover:brightness-110 transition-all`}
                  >
                    {/* Couverture */}
                    <div className="relative h-28 overflow-hidden">
                      {dept.cover_url ? (
                        <img src={dept.cover_url} alt={dept.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${colors.glow} to-zinc-900 flex items-center justify-center`}>
                          <DeptIcon name={dept.icon} className={`w-10 h-10 ${colors.text} opacity-30`} />
                        </div>
                      )}
                      {/* Overlay gradient bas */}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-transparent to-transparent" />
                      {/* Badge icône */}
                      <div className={`absolute bottom-3 left-4 w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                        <DeptIcon name={dept.icon} className={`w-5 h-5 ${colors.text}`} />
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="flex flex-col flex-1 p-4 gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-white leading-snug">{dept.name}</p>
                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0 mt-0.5" />
                      </div>

                      {dept.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{dept.description}</p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-3 mt-auto pt-3 border-t border-white/5">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3 h-3 text-gray-600" />
                          <span className="text-xs text-gray-500">{memberCount} membre{memberCount > 1 ? 's' : ''}</span>
                        </div>
                        {refCount > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Crown className="w-3 h-3 text-gray-600" />
                            <span className="text-xs text-gray-500">{refCount} référent{refCount > 1 ? 's' : ''}</span>
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