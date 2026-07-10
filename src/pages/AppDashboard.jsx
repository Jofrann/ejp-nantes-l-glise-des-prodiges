import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Calendar, CheckCircle, GraduationCap, Sprout, CalendarClock,
  BookOpen, ChevronRight, Target, Briefcase, Sparkles, AlertCircle,
  Clock, ArrowRight
} from 'lucide-react';
import { isBureauLike, isAdmin, isFijPilot } from '@/lib/permissions';
import PageHeader from '@/components/star/PageHeader';

const ACCENT_CSS_MAP = {
  gold: { star: '38 45% 47%', starSoft: '40 45% 70%' },
  blue: { star: '215 35% 19%', starSoft: '215 35% 35%' },
  green: { star: '142 45% 34%', starSoft: '142 45% 50%' },
  rose: { star: '340 60% 50%', starSoft: '340 60% 65%' },
  purple: { star: '265 60% 55%', starSoft: '265 60% 68%' },
};

const DEFAULT_WIDGETS = ['journee', 'actions', 'rythme', 'actualites', 'responsabilites'];

export default function AppDashboard() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [fijs, setFijs] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [pref, setPref] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.Event.list('-event_date', 10),
      base44.entities.FIJ.filter({ is_active: true }, '-created_date', 50),
      base44.entities.AppointmentRequest.filter({ status: 'pending' }, '-created_date', 5),
      base44.entities.UserWorkspacePreference.list('-updated_date', 1),
    ]).then(([u, evs, f, appts, prefs]) => {
      setUser(u);
      const today = new Date().toISOString().split('T')[0];
      const upcoming = (evs || []).filter(e => e.is_active && e.event_date >= today);
      setEvents(upcoming.slice(0, 6));
      setFijs(f || []);
      setAppointments(appts || []);
      const existing = prefs && prefs.length > 0 ? prefs[0] : null;
      setPref(existing || { accent_color: 'gold', visible_widgets: DEFAULT_WIDGETS });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Apply accent color via CSS variable
  useEffect(() => {
    if (!pref?.accent_color) return;
    const colors = ACCENT_CSS_MAP[pref.accent_color] || ACCENT_CSS_MAP.gold;
    document.documentElement.style.setProperty('--star-accent', `hsl(${colors.star})`);
    document.documentElement.style.setProperty('--star-accent-soft', `hsl(${colors.starSoft})`);
  }, [pref?.accent_color]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
  const firstName = user?.full_name?.split(' ')[0] || 'Serviteur';
  const isPilot = isFijPilot(user, fijs);
  const today = new Date();
  const isThursday = today.getDay() === 4;
  const todayStr = today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const visibleWidgets = pref?.visible_widgets || DEFAULT_WIDGETS;
  const showWidget = (key) => visibleWidgets.includes(key);

  // Actions du jour
  const todoItems = [];
  if (events.length > 0) {
    todoItems.push({ icon: CheckCircle, title: 'Confirmer ma présence', sub: 'Prochain événement', to: '/app/presences', urgency: 'normal', action: 'Confirmer' });
  }
  if (isPilot && isThursday) {
    todoItems.push({ icon: Briefcase, title: 'Remplir le CR du jeudi', sub: 'C\'est jeudi — remplis ton CR FIJ', to: '/app/responsabilites', urgency: 'high', action: 'Remplir' });
  }
  if (appointments.length > 0) {
    todoItems.push({ icon: CalendarClock, title: 'Demande de rendez-vous en attente', sub: `${appointments.length} demande(s) en cours`, to: '/app/rendez-vous', urgency: 'normal', action: 'Voir' });
  }
  todoItems.push({ icon: Sprout, title: 'Lire ma Parole du jour', sub: 'Ta croissance spirituelle', to: '/app/croissance', urgency: 'normal', action: 'Continuer' });

  // Timeline du jour
  const todayEvents = events.filter(e => e.event_date === today.toISOString().split('T')[0]);
  const dayTimeline = [
    ...todayEvents.map(e => ({ time: e.event_time || '--:--', title: e.title, type: 'ejp' })),
  ];
  if (dayTimeline.length === 0) {
    dayTimeline.push({ time: null, title: 'Aucune action urgente aujourd\'hui. Prépare ta semaine dans ton agenda.', type: 'empty' });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-border border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Zone principale */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Section 1 — Hero personnel */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <PageHeader
                title={`${greeting}, ${firstName}`}
                intention={`Voici ton espace STAR pour aujourd'hui. ${todayStr}.`}
                breadcrumbs={[{ label: 'STAR OS' }]}
                actions={
                  <Link to="/app/agenda" className="flex items-center gap-1.5 text-xs font-medium text-foreground bg-card border border-border rounded-xl px-3 py-2 hover:border-secondary/30 transition-colors">
                    <Calendar className="w-3.5 h-3.5" /> Voir mon agenda
                  </Link>
                }
              />

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
                  <p className="text-xs text-secondary uppercase tracking-widest mb-0.5">Serviteur Travaillant Activement pour le Royaume</p>
                  {pref?.verset && (
                    <p className="text-sm text-muted-foreground italic mt-1">"{pref.verset}"</p>
                  )}
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl px-5 py-4 shadow-sm">
                <p className="font-display text-foreground/70 text-base font-light italic leading-relaxed">
                  "Chacun selon le don qu'il a reçu, employez-le à vous servir les uns les autres."
                </p>
                <p className="text-xs text-secondary mt-2 text-right">— 1 Pierre 4:10</p>
              </div>

              {todoItems.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="flex items-center gap-1.5 text-xs text-warning bg-warning/10 border border-warning/20 rounded-full px-3 py-1">
                    <AlertCircle className="w-3 h-3" />
                    {todoItems.length} action{todoItems.length > 1 ? 's' : ''} à traiter
                  </span>
                </div>
              )}
            </motion.div>

            {/* Section 2 — Le fil de ma journée */}
            {showWidget('journee') && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs text-muted-foreground uppercase tracking-widest">Le fil de ma journée</h2>
                  <Link to="/app/agenda" className="text-xs text-secondary flex items-center gap-1">
                    Ouvrir l'agenda complet <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                  <div className="space-y-2">
                    {dayTimeline.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {item.time ? (
                          <span className="text-xs font-bold text-secondary w-12 flex-shrink-0">{item.time}</span>
                        ) : (
                          <div className="w-12 flex-shrink-0 flex justify-center">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground/50" />
                          </div>
                        )}
                        <span className="text-sm text-foreground">{item.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Section 3 — À traiter maintenant */}
            {showWidget('actions') && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">À traiter maintenant</h2>
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
            )}

            {/* Section 4 — Mon rythme STAR */}
            {showWidget('rythme') && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Mon rythme STAR</h2>
                <div className="grid grid-cols-3 gap-3">
                  <Link to="/app/presences" className="bg-card border border-border rounded-2xl p-4 hover:shadow-sm transition-all">
                    <CheckCircle className="w-4 h-4 text-green-600 mb-2" />
                    <p className="text-xs font-semibold text-foreground">Présence</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {events.length > 0 ? 'À confirmer' : 'À jour'}
                    </p>
                  </Link>
                  <Link to="/app/formations" className="bg-card border border-border rounded-2xl p-4 hover:shadow-sm transition-all">
                    <GraduationCap className="w-4 h-4 text-indigo-600 mb-2" />
                    <p className="text-xs font-semibold text-foreground">Formation</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">PCNC en cours</p>
                  </Link>
                  <Link to="/app/croissance" className="bg-card border border-border rounded-2xl p-4 hover:shadow-sm transition-all">
                    <Sprout className="w-4 h-4 text-emerald-600 mb-2" />
                    <p className="text-xs font-semibold text-foreground">Croissance</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Continue ta lecture</p>
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Section 5 — Actualités et ressources utiles */}
            {showWidget('actualites') && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Actualités & ressources</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link to="/app/ressources" className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4 hover:shadow-sm transition-all">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">Nouvelles ressources</p>
                      <p className="text-xs text-muted-foreground truncate">Documents et liens utiles</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                  <Link to="/app/ressources" className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4 hover:shadow-sm transition-all">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-400/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-rose-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">Boutique EJP</p>
                      <p className="text-xs text-muted-foreground truncate">T-shirts et produits</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Section 6 — Mes responsabilités actives */}
            {showWidget('responsabilites') && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Mes responsabilités</h2>
                <Link to="/app/responsabilites" className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4 hover:shadow-sm transition-all">
                  <div className="w-9 h-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">Mes outils actifs</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {isPilot ? 'Pilote FIJ' : 'Voir mes responsabilités'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              </motion.div>
            )}

          </div>

          {/* Colonne contextuelle desktop */}
          <aside className="hidden xl:block w-72 flex-shrink-0 space-y-4">
            {/* Prochain programme */}
            {events.length > 0 && (
              <div className="glass-card rounded-2xl p-4">
                <p className="text-xs font-heading font-semibold text-foreground mb-3">Prochain programme</p>
                <Link to="/app/presences" className="block">
                  <p className="text-sm font-semibold text-foreground">{events[0].title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(events[0].event_date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    {events[0].event_time && ` · ${events[0].event_time}`}
                  </p>
                  {events[0].location && (
                    <p className="text-xs text-muted-foreground mt-0.5">{events[0].location}</p>
                  )}
                </Link>
                <Link to="/app/presences" className="mt-3 flex items-center justify-center gap-1.5 w-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-medium py-2 rounded-xl hover:bg-secondary/20 transition-all">
                  Confirmer ma présence <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            {/* Raccourcis */}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-heading font-semibold text-foreground mb-3">Raccourcis</p>
              <div className="space-y-1.5">
                {[
                  { icon: Calendar, label: 'Agenda', to: '/app/agenda' },
                  { icon: CheckCircle, label: 'Présences', to: '/app/presences' },
                  { icon: Target, label: 'Objectifs', to: '/app/objectifs' },
                  { icon: CalendarClock, label: 'Rendez-vous', to: '/app/rendez-vous' },
                  { icon: BookOpen, label: 'Ressources', to: '/app/ressources' },
                ].map(({ icon: Icon, label, to }) => (
                  <Link key={to} to={to} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-surface transition-colors">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-foreground">{label}</span>
                    <ChevronRight className="w-3 h-3 text-muted-foreground/40 ml-auto" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Espace direction (si autorisé) */}
            {(isBureauLike(user) || isAdmin(user)) && (
              <div className="glass-card rounded-2xl p-4">
                <p className="text-xs font-heading font-semibold text-foreground mb-3">Espace direction</p>
                <div className="space-y-1.5">
                  {isBureauLike(user) && (
                    <Link to="/app/supervision" className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-surface transition-colors">
                      <Briefcase className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs text-foreground">Supervision</span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground/40 ml-auto" />
                    </Link>
                  )}
                  {isAdmin(user) && (
                    <Link to="/app/admin" className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-surface transition-colors">
                      <Sparkles className="w-3.5 h-3.5 text-danger" />
                      <span className="text-xs text-foreground">Administration</span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground/40 ml-auto" />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}