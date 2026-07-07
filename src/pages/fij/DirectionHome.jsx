import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import FijPageShell, { LoadingSpinner } from '@/components/fij/FijPageShell';
import { useFijData } from '@/hooks/useFijData';
import { Users, FileText, AlertTriangle, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';

export default function DirectionHome() {
  const { user, fijs, loading, accessLevel } = useFijData();
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [openings, setOpenings] = useState([]);
  const [consecrations, setConsecrations] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const weekStart = getMonday(new Date());

  useEffect(() => {
    if (!user) return;
    Promise.all([
      base44.entities.FijWeeklyReport.filter({ week_start: weekStart }, '-created_date', 200).catch(() => []),
      base44.entities.FijAlert.filter({ status: 'open' }, '-created_date', 50).catch(() => []),
      base44.entities.FijOpeningProcess.filter({}, '-created_date', 50).catch(() => []),
      base44.entities.FijConsecrationRequest.filter({ status: 'pending' }, '-created_date', 50).catch(() => []),
    ]).then(([r, a, o, c]) => {
      setReports(r || []);
      setAlerts(a || []);
      setOpenings(o || []);
      setConsecrations(c || []);
      setDataLoading(false);
    });
  }, [user]);

  if (loading || dataLoading) return <LoadingSpinner />;

  const activeFijs = fijs.filter(f => !f.status || f.status === 'active');
  const openingFijs = fijs.filter(f => f.status === 'opening');
  const pausedFijs = fijs.filter(f => f.status === 'paused');
  const totalParticipants = reports.reduce((s, r) => s + (r.participants_count || 0), 0);
  const newVisitors = reports.reduce((s, r) => s + (r.new_visitors_count || 0), 0);
  const crRate = activeFijs.length > 0 ? Math.round((reports.length / activeFijs.length) * 100) : 0;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const pendingOpenings = openings.filter(o => o.status !== 'validated' && o.status !== 'rejected');
  const pendingConsecrations = consecrations.filter(c => c.status === 'pending');

  const stats = [
    { label: 'FIJ actives', value: activeFijs.length, icon: Users, color: 'text-secondary' },
    { label: 'En ouverture', value: openingFijs.length, icon: TrendingUp, color: 'text-primary' },
    { label: 'Participants', value: totalParticipants, icon: Users, color: 'text-success' },
    { label: 'Nouveaux', value: newVisitors, icon: Users, color: 'text-rose-600' },
    { label: 'Taux CR', value: crRate + '%', icon: FileText, color: 'text-secondary' },
    { label: 'Alertes critiques', value: criticalAlerts.length, icon: AlertTriangle, color: 'text-danger' },
  ];

  return (
    <FijPageShell
      accessLevel={accessLevel}
      title="Synthèse Direction"
      subtitle="Vue globale du réseau FIJ et décisions à valider"
    >
      {/* Indicateurs globaux */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-card border border-border rounded-2xl p-4 shadow-sm"
          >
            <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Décisions à valider */}
      <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Décisions à valider</h2>
      <div className="space-y-2 mb-8">
        {pendingOpenings.length === 0 && pendingConsecrations.length === 0 ? (
          <div className="bg-success/5 border border-success/20 rounded-xl p-4 text-sm text-success flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Aucune décision en attente.
          </div>
        ) : (
          <>
            {pendingOpenings.slice(0, 3).map(proc => (
              <Link
                key={proc.id}
                to="/app/departements/fij/coordination/ouvertures"
                className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-secondary/30 transition-colors shadow-sm"
              >
                <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{proc.request_title || proc.fij_name || 'Ouverture'}</p>
                  <p className="text-xs text-muted-foreground">Ouverture en cours · {proc.status}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </Link>
            ))}
            {pendingConsecrations.slice(0, 3).map(req => (
              <Link
                key={req.id}
                to="/app/departements/fij/coordination/consecrations"
                className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-secondary/30 transition-colors shadow-sm"
              >
                <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{req.fij_name || 'FIJ'}</p>
                  <p className="text-xs text-muted-foreground truncate">{req.house_address}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </Link>
            ))}
          </>
        )}
      </div>

      {/* Alertes critiques */}
      {criticalAlerts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Alertes critiques</h2>
          <div className="space-y-2">
            {criticalAlerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="flex items-start gap-3 bg-danger/5 border border-danger/20 rounded-xl p-3">
                <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{alert.title}</p>
                  {alert.description && <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>}
                  {alert.fij_name && <p className="text-[10px] text-muted-foreground mt-1">{alert.fij_name}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FIJ en pause */}
      {pausedFijs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">FIJ en pause ({pausedFijs.length})</h2>
          <div className="space-y-2">
            {pausedFijs.slice(0, 5).map(fij => (
              <Link
                key={fij.id}
                to={`/app/departements/fij/fij/${fij.id}`}
                className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-secondary/30 transition-colors shadow-sm"
              >
                <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{fij.name}</p>
                  <p className="text-xs text-muted-foreground">{fij.city} · {fij.pilot_name || '—'}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Accès espace coordination */}
      <Link
        to="/app/departements/fij/coordination"
        className="flex items-center gap-3 bg-surface border border-border rounded-xl p-4 hover:border-secondary/30 transition-colors"
      >
        <Users className="w-5 h-5 text-secondary flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Espace Coordination</p>
          <p className="text-xs text-muted-foreground">Accès opérationnel complet au réseau FIJ</p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
      </Link>
    </FijPageShell>
  );
}

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay() || 7;
  if (day !== 1) date.setHours(-24 * (day - 1));
  return date.toISOString().split('T')[0];
}