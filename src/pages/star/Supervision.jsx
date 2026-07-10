import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users, CheckCircle, XCircle, GraduationCap, CalendarClock,
  Home, AlertCircle, FileText, TrendingUp, ChevronRight,
  Shield, ArrowLeft
} from 'lucide-react';
import { isBureauLike } from '@/lib/permissions';
import RoleGuard from '@/components/RoleGuard';

function SupervisionContent({ user }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [fijs, setFijs] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.asServiceRole.entities.User.list('-created_date', 200).catch(() => []),
      base44.asServiceRole.entities.FIJ.filter({ is_active: true }, '-created_date', 100).catch(() => []),
      base44.asServiceRole.entities.AppointmentRequest.filter({ status: 'pending' }, '-created_date', 10).catch(() => []),
      base44.asServiceRole.entities.FijAlert.filter({ status: 'active' }, '-created_date', 10).catch(() => []),
      base44.asServiceRole.entities.Event.list('-event_date', 10).catch(() => []),
    ]).then(([users, f, appts, al, evts]) => {
      const today = new Date().toISOString().split('T')[0];
      const upcomingEvents = (evts || []).filter(e => e.is_active && e.event_date >= today);
      setStats({
        servants: (users || []).length,
        pendingAppointments: (appts || []).length,
        activeAlerts: (al || []).length,
        upcomingEvents: upcomingEvents.length,
      });
      setFijs(f || []);
      setAlerts(al || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const activeFijs = fijs.filter(f => f.status === 'active').length;
  const pausedFijs = fijs.filter(f => f.status === 'paused').length;

  const indicators = [
    { label: 'Serviteurs', value: stats.servants || 0, icon: Users, color: 'text-blue-600 bg-blue-500/10 border-blue-400/20', to: '/app/admin' },
    { label: 'FIJ actives', value: activeFijs, icon: Home, color: 'text-secondary bg-secondary/10 border-secondary/20', to: '/app/responsabilites/fij-coordination' },
    { label: 'FIJ en pause', value: pausedFijs, icon: AlertCircle, color: 'text-warning bg-warning/10 border-warning/20', to: '/app/responsabilites/fij-coordination' },
    { label: 'RDV en attente', value: stats.pendingAppointments || 0, icon: CalendarClock, color: 'text-rose-600 bg-rose-500/10 border-rose-400/20', to: '/app/rendez-vous' },
    { label: 'Événements à venir', value: stats.upcomingEvents || 0, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-500/10 border-emerald-400/20', to: '/app/agenda' },
    { label: 'Alertes actives', value: stats.activeAlerts || 0, icon: AlertCircle, color: 'text-danger bg-danger/10 border-danger/20', to: '/app/responsabilites/fij-coordination' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-border border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <Link to="/app" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Retour à l'accueil
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground">Supervision</h1>
              <p className="text-xs text-muted-foreground">Vue globale des indicateurs EJP Nantes</p>
            </div>
          </div>
        </div>

        {/* Indicateurs */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Indicateurs globaux</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {indicators.map((ind, i) => (
              <Link
                key={i}
                to={ind.to}
                className={`glass-card border rounded-2xl p-4 hover:shadow-md transition-all group ${ind.color.split(' ').slice(1).join(' ')}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${ind.color}`}>
                    <ind.icon className="w-4 h-4" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-2xl font-heading font-bold text-foreground">{ind.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{ind.label}</p>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* FIJ overview */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs text-muted-foreground uppercase tracking-widest">FIJ — Vue d'ensemble</h2>
            <Link to="/app/responsabilites/fij-coordination" className="text-xs text-secondary flex items-center gap-1">
              Détails <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="glass-card border border-border rounded-2xl p-5 space-y-3">
            {fijs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune FIJ enregistrée</p>
            ) : (
              fijs.slice(0, 6).map(fij => (
                <div key={fij.id} className="flex items-center gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${fij.status === 'active' ? 'bg-success' : fij.status === 'paused' ? 'bg-warning' : 'bg-muted-foreground'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{fij.name}</p>
                    <p className="text-xs text-muted-foreground">{fij.city} · {fij.member_count || 0} membres</p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    fij.status === 'active' ? 'bg-success/10 text-success' :
                    fij.status === 'paused' ? 'bg-warning/10 text-warning' :
                    'bg-muted/10 text-muted-foreground'
                  }`}>
                    {fij.status === 'active' ? 'Active' : fij.status === 'paused' ? 'En pause' : 'Fermée'}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Alertes actives */}
        {alerts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Alertes actives</h2>
            <div className="space-y-2">
              {alerts.map(alert => (
                <div key={alert.id} className="glass-card border border-danger/20 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-danger" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{alert.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{alert.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Accès rapides supervision */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Outils de supervision</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/app/responsabilites/fij-coordination" className="glass-card border border-border rounded-2xl p-4 hover:shadow-md transition-all">
              <Home className="w-5 h-5 text-secondary mb-3" />
              <p className="text-sm font-semibold text-foreground">Coordination FIJ</p>
              <p className="text-xs text-muted-foreground mt-0.5">CR, relances, pilotes</p>
            </Link>
            <Link to="/app/admin" className="glass-card border border-border rounded-2xl p-4 hover:shadow-md transition-all">
              <FileText className="w-5 h-5 text-primary mb-3" />
              <p className="text-sm font-semibold text-foreground">Administration</p>
              <p className="text-xs text-muted-foreground mt-0.5">Contenus, programmes</p>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function Supervision() {
  return (
    <RoleGuard allowedRoles={['bureau', 'bergere', 'admin']}>
      <SupervisionContent />
    </RoleGuard>
  );
}