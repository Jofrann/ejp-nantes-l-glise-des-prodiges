import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Users, Plus } from 'lucide-react';
import DeptIcon from '@/components/departements/DeptIcon';

const COLOR_MAP = {
  amber:  'from-amber-400/15  border-amber-400/20  text-amber-400',
  blue:   'from-blue-400/15   border-blue-400/20   text-blue-400',
  purple: 'from-purple-400/15 border-purple-400/20 text-purple-400',
  rose:   'from-rose-400/15   border-rose-400/20   text-rose-400',
  green:  'from-green-400/15  border-green-400/20  text-green-400',
  indigo: 'from-indigo-400/15 border-indigo-400/20 text-indigo-400',
};

export default function ListeDepartements() {
  const [depts, setDepts] = useState([]);
  const [counts, setCounts] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.Department.list('display_order', 50),
      base44.entities.DepartmentMember.filter({ is_active: true }, null, 200),
    ]).then(([u, deps, members]) => {
      setUser(u);
      setDepts((deps || []).filter(d => d.is_active));
      // Comptage par département
      const c = {};
      (members || []).forEach(m => {
        c[m.department_id] = (c[m.department_id] || 0) + 1;
      });
      setCounts(c);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-white/15 border-t-amber-400/80 rounded-full animate-spin" />
    </div>
  );

  const isAdmin = user?.role === 'admin' || user?.role === 'bureau';

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-2xl mx-auto px-5 pt-10 pb-16">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs text-amber-400/60 uppercase tracking-widest mb-1">Espace Serviteur</p>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-white">Départements</h1>
            {isAdmin && (
              <Link
                to="/departement/nouveau"
                className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-3 py-2 rounded-xl transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Nouveau
              </Link>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">{depts.length} département{depts.length > 1 ? 's' : ''} actif{depts.length > 1 ? 's' : ''}</p>
        </motion.div>

        {/* Liste */}
        {depts.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucun département pour l'instant.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {depts.map((dept, i) => {
              const colors = COLOR_MAP[dept.color] || COLOR_MAP.amber;
              const [gradientCls, borderCls, textCls] = colors.split('  ');
              const memberCount = counts[dept.id] || 0;

              return (
                <motion.div
                  key={dept.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/departement/${dept.id}`}
                    className={`flex items-center gap-4 bg-gradient-to-r ${gradientCls} to-transparent border ${borderCls} rounded-2xl p-4 hover:brightness-110 transition-all group`}
                  >
                    {/* Icône */}
                    <div className={`w-11 h-11 rounded-xl bg-white/5 border ${borderCls} flex items-center justify-center flex-shrink-0`}>
                      <DeptIcon name={dept.icon} className={`w-5 h-5 ${textCls}`} />
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{dept.name}</p>
                      {dept.description && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">{dept.description}</p>
                      )}
                      <p className={`text-xs mt-1 ${textCls} opacity-70`}>
                        {memberCount} membre{memberCount > 1 ? 's' : ''}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
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