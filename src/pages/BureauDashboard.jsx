import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Users, Calendar, BookOpen, TrendingUp, Bell, ChevronRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BureauDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ leaders: 0, events: 0, ministries: 0, fiJs: 0 });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.Leader.list('display_order', 50),
      base44.entities.Event.filter({ is_active: true }, 'event_date', 5),
      base44.entities.Ministry.list('display_order', 50),
      base44.entities.FIJ.list('display_order', 50),
    ]).then(([u, l, e, m, f]) => {
      setUser(u);
      setStats({ leaders: l.length, events: e.length, ministries: m.length, fiJs: f.length });
      setEvents(e);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  const STAT_CARDS = [
    { label: 'Leaders', value: stats.leaders, icon: Users, color: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/20', text: 'text-purple-400' },
    { label: 'Événements actifs', value: stats.events, icon: Calendar, color: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/20', text: 'text-amber-400' },
    { label: 'Ministères', value: stats.ministries, icon: BookOpen, color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/20', text: 'text-blue-400' },
    { label: 'FIJ réseau', value: stats.fiJs, icon: Heart, color: 'from-rose-500/20 to-rose-600/10', border: 'border-rose-500/20', text: 'text-rose-400' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8 md:px-8">
      <div className="max-w-screen-lg mx-auto">

        {/* Bienvenue */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-2xl font-semibold text-white">
            {greeting}, {user?.full_name?.split(' ')[0] || 'Bureau'} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">Tableau de bord du Bureau — EJP Nantes</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {STAT_CARDS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * i }}
              className={`bg-gradient-to-br ${s.color} border ${s.border} rounded-2xl p-5`}
            >
              <s.icon className={`w-5 h-5 ${s.text} mb-3`} />
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* 2 colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Prochains événements */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white/3 border border-white/8 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-sm">Prochains événements</h2>
              <Link to="/admin" className="text-xs text-purple-400 flex items-center gap-1 hover:text-purple-300">
                Gérer <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {events.length === 0 && <p className="text-xs text-gray-600">Aucun événement programmé.</p>}
            <div className="space-y-3">
              {events.map(e => (
                <div key={e.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex flex-col items-center justify-center flex-shrink-0">
                    <p className="text-[10px] text-amber-400 font-bold leading-none">
                      {new Date(e.event_date).getDate()}
                    </p>
                    <p className="text-[9px] text-amber-400/60 uppercase">
                      {new Date(e.event_date).toLocaleString('fr-FR', { month: 'short' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{e.title}</p>
                    <p className="text-xs text-gray-600">{e.location || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Accès rapides */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-white/3 border border-white/8 rounded-2xl p-5">
            <h2 className="text-white font-semibold text-sm mb-4">Accès rapides</h2>
            <div className="space-y-2">
              {[
                { label: 'Page vitrine admin', path: '/admin', desc: 'Gérer le contenu public', icon: TrendingUp },
                { label: 'Annuaire membres', path: '/bureau/annuaire', desc: 'Voir les profils', icon: Users },
                { label: 'Mon profil', path: '/profil', desc: 'Modifier mes informations', icon: Users },
              ].map(({ label, path, desc, icon: Icon }) => (
                <Link key={path} to={path}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{label}</p>
                    <p className="text-xs text-gray-600">{desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-700 ml-auto group-hover:text-gray-400 transition-colors" />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}