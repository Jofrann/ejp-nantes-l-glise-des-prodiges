import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Calendar, Users, Bell, ChevronRight,
  MapPin, Clock, Star, User, Megaphone
} from 'lucide-react';

const ROLE_LABELS = {
  admin: 'Admin',
  bureau: 'Bureau',
  referent: 'Référent',
  serviteur: 'Serviteur',
  user: 'Membre',
};

const QUICK_LINKS = [
  { icon: Megaphone, label: 'EJP Hub', sub: 'Feed & communauté', to: '/hub', accent: 'ejp-orangeRS', style: 'bg-ejp-orangeRS/10 border-ejp-orangeRS/20 hover:bg-ejp-orangeRS/15' },
  { icon: Users, label: 'Départements', sub: 'Équipes & membres', to: '/departements', accent: 'ejp-blueTAF', style: 'bg-ejp-blueTAF/10 border-ejp-blueTAF/20 hover:bg-ejp-blueTAF/15' },
  { icon: Calendar, label: 'Agenda', sub: 'Cultes & événements', to: '/#agenda', accent: 'purple-400', style: 'bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/15' },
  { icon: User, label: 'Mon profil', sub: 'Éditer mes infos', to: '/profil', accent: 'zinc-400', style: 'bg-white/5 border-ejp-greyTech/40 hover:bg-white/8' },
];

export default function EspaceServiteur() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.Event.list('-event_date', 3),
    ]).then(([u, evs]) => {
      setUser(u);
      const upcoming = (evs || []).filter(e => e.is_active && e.event_date >= new Date().toISOString().split('T')[0]);
      setEvents(upcoming.slice(0, 3));
      setLoading(false);
    });
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
  const firstName = user?.full_name?.split(' ')[0] || 'Serviteur';

  if (loading) {
    return (
      <div className="min-h-screen bg-ejp-void flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-ejp-greyTech border-t-ejp-orangeRS rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ejp-void text-ejp-textLight">

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-ejp-orangeRS/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-2xl mx-auto px-5 pt-10 pb-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

            {/* Avatar + Salutation */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-ejp-orangeRS/25 flex-shrink-0">
                {user?.photo_url ? (
                  <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-ejp-orangeRS/10 flex items-center justify-center">
                    <span className="text-xl font-bold text-ejp-orangeRS">{firstName[0]}</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-[10px] text-ejp-orangeRS uppercase tracking-widest mb-0.5 font-bold">Main Deck</p>
                <h1 className="text-xl font-semibold text-ejp-textLight leading-tight">
                  {greeting}, {firstName} 👋
                </h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs text-ejp-textMuted bg-white/5 border border-ejp-greyTech/40 rounded-full px-2.5 py-0.5">
                    {ROLE_LABELS[user?.role] || 'Serviteur'} — EJP Nantes
                  </span>
                </div>
              </div>
            </div>

            {/* Verset */}
            <div className="bg-ejp-orangeRS/6 border border-ejp-orangeRS/15 rounded-2xl px-5 py-4 mb-8">
              <p className="font-display text-ejp-textLight/80 text-lg font-light italic leading-relaxed">
                "Chacun selon le don qu'il a reçu, employez-le à vous servir les uns les autres."
              </p>
              <p className="text-xs text-ejp-orangeRS/50 mt-2 text-right">— 1 Pierre 4:10</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 pb-16 space-y-8">

        {/* Accès rapides */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-[10px] text-ejp-textMuted uppercase tracking-widest font-bold mb-4">Accès rapides</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_LINKS.map(({ icon: Icon, label, sub, to, style }) => (
              <Link
                key={to}
                to={to}
                className={`group border rounded-2xl p-4 transition-all active:scale-[0.98] ${style}`}
              >
                <Icon className="w-5 h-5 text-ejp-textMuted mb-3 group-hover:text-ejp-textLight transition-colors" />
                <p className="text-sm font-semibold text-ejp-textLight">{label}</p>
                <p className="text-xs text-ejp-textMuted mt-0.5">{sub}</p>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Prochains événements */}
        {events.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] text-ejp-textMuted uppercase tracking-widest font-bold">Prochains événements</h2>
              <Link to="/#agenda" className="text-xs text-ejp-orangeRS/70 hover:text-ejp-orangeRS flex items-center gap-1 transition-colors">
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
                  className="bg-white/3 border border-ejp-greyTech/40 rounded-2xl p-4 flex items-center gap-4 hover:border-ejp-greyTech transition-colors"
                >
                  <div className="flex-shrink-0 w-12 text-center bg-ejp-blueTAF/10 border border-ejp-blueTAF/20 rounded-xl py-2">
                    <p className="text-xs text-ejp-blueTAF/70 font-medium">
                      {new Date(ev.event_date).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()}
                    </p>
                    <p className="text-lg font-bold text-ejp-blueTAF leading-none">
                      {new Date(ev.event_date).getDate()}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ejp-textLight truncate">{ev.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {ev.event_time && (
                        <span className="flex items-center gap-1 text-xs text-ejp-textMuted">
                          <Clock className="w-3 h-3" /> {ev.event_time}
                        </span>
                      )}
                      {ev.location && (
                        <span className="flex items-center gap-1 text-xs text-ejp-textMuted truncate">
                          <MapPin className="w-3 h-3" /> {ev.location}
                        </span>
                      )}
                    </div>
                  </div>
                  {ev.is_featured && <Star className="w-4 h-4 text-ejp-orangeRS/60 fill-current flex-shrink-0" />}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bloc Communauté */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="bg-white/3 border border-ejp-greyTech/40 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-ejp-blueTAF/10 border border-ejp-blueTAF/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-ejp-blueTAF" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ejp-textLight">La communauté EJP</p>
                <p className="text-xs text-ejp-textMuted">Nantes & au-delà</p>
              </div>
            </div>
            <p className="text-sm text-ejp-textMuted leading-relaxed mb-4">
              Retrouve tous les serviteurs, explore les ministères et reste connecté à la vie de l'Église.
            </p>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/8 border border-ejp-greyTech/40 text-ejp-textLight text-sm font-medium py-2.5 rounded-xl transition-all"
            >
              Voir la page d'accueil <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}