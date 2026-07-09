import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Users, Calendar, BookOpen, TrendingUp, Bell, ChevronRight, Heart, CalendarClock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import FijDirectionSummary from '@/components/direction/FijDirectionSummary';

export default function BureauDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ leaders: 0, events: 0, ministries: 0, fiJs: 0, pendingRdv: 0, fijAlerts: 0, sundayReports: 0 });
  const [events, setEvents] = useState([]);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [fijAlerts, setFijAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.Leader.list('display_order', 50),
      base44.entities.Event.filter({ is_active: true }, 'event_date', 5),
      base44.entities.Ministry.list('display_order', 50),
      base44.entities.FIJ.list('display_order', 50),
      base44.entities.AppointmentRequest.filter({ status: 'pending' }, '-created_date', 10),
      base44.entities.FijAlert.filter({ status: 'open' }, '-created_date', 10),
      base44.entities.SundayAttendanceReport.list('-service_date', 5),
    ]).then(([u, l, e, m, f, appts, alerts, sunReports]) => {
      setUser(u);
      setStats({
        leaders: l.length, events: e.length, ministries: m.length, fiJs: f.length,
        pendingRdv: (appts || []).length, fijAlerts: (alerts || []).length,
        sundayReports: (sunReports || []).length,
      });
      setEvents(e);
      setPendingAppointments(appts || []);
      setFijAlerts(alerts || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  const STAT_CARDS = [
    { label: 'Leaders', value: stats.leaders, icon: Users, color: 'from-primary/10 to-primary/5', border: 'border-primary/20', text: 'text-primary' },
    { label: 'Événements actifs', value: stats.events, icon: Calendar, color: 'from-secondary/10 to-secondary/5', border: 'border-secondary/20', text: 'text-secondary' },
    { label: 'RDV en attente', value: stats.pendingRdv, icon: CalendarClock, color: 'from-amber-500/10 to-amber-500/5', border: 'border-amber-400/20', text: 'text-amber-600' },
    { label: 'FIJ réseau', value: stats.fiJs, icon: Heart, color: 'from-rose-500/10 to-rose-500/5', border: 'border-rose-400/20', text: 'text-rose-600' },
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-8">
      <div className="max-w-screen-lg mx-auto">

        {/* Bienvenue */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-2xl font-semibold text-foreground">
            {greeting}, {user?.full_name?.split(' ')[0] || 'Bureau'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Tableau de bord du Bureau — EJP Nantes</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {STAT_CARDS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * i }}
              className={`bg-gradient-to-br ${s.color} border ${s.border} rounded-2xl p-5 shadow-sm`}
            >
              <s.icon className={`w-5 h-5 ${s.text} mb-3`} />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* 2 colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Prochains événements */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-foreground font-semibold text-sm">Prochains événements</h2>
              <Link to="/app/admin" className="text-xs text-primary flex items-center gap-1 hover:text-primary/80">
                Gérer <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {events.length === 0 && <p className="text-xs text-muted-foreground">Aucun événement programmé.</p>}
            <div className="space-y-3">
              {events.map(e => (
                <div key={e.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex flex-col items-center justify-center flex-shrink-0">
                    <p className="text-[10px] text-secondary font-bold leading-none">
                      {new Date(e.event_date).getDate()}
                    </p>
                    <p className="text-[9px] text-secondary/60 uppercase">
                      {new Date(e.event_date).toLocaleString('fr-FR', { month: 'short' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground font-medium">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{e.location || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Synthèse FIJ */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <FijDirectionSummary />
          </motion.div>

          {/* RDV en attente + Alertes */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-foreground font-semibold text-sm">Demandes de rendez-vous</h2>
              <span className="text-xs text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">{stats.pendingRdv} en attente</span>
            </div>
            {pendingAppointments.length === 0 ? (
              <p className="text-xs text-muted-foreground">Aucune demande en attente.</p>
            ) : (
              <div className="space-y-2">
                {pendingAppointments.slice(0, 4).map(a => (
                  <div key={a.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-400/20 flex items-center justify-center flex-shrink-0">
                      <CalendarClock className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium truncate">{a.subject}</p>
                      <p className="text-xs text-muted-foreground">{a.request_type}{a.urgency === 'urgent' ? ' · Urgent' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Alertes FIJ */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-foreground font-semibold text-sm">Alertes FIJ</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full ${stats.fijAlerts > 0 ? 'text-danger bg-danger/10' : 'text-success bg-success/10'}`}>
                {stats.fijAlerts > 0 ? `${stats.fijAlerts} ouverte${stats.fijAlerts > 1 ? 's' : ''}` : 'Aucune'}
              </span>
            </div>
            {fijAlerts.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle className="w-3.5 h-3.5 text-success" />
                Aucune alerte active.
              </div>
            ) : (
              <div className="space-y-2">
                {fijAlerts.slice(0, 4).map(a => (
                  <div key={a.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      a.severity === 'critical' ? 'bg-danger/10 border border-danger/20' : a.severity === 'warning' ? 'bg-warning/10 border border-warning/20' : 'bg-info/10 border border-info/20'
                    }`}>
                      <AlertTriangle className={`w-3.5 h-3.5 ${a.severity === 'critical' ? 'text-danger' : a.severity === 'warning' ? 'text-warning' : 'text-info'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{a.fij_name || 'FIJ'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Accès rapides */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h2 className="text-foreground font-semibold text-sm mb-4">Accès rapides</h2>
            <div className="space-y-2">
              {[
                { label: 'Page vitrine admin', path: '/app/admin', desc: 'Gérer le contenu public', icon: TrendingUp },
                { label: 'Départements', path: '/app/departements', desc: 'Équipes & membres', icon: Users },
                { label: 'Mon profil', path: '/app/profil', desc: 'Modifier mes informations', icon: Users },
              ].map(({ label, path, desc, icon: Icon }) => (
                <Link key={path} to={path}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 ml-auto group-hover:text-foreground transition-colors" />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}