import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users, FileText, AlertTriangle, TrendingUp, Heart,
  CheckCircle, ArrowRight, Clock
} from 'lucide-react';

/**
 * FijDirectionSummary — Synthèse FIJ pour le tableau de bord direction global.
 * Affiche les indicateurs clés du réseau FIJ en lecture seule.
 */
export default function FijDirectionSummary() {
  const [fijs, setFijs] = useState([]);
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [openings, setOpenings] = useState([]);
  const [consecrations, setConsecrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const weekStart = getMonday(new Date());

  useEffect(() => {
    Promise.all([
      base44.entities.FIJ.list('display_order', 100),
      base44.entities.FijWeeklyReport.filter({ week_start: weekStart }, '-created_date', 200).catch(() => []),
      base44.entities.FijAlert.filter({ status: 'open' }, '-created_date', 50).catch(() => []),
      base44.entities.FijOpeningProcess.filter({}, '-created_date', 50).catch(() => []),
      base44.entities.FijConsecrationRequest.filter({ status: 'pending' }, '-created_date', 50).catch(() => []),
    ]).then(([f, r, a, o, c]) => {
      setFijs((f || []).filter(x => x.is_active !== false));
      setReports(r || []);
      setAlerts(a || []);
      setOpenings(o || []);
      setConsecrations(c || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="w-6 h-6 border-2 border-border border-t-secondary rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const activeFijs = fijs.filter(f => !f.status || f.status === 'active');
  const pausedFijs = fijs.filter(f => f.status === 'paused');
  const openingFijs = fijs.filter(f => f.status === 'opening');
  const totalParticipants = reports.reduce((s, r) => s + (r.participants_count || 0), 0);
  const newVisitors = reports.reduce((s, r) => s + (r.new_visitors_count || 0), 0);
  const crRate = activeFijs.length > 0 ? Math.round((reports.length / activeFijs.length) * 100) : 0;
  const missingCr = activeFijs.filter(f => !reports.some(r => r.fij_house_id === f.id));
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const fijsWithoutPilot = activeFijs.filter(f => !f.pilot_user_id);
  const pilots = new Set(activeFijs.map(f => f.pilot_user_id).filter(Boolean));
  const copilots = new Set(activeFijs.flatMap(f => f.co_pilot_user_ids || []).filter(Boolean));
  const pendingOpenings = openings.filter(o => o.status !== 'validated' && o.status !== 'rejected');
  const pendingConsecrations = consecrations.filter(c => c.status === 'pending');

  const stats = [
    { label: 'FIJ actives', value: activeFijs.length, icon: Users, color: 'text-secondary' },
    { label: 'En pause', value: pausedFijs.length, icon: Clock, color: 'text-warning' },
    { label: 'En ouverture', value: openingFijs.length, icon: TrendingUp, color: 'text-primary' },
    { label: 'Participants', value: totalParticipants, icon: Heart, color: 'text-rose-600' },
    { label: 'Nouveaux', value: newVisitors, icon: Users, color: 'text-success' },
    { label: 'Pilotes', value: pilots.size, icon: Users, color: 'text-primary' },
    { label: 'Taux CR', value: crRate + '%', icon: FileText, color: 'text-secondary' },
    { label: 'CR manquants', value: missingCr.length, icon: AlertTriangle, color: 'text-warning' },
  ];

  const hasDecisions = pendingOpenings.length > 0 || pendingConsecrations.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-400/20 flex items-center justify-center">
            <Heart className="w-4 h-4 text-rose-600" />
          </div>
          <h2 className="text-foreground font-semibold text-sm">Synthèse FIJ</h2>
        </div>
        <Link to="/app/departements/fij" className="text-xs text-secondary flex items-center gap-1 hover:text-secondary/80">
          Détails <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface border border-border rounded-xl p-3">
            <s.icon className={`w-3.5 h-3.5 ${s.color} mb-1.5`} />
            <p className="text-lg font-bold text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Alertes critiques */}
      {criticalAlerts.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-danger" />
            <p className="text-xs font-semibold text-foreground">Alertes critiques ({criticalAlerts.length})</p>
          </div>
          <div className="space-y-1.5">
            {criticalAlerts.slice(0, 3).map(alert => (
              <div key={alert.id} className="flex items-start gap-2 bg-danger/5 border border-danger/20 rounded-lg p-2.5">
                <AlertTriangle className="w-3 h-3 text-danger flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{alert.title}</p>
                  {alert.fij_name && <p className="text-[10px] text-muted-foreground">{alert.fij_name}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FIJ sans pilote */}
      {fijsWithoutPilot.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-3.5 h-3.5 text-warning" />
            <p className="text-xs font-semibold text-foreground">FIJ sans pilote ({fijsWithoutPilot.length})</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {fijsWithoutPilot.slice(0, 5).map(f => (
              <span key={f.id} className="text-[10px] bg-warning/10 border border-warning/20 text-warning px-2 py-0.5 rounded-full">
                {f.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Décisions à valider */}
      <div>
        <p className="text-xs font-semibold text-foreground mb-2">Décisions à valider</p>
        {hasDecisions ? (
          <div className="space-y-1.5">
            {pendingOpenings.slice(0, 2).map(proc => (
              <Link
                key={proc.id}
                to="/app/departements/fij/coordination/ouvertures"
                className="flex items-center gap-2 bg-surface border border-border rounded-lg p-2.5 hover:border-secondary/30 transition-colors"
              >
                <TrendingUp className="w-3 h-3 text-primary flex-shrink-0" />
                <p className="text-xs text-foreground truncate flex-1">{proc.request_title || proc.fij_name || 'Ouverture'}</p>
                <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              </Link>
            ))}
            {pendingConsecrations.slice(0, 2).map(req => (
              <Link
                key={req.id}
                to="/app/departements/fij/coordination/consecrations"
                className="flex items-center gap-2 bg-surface border border-border rounded-lg p-2.5 hover:border-secondary/30 transition-colors"
              >
                <AlertTriangle className="w-3 h-3 text-warning flex-shrink-0" />
                <p className="text-xs text-foreground truncate flex-1">{req.fij_name || 'FIJ'} — {req.house_address}</p>
                <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-success/5 border border-success/20 rounded-lg p-2.5">
            <CheckCircle className="w-3.5 h-3.5 text-success" />
            <p className="text-xs text-success">Aucune décision en attente.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay() || 7;
  if (day !== 1) date.setHours(-24 * (day - 1));
  return date.toISOString().split('T')[0];
}