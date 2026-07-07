import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import FijPageShell, { LoadingSpinner, EmptyState } from '@/components/fij/FijPageShell';
import { useFijData } from '@/hooks/useFijData';
import { Users, FileText, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react';

export default function TableauBord() {
  const { user, fijs, loading, accessLevel } = useFijData();
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [openings, setOpenings] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const weekStart = getMonday(new Date());
    Promise.all([
      base44.entities.FijWeeklyReport.filter({ week_start: weekStart }, '-created_date', 200).catch(() => []),
      base44.entities.FijAlert.filter({ status: 'open' }, '-created_date', 50).catch(() => []),
      base44.entities.FijOpeningProcess.filter({}, '-created_date', 50).catch(() => []),
    ]).then(([r, a, o]) => {
      setReports(r || []);
      setAlerts(a || []);
      setOpenings(o || []);
      setDataLoading(false);
    });
  }, [user]);

  const activeFijs = fijs.filter(f => !f.status || f.status === 'active');
  const openingFijs = fijs.filter(f => f.status === 'opening');
  const pausedFijs = fijs.filter(f => f.status === 'paused');
  const totalParticipants = reports.reduce((s, r) => s + (r.participants_count || 0), 0);
  const newVisitors = reports.reduce((s, r) => s + (r.new_visitors_count || 0), 0);
  const crRate = activeFijs.length > 0 ? Math.round((reports.length / activeFijs.length) * 100) : 0;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');

  if (loading || dataLoading) return <LoadingSpinner />;

  const stats = [
    { label: 'FIJ actives', value: activeFijs.length, icon: Users, color: 'text-amber-400' },
    { label: 'En ouverture', value: openingFijs.length, icon: TrendingUp, color: 'text-blue-400' },
    { label: 'En pause', value: pausedFijs.length, icon: AlertTriangle, color: 'text-purple-400' },
    { label: 'Participants', value: totalParticipants, icon: Users, color: 'text-green-400' },
    { label: 'Nouveaux visiteurs', value: newVisitors, icon: Users, color: 'text-rose-400' },
    { label: 'Taux de CR', value: crRate + '%', icon: FileText, color: 'text-amber-400' },
  ];

  const missingCrFijs = activeFijs.filter(f => !reports.some(r => r.fij_house_id === f.id));

  return (
    <FijPageShell
      accessLevel={accessLevel}
      title="Tableau de bord"
      subtitle="Vue globale sur la santé opérationnelle des FIJ"
      requiredRoles={['coordination', 'direction']}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-white/3 border border-white/8 rounded-2xl p-4"
          >
            <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* CR manquants */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs text-gray-500 uppercase tracking-widest">CR manquants cette semaine</h2>
          <Link to="/app/departements/fij/cr-hebdomadaires" className="text-xs text-amber-400/70 hover:text-amber-400 flex items-center gap-1">
            Voir tout <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {missingCrFijs.length === 0 ? (
          <div className="bg-green-500/5 border border-green-500/15 rounded-xl p-4 text-sm text-green-400/80">
            ✓ Tous les CR ont été reçus cette semaine !
          </div>
        ) : (
          <div className="space-y-2">
            {missingCrFijs.slice(0, 5).map(fij => (
              <Link
                key={fij.id}
                to={`/app/departements/fij/fij/${fij.id}`}
                className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-xl p-3 hover:border-amber-400/20 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{fij.name}</p>
                  <p className="text-xs text-gray-500">{fij.pilot_name || 'Pilote non assigné'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Alertes critiques */}
      {criticalAlerts.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs text-gray-500 uppercase tracking-widest">Alertes critiques</h2>
            <Link to="/app/departements/fij/alertes" className="text-xs text-amber-400/70 hover:text-amber-400 flex items-center gap-1">
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {criticalAlerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="flex items-start gap-3 bg-red-500/5 border border-red-500/15 rounded-xl p-3">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{alert.title}</p>
                  {alert.description && <p className="text-xs text-gray-500 mt-0.5">{alert.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top 5 à suivre */}
      <div>
        <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-4">FIJ à suivre</h2>
        <div className="space-y-2">
          {activeFijs.slice(0, 5).map(fij => {
            const fijReports = reports.filter(r => r.fij_house_id === fij.id);
            const lastReport = fijReports[0];
            return (
              <Link
                key={fij.id}
                to={`/app/departements/fij/fij/${fij.id}`}
                className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-xl p-3 hover:border-white/15 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{fij.name}</p>
                  <p className="text-xs text-gray-500">
                    {fij.city} · {fij.member_count || 0} membres
                    {lastReport && ` · ${lastReport.participants_count || 0} cette semaine`}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </FijPageShell>
  );
}

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay() || 7;
  if (day !== 1) date.setHours(-24 * (day - 1));
  return date.toISOString().split('T')[0];
}