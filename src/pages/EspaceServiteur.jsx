import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Calendar, Users, BookOpen, Bell, ChevronRight,
  MapPin, Clock, Star, User
} from 'lucide-react';

const ROLE_LABELS = {
  admin: 'Admin',
  bureau: 'Bureau',
  referent: 'Référent',
  serviteur: 'Serviteur',
  user: 'Membre',
};

const QUICK_LINKS = [
  { icon: Bell, label: 'EJP Hub', sub: 'Feed & communauté', to: '/hub', color: 'from-amber-400/20 to-amber-600/5 border-amber-400/30' },
  { icon: Users, label: 'Départements', sub: 'Équipes & membres', to: '/departements', color: 'from-purple-400/15 to-purple-600/5 border-purple-400/20' },
  { icon: Calendar, label: 'Agenda', sub: 'Prochains cultes & events', to: '/#agenda', color: 'from-blue-400/15 to-blue-600/5 border-blue-400/20' },
  { icon: User, label: 'Mon profil', sub: 'Éditer mes infos', to: '/profil', color: 'from-rose-400/15 to-rose-600/5 border-rose-400/20' },
];

export default function EspaceServiteur() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [myDepts, setMyDepts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.Event.list('-event_date', 3),
      base44.entities.DepartmentMember.filter({ is_active: true }, null, 200),
      base44.entities.Department.list('display_order', 50),
    ]).then(([u, evs, members, depts]) => {
      setUser(u);
      const upcoming = (evs || []).filter(e => e.is_active && e.event_date >= new Date().toISOString().split('T')[0]);
      setEvents(upcoming.slice(0, 3));

      // Départements rattachés au serviteur
      const myMemberRecords = (members || []).filter(m => m.user_id === u?.id);
      const myDeptIds = myMemberRecords.map(m => m.department_id);
      const myDepartments = (depts || []).filter(d => d.is_active && myDeptIds.includes(d.id));
      setMyDepts(myDepartments);
      setLoading(false);
    });
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
  const firstName = user?.full_name?.split(' ')[0] || 'Serviteur';

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-white/15 border-t-amber-400/80 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero d'accueil */}
      <div className="relative overflow-hidden">
        {/* Fond décoratif */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-amber-400/6 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-2xl mx-auto px-5 pt-12 pb-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {/* Avatar + Salutation */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-400/25 flex-shrink-0">
                {user?.photo_url ? (
                  <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-amber-400/10 flex items-center justify-center">
                    <span className="text-xl font-bold text-amber-400">{firstName[0]}</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-amber-400/70 uppercase tracking-widest mb-0.5">Espace Serviteur</p>
                <h1 className="text-xl font-semibold text-white leading-tight">
                  {greeting}, {firstName} 👋
                </h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs text-gray-500 bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5">
                    {ROLE_LABELS[user?.role] || 'Serviteur'} — EJP Nantes
                  </span>
                </div>
              </div>
            </div>

            {/* Message de vision */}
            <div className="bg-amber-400/6 border border-amber-400/15 rounded-2xl px-5 py-4 mb-8">
              <p className="font-display text-[#F7F4EF]/80 text-lg font-light italic leading-relaxed">
                "Chacun selon le don qu'il a reçu, employez-le à vous servir les uns les autres."
              </p>
              <p className="text-xs text-amber-400/50 mt-2 text-right">— 1 Pierre 4:10</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 pb-16 space-y-8">

        {/* Accès rapides */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-4">Accès rapides</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_LINKS.map(({ icon: Icon, label, sub, to, color }) => (
              <Link
                key={to}
                to={to}
                className={`group bg-gradient-to-br ${color} border rounded-2xl p-4 transition-all hover:brightness-110 active:scale-[0.98]`}
              >
                <Icon className="w-5 h-5 text-white/60 mb-3 group-hover:text-white/90 transition-colors" />
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Mes départements */}
        {myDepts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs text-gray-500 uppercase tracking-widest">Mes départements</h2>
              <Link to="/departements" className="text-xs text-amber-400/70 hover:text-amber-400 flex items-center gap-1 transition-colors">
                Voir tout <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {myDepts.map((dept, i) => (
                <motion.div
                  key={dept.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.07 }}
                >
                  <Link
                    to={`/departement/${dept.id}`}
                    className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-2xl p-4 hover:border-white/15 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                      <Users className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="min-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{dept.name}</p>
                      {dept.description && <p className="text-xs text-gray-500 truncate">{dept.description}</p>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Prochains événements */}
        {events.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs text-gray-500 uppercase tracking-widest">Prochains événements</h2>
              <Link to="/#agenda" className="text-xs text-amber-400/70 hover:text-amber-400 flex items-center gap-1 transition-colors">
                Voir tout <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {events.map((ev, i) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.07 }}
                  className="bg-white/3 border border-white/8 rounded-2xl p-4 flex items-center gap-4 hover:border-white/15 transition-colors"
                >
                  {/* Date badge */}
                  <div className="flex-shrink-0 w-12 text-center bg-amber-400/10 border border-amber-400/20 rounded-xl py-2">
                    <p className="text-xs text-amber-400/70 font-medium">
                      {new Date(ev.event_date).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()}
                    </p>
                    <p className="text-lg font-bold text-amber-400 leading-none">
                      {new Date(ev.event_date).getDate()}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">{ev.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {ev.event_time && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" /> {ev.event_time}
                        </span>
                      )}
                      {ev.location && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 truncate">
                          <MapPin className="w-3 h-3" /> {ev.location}
                        </span>
                      )}
                    </div>
                  </div>
                  {ev.is_featured && <Star className="w-4 h-4 text-amber-400/60 fill-current flex-shrink-0" />}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bloc Communauté */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">La communauté EJP</p>
                <p className="text-xs text-gray-500">Nantes & au-delà</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Retrouve tous les serviteurs, explore les ministères et reste connecté à la vie de l'Église.
            </p>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium py-2.5 rounded-xl transition-all"
            >
              Voir la page d'accueil <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}