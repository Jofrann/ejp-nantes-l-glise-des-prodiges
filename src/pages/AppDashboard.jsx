import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Calendar, CheckCircle, GraduationCap, Sprout, CalendarClock,
  BookOpen, ChevronRight, MapPin, Clock, Target,
  Briefcase, Sparkles, AlertCircle, Map, Settings as SettingsIcon
} from 'lucide-react';
import { isBureauLike, isAdmin, isFijPilot } from '@/lib/permissions';

export default function AppDashboard() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [fijs, setFijs] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.Event.list('-event_date', 5),
      base44.entities.FIJ.filter({ is_active: true }, '-created_date', 50),
      base44.entities.AppointmentRequest.filter({ status: 'pending' }, '-created_date', 5),
    ]).then(([u, evs, f, appts]) => {
      setUser(u);
      const today = new Date().toISOString().split('T')[0];
      const upcoming = (evs || []).filter(e => e.is_active && e.event_date >= today);
      setEvents(upcoming.slice(0, 4));
      setFijs(f || []);
      setAppointments(appts || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
  const firstName = user?.full_name?.split(' ')[0] || 'Serviteur';
  const isPilot = isFijPilot(user, fijs);
  const today = new Date();
  const isThursday = today.getDay() === 4;
  const todayStr = today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  // Actions du jour
  const todoItems = [];
  if (events.length > 0) {
    todoItems.push({ icon: CheckCircle, title: 'Confirmer ma présence', sub: 'Prochain événement', to: '/app/presences', urgency: 'normal', action: 'Confirmer' });
  }
  if (isPilot && isThursday) {
    todoItems.push({ icon: Briefcase, title: 'Remplir le CR du jeudi', sub: 'C\'est jeudi — remplis ton CR FIJ', to: '/app/responsabilites', urgency: 'high', action: 'Remplir' });
  }
  todoItems.push({ icon: Sprout, title: 'Lire ma Parole du jour', sub: 'Ta croissance spirituelle', to: '/app/croissance', urgency: 'normal', action: 'Continuer' });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-border border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* En-tête personnel */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-secondary/25 flex-shrink-0">
              {user?.photo_url ? (
                <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-secondary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-secondary">{firstName[0]}</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-secondary uppercase tracking-widest mb-0.5">Accueil STAR</p>
              <h1 className="text-xl font-heading font-bold text-foreground leading-tight">
                {greeting}, {firstName}
              </h1>
              <p className="text-xs text-muted-foreground capitalize mt-0.5">{todayStr}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl px-5 py-4 shadow-sm">
            <p className="font-display text-foreground/70 text-base font-light italic leading-relaxed">
              "Chacun selon le don qu'il a reçu, employez-le à vous servir les uns les autres."
            </p>
            <p className="text-xs text-secondary mt-2 text-right">— 1 Pierre 4:10</p>
          </div>

          {/* Statut rapide */}
          {todoItems.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-warning bg-warning/10 border border-warning/20 rounded-full px-3 py-1">
                <AlertCircle className="w-3 h-3" />
                {todoItems.length} action{todoItems.length > 1 ? 's' : ''} à traiter
              </span>
            </div>
          )}

          {/* Boutons rapides */}
          <div className="flex gap-2 mt-4">
            <Link to="/app/espace-personnel" className="flex items-center gap-1.5 text-xs font-medium text-foreground bg-card border border-border rounded-xl px-3 py-2 hover:border-secondary/30 transition-colors">
              <SettingsIcon className="w-3.5 h-3.5" /> Personnaliser mon espace
            </Link>
            <Link to="/app/agenda" className="flex items-center gap-1.5 text-xs font-medium text-foreground bg-card border border-border rounded-xl px-3 py-2 hover:border-secondary/30 transition-colors">
              <Calendar className="w-3.5 h-3.5" /> Voir mon agenda
            </Link>
            <Link to="/app/presences" className="flex items-center gap-1.5 text-xs font-medium text-foreground bg-card border border-border rounded-xl px-3 py-2 hover:border-secondary/30 transition-colors">
              <AlertCircle className="w-3.5 h-3.5" /> Déclarer une absence
            </Link>
          </div>
        </motion.div>

        {/* À faire aujourd'hui */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">À faire aujourd'hui</h2>
          <div className="space-y-2">
            {todoItems.map((item, i) => (
              <Link
                key={i}
                to={item.to}
                className={`flex items-center gap-3 bg-card border rounded-xl p-3.5 hover:shadow-sm transition-all group ${
                  item.urgency === 'high' ? 'border-warning/30' : 'border-border'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  item.urgency === 'high' ? 'bg-warning/10 text-warning' : 'bg-secondary/10 text-secondary'
                }`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.sub}</p>
                </div>
                <span className="text-xs font-medium text-secondary flex items-center gap-1">
                  {item.action} <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Mini agenda */}
        {events.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs text-muted-foreground uppercase tracking-widest">Mon agenda</h2>
              <Link to="/app/agenda" className="text-xs text-secondary flex items-center gap-1">
                Voir tout <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {events.slice(0, 3).map((ev) => (
                <div key={ev.id} className="bg-card border border-border rounded-xl p-3.5 flex items-center gap-3 shadow-sm">
                  <div className="flex-shrink-0 w-12 text-center bg-secondary/10 border border-secondary/20 rounded-xl py-1.5">
                    <p className="text-[10px] text-secondary font-medium uppercase">
                      {new Date(ev.event_date).toLocaleDateString('fr-FR', { month: 'short' })}
                    </p>
                    <p className="text-base font-bold text-secondary leading-none">
                      {new Date(ev.event_date).getDate()}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{ev.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {ev.event_time && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" /> {ev.event_time}
                        </span>
                      )}
                      {ev.location && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                          <MapPin className="w-3 h-3" /> {ev.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Formations */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs text-muted-foreground uppercase tracking-widest">Mes formations</h2>
            <Link to="/app/formations" className="text-xs text-secondary flex items-center gap-1">
              Voir tout <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {[
              { title: 'PCNC 001', desc: 'Fondations du parcours' },
              { title: 'PCNC 101', desc: 'Approfondissement' },
              { title: 'PCNC 201', desc: 'Maturation' },
            ].map((prog, i) => (
              <Link key={i} to="/app/formations" className="flex items-center gap-3 bg-card border border-border rounded-xl p-3.5 hover:shadow-sm transition-all">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{prog.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{prog.desc}</p>
                </div>
                <span className="text-xs font-medium text-indigo-600 flex items-center gap-1">
                  Commencer <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Rendez-vous */}
        {appointments.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs text-muted-foreground uppercase tracking-widest">Mes rendez-vous</h2>
              <Link to="/app/rendez-vous" className="text-xs text-secondary flex items-center gap-1">
                Voir tout <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {appointments.map((appt) => (
                <Link key={appt.id} to="/app/rendez-vous" className="flex items-center gap-3 bg-card border border-border rounded-xl p-3.5 hover:shadow-sm transition-all">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-400/20 flex items-center justify-center flex-shrink-0">
                    <CalendarClock className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{appt.subject}</p>
                    <p className="text-xs text-muted-foreground truncate">En attente · {appt.request_type}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Accès rapides */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Mes modules</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Calendar, label: 'Agenda', to: '/app/agenda', color: 'from-blue-500/10 to-blue-500/5 border-blue-400/20 text-blue-600' },
              { icon: CheckCircle, label: 'Présences', to: '/app/presences', color: 'from-green-500/10 to-green-500/5 border-green-400/20 text-green-600' },
              { icon: GraduationCap, label: 'Formations', to: '/app/formations', color: 'from-indigo-500/10 to-indigo-500/5 border-indigo-400/20 text-indigo-600' },
              { icon: Sprout, label: 'Croissance', to: '/app/croissance', color: 'from-emerald-500/10 to-emerald-500/5 border-emerald-400/20 text-emerald-600' },
              { icon: Target, label: 'Objectifs', to: '/app/objectifs', color: 'from-amber-500/10 to-amber-500/5 border-amber-400/20 text-amber-600' },
              { icon: CalendarClock, label: 'RDV', to: '/app/rendez-vous', color: 'from-rose-500/10 to-rose-500/5 border-rose-400/20 text-rose-600' },
              { icon: BookOpen, label: 'Ressources', to: '/app/ressources', color: 'from-purple-500/10 to-purple-500/5 border-purple-400/20 text-purple-600' },
              { icon: Map, label: 'Parcours', to: '/app/parcours', color: 'from-cyan-500/10 to-cyan-500/5 border-cyan-400/20 text-cyan-600' },
              { icon: Briefcase, label: 'Responsabilités', to: '/app/responsabilites', color: 'from-secondary/10 to-secondary/5 border-secondary/20 text-secondary' },
            ].map(({ icon: Icon, label, to, color }) => (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-2 bg-gradient-to-br ${color} border rounded-2xl p-4 transition-all hover:shadow-md active:scale-[0.97]`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold text-center leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Espace direction / admin */}
        {(isBureauLike(user) || isAdmin(user)) && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Espace direction</h2>
            <div className="grid grid-cols-2 gap-3">
              {isBureauLike(user) && (
                <Link to="/app/direction" className="group bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 transition-all hover:shadow-md">
                  <Briefcase className="w-5 h-5 text-primary mb-3" />
                  <p className="text-sm font-semibold text-foreground">Direction</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Vue consolidée</p>
                </Link>
              )}
              {isAdmin(user) && (
                <Link to="/app/admin" className="group bg-gradient-to-br from-danger/10 to-danger/5 border border-danger/20 rounded-2xl p-4 transition-all hover:shadow-md">
                  <SettingsIcon className="w-5 h-5 text-danger mb-3" />
                  <p className="text-sm font-semibold text-foreground">Administration</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Gérer l'app</p>
                </Link>
              )}
            </div>
          </motion.div>
        )}

        {/* Communauté */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">La communauté EJP</p>
                <p className="text-xs text-muted-foreground">Nantes & au-delà</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Retrouve tous les serviteurs et reste connecté à la vie de l'Église.
            </p>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 w-full bg-surface hover:bg-muted border border-border text-foreground text-sm font-medium py-2.5 rounded-xl transition-all"
            >
              Voir la page d'accueil <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}