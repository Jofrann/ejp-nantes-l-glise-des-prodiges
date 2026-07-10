import React, { useEffect, useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CheckCircle, GraduationCap, Sprout, CalendarClock,
  BookOpen, ChevronRight, Target, Briefcase, ShoppingBag,
} from 'lucide-react';
import { isBureauLike, isAdmin, isFijPilot } from '@/lib/permissions';
import BureauHero from '@/components/star/bureau/BureauHero';
import BureauActions from '@/components/star/bureau/BureauActions';
import BureauAgendaCourt from '@/components/star/bureau/BureauAgendaCourt';
import BureauContextColumn from '@/components/star/bureau/BureauContextColumn';

const ACCENT_CSS_MAP = {
  gold: { star: '38 45% 47%', starSoft: '40 45% 70%' },
  blue: { star: '215 35% 19%', starSoft: '215 35% 35%' },
  green: { star: '142 45% 34%', starSoft: '142 45% 50%' },
  rose: { star: '340 60% 50%', starSoft: '340 60% 65%' },
  purple: { star: '265 60% 55%', starSoft: '265 60% 68%' },
};

const DEFAULT_WIDGET_ORDER = ['actions', 'agenda', 'rythme', 'formations', 'croissance', 'ressources', 'responsabilites'];
const DEFAULT_VISIBLE = ['actions', 'agenda', 'rythme', 'formations', 'croissance', 'ressources', 'responsabilites'];

export default function AppDashboard() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [responses, setResponses] = useState([]);
  const [fijs, setFijs] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [resources, setResources] = useState([]);
  const [pref, setPref] = useState(null);
  const [loading, setLoading] = useState(true);
  const actionsRef = useRef(null);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.Event.list('-event_date', 20),
      base44.entities.AttendanceResponse.filter({}, '-created_date', 50),
      base44.entities.FIJ.filter({ is_active: true }, '-created_date', 50),
      base44.entities.AppointmentRequest.filter({ status: 'pending' }, '-created_date', 5),
      base44.entities.TrainingSubmission.filter({}, '-created_date', 50),
      base44.entities.TrainingProgram.filter({ status: 'published' }, 'display_order', 50),
      base44.entities.StarResource.filter({ is_active: true }, 'display_order', 5),
      base44.entities.UserWorkspacePreference.list('-updated_date', 1),
    ]).then(([u, evs, resps, f, appts, subs, progs, rsrcs, prefs]) => {
      setUser(u);
      const today = new Date().toISOString().split('T')[0];
      const upcoming = (evs || []).filter(e => e.is_active && e.event_date >= today);
      setEvents(upcoming);
      setResponses(resps || []);
      setFijs(f || []);
      setAppointments(appts || []);
      setSubmissions(subs || []);
      setPrograms(progs || []);
      setResources(rsrcs || []);
      const existing = prefs && prefs.length > 0 ? prefs[0] : null;
      setPref(existing || { accent_color: 'gold', visible_widgets: DEFAULT_VISIBLE, widget_order: DEFAULT_WIDGET_ORDER, show_right_panel: true });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

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
  const showDirection = isBureauLike(user) || isAdmin(user);

  // Compute explicit actions
  const respondedEventIds = new Set(responses.map(r => r.event_id));
  const eventsNeedingResponse = events.filter(e =>
    (e.presence_mode === 'mandatory' || e.presence_mode === 'optional') &&
    !respondedEventIds.has(e.id)
  );

  const actions = [];

  if (eventsNeedingResponse.length > 0) {
    const nextEvent = eventsNeedingResponse[0];
    const eventDate = new Date(nextEvent.event_date + 'T00:00:00');
    const dueLabel = `Réponse attendue avant ${eventDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}`;
    actions.push({
      id: 'presence',
      icon: CheckCircle,
      title: `Confirmer ta présence : ${nextEvent.title}`,
      description: `${nextEvent.event_date ? new Date(nextEvent.event_date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}${nextEvent.event_time ? ` à ${nextEvent.event_time}` : ''}${nextEvent.location ? ` — ${nextEvent.location}` : ''}`,
      reason: 'Ta présence est attendue pour cet événement.',
      dueLabel,
      urgency: nextEvent.presence_mode === 'mandatory' ? 'high' : 'normal',
      primaryLabel: 'Présent',
      primaryTo: '/app/presences',
      secondaryActions: [
        { label: 'Absent', to: '/app/presences' },
        { label: 'Retard', to: '/app/presences' },
      ],
    });
  }

  if (isPilot && isThursday) {
    actions.push({
      id: 'fij_cr',
      icon: Briefcase,
      title: 'Remplir le CR du jeudi',
      description: 'C\'est jeudi — remplis ton compte-rendu FIJ hebdomadaire.',
      reason: 'Le CR du jeudi doit être rempli chaque semaine pour le suivi FIJ.',
      dueLabel: 'Aujourd\'hui',
      urgency: 'high',
      primaryLabel: 'Remplir le CR',
      primaryTo: '/app/responsabilites/fij-pilote/cr',
    });
  }

  const pendingSubs = submissions.filter(s => s.status === 'in_progress' || s.status === 'correction');
  if (pendingSubs.length > 0) {
    const sub = pendingSubs[0];
    actions.push({
      id: 'formation_resume',
      icon: GraduationCap,
      title: `Rédiger ton résumé : ${sub.module_title || 'Module en cours'}`,
      description: sub.program_title || 'Formation en cours',
      reason: 'Tu as terminé la vidéo. Rédige ton résumé pour validation du formateur.',
      dueLabel: 'À rendre',
      urgency: 'normal',
      primaryLabel: 'Rédiger mon résumé',
      primaryTo: '/app/formations',
    });
  }

  if (showDirection && appointments.length > 0) {
    actions.push({
      id: 'appointment',
      icon: CalendarClock,
      title: 'Répondre à une demande de rendez-vous',
      description: `${appointments.length} demande(s) de rendez-vous en attente de réponse.`,
      reason: 'Un serviteur attend ta réponse pour fixer un rendez-vous.',
      dueLabel: 'En attente',
      urgency: 'normal',
      primaryLabel: 'Traiter',
      primaryTo: '/app/rendez-vous',
    });
  }

  // Simple widgets data
  const upcomingPrograms = programs.filter(p => p.is_public || p.assigned_roles?.includes('all')).slice(0, 2);
  const featuredResources = resources.filter(r => r.is_featured).slice(0, 2);
  const regularResources = resources.filter(r => !r.is_featured).slice(0, 1);

  // Widget visibility + ordering
  const visibleWidgets = pref?.visible_widgets || DEFAULT_VISIBLE;
  const widgetOrder = pref?.widget_order?.length > 0 ? pref.widget_order : DEFAULT_WIDGET_ORDER;
  const orderedVisible = widgetOrder.filter(k => visibleWidgets.includes(k));
  const showWidget = (key) => orderedVisible.includes(key);

  const scrollToActions = () => {
    actionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-border border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex gap-6">
          {/* Zone principale */}
          <div className="flex-1 min-w-0 space-y-6">
            <BureauHero
              user={user}
              firstName={firstName}
              greeting={greeting}
              todayStr={todayStr}
              pref={pref}
              todoCount={actions.length}
              onScrollToActions={scrollToActions}
            />

            {showWidget('actions') && (
              <BureauActions ref={actionsRef} actions={actions} />
            )}

            {showWidget('agenda') && (
              <BureauAgendaCourt events={events} />
            )}

            {/* Mon rythme STAR */}
            {showWidget('rythme') && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Mon rythme STAR</h2>
                <div className="grid grid-cols-3 gap-3">
                  <Link to="/app/presences" className="bg-card border border-border rounded-2xl p-4 hover:shadow-sm transition-all">
                    <CheckCircle className="w-4 h-4 text-green-600 mb-2" />
                    <p className="text-xs font-semibold text-foreground">Présence</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {eventsNeedingResponse.length > 0 ? 'À confirmer' : 'À jour'}
                    </p>
                  </Link>
                  <Link to="/app/formations" className="bg-card border border-border rounded-2xl p-4 hover:shadow-sm transition-all">
                    <GraduationCap className="w-4 h-4 text-indigo-600 mb-2" />
                    <p className="text-xs font-semibold text-foreground">Formation</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {pendingSubs.length > 0 ? `${pendingSubs.length} en cours` : 'PCNC en cours'}
                    </p>
                  </Link>
                  <Link to="/app/croissance" className="bg-card border border-border rounded-2xl p-4 hover:shadow-sm transition-all">
                    <Sprout className="w-4 h-4 text-emerald-600 mb-2" />
                    <p className="text-xs font-semibold text-foreground">Croissance</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Continue ta lecture</p>
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Mes formations */}
            {showWidget('formations') && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs text-muted-foreground uppercase tracking-widest">Mes formations</h2>
                  <Link to="/app/formations" className="text-xs text-secondary flex items-center gap-1">
                    Voir toutes <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                {upcomingPrograms.length > 0 ? (
                  <div className="space-y-2">
                    {upcomingPrograms.map(prog => (
                      <Link key={prog.id} to="/app/formations" className="flex items-center gap-3 bg-card border border-border rounded-xl p-3.5 hover:shadow-sm transition-all">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{prog.title}</p>
                          {prog.description && <p className="text-xs text-muted-foreground truncate">{prog.description}</p>}
                        </div>
                        <span className="text-xs font-medium text-secondary">Continuer</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-2xl p-5 text-center">
                    <GraduationCap className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Aucune formation assignée pour le moment.</p>
                    <Link to="/app/ressources" className="text-xs text-secondary mt-2 inline-block">Voir les ressources disponibles</Link>
                  </div>
                )}
              </motion.div>
            )}

            {/* Ma croissance */}
            {showWidget('croissance') && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs text-muted-foreground uppercase tracking-widest">Ma croissance</h2>
                  <Link to="/app/croissance" className="text-xs text-secondary flex items-center gap-1">
                    Continuer <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/app/croissance" className="bg-card border border-border rounded-2xl p-4 hover:shadow-sm transition-all">
                    <Sprout className="w-4 h-4 text-emerald-600 mb-2" />
                    <p className="text-xs font-semibold text-foreground">Lecture de la Parole</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Ta progression spirituelle</p>
                  </Link>
                  <Link to="/app/objectifs" className="bg-card border border-border rounded-2xl p-4 hover:shadow-sm transition-all">
                    <Target className="w-4 h-4 text-amber-600 mb-2" />
                    <p className="text-xs font-semibold text-foreground">Mes objectifs</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Suivre mes buts</p>
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Ressources utiles */}
            {showWidget('ressources') && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs text-muted-foreground uppercase tracking-widest">Ressources utiles</h2>
                  <Link to="/app/ressources" className="text-xs text-secondary flex items-center gap-1">
                    Toutes les ressources <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(featuredResources.length > 0 ? featuredResources : regularResources).slice(0, 2).map((r, i) => (
                    <Link key={r.id || i} to="/app/ressources" className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4 hover:shadow-sm transition-all">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{r.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{r.description || 'Ressource EJP'}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  ))}
                  <Link to="/app/ressources/boutique" className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4 hover:shadow-sm transition-all">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-400/20 flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-4 h-4 text-rose-600" />
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

            {/* Responsabilités actives */}
            {showWidget('responsabilites') && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs text-muted-foreground uppercase tracking-widest">Mes responsabilités</h2>
                  <Link to="/app/responsabilites" className="text-xs text-secondary flex items-center gap-1">
                    Voir mes outils <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
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
          <BureauContextColumn
            events={events}
            user={user}
            favoriteShortcuts={pref?.favorite_shortcuts || []}
            showRightPanel={pref?.show_right_panel !== false}
          />
        </div>
      </div>
    </div>
  );
}