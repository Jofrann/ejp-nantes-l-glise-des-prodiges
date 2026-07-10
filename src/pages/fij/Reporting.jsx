import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import FijPageShell, { LoadingSpinner } from '@/components/fij/FijPageShell';
import { useFijData } from '@/hooks/useFijData';
import { TrendingUp, Users, FileText, AlertTriangle, Download, Send } from 'lucide-react';

export default function Reporting() {
  const { user, fijs, loading, accessLevel } = useFijData();
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [period, setPeriod] = useState('weekly');

  useEffect(() => {
    if (!user) return;
    const weekStart = getMonday(new Date());
    Promise.all([
      base44.entities.FijWeeklyReport.filter({ week_start: weekStart }, '-created_date', 200).catch(() => []),
      base44.entities.FijAlert.filter({ status: 'open' }, '-created_date', 50).catch(() => []),
    ]).then(([r, a]) => {
      setReports(r || []);
      setAlerts(a || []);
      setDataLoading(false);
    });
  }, [user]);

  if (loading || dataLoading) return <LoadingSpinner />;

  const activeFijs = fijs.filter(f => !f.status || f.status === 'active');
  const totalParticipants = reports.reduce((s, r) => s + (r.participants_count || 0), 0);
  const newVisitors = reports.reduce((s, r) => s + (r.new_visitors_count || 0), 0);
  const crReceived = reports.length;
  const crExpected = activeFijs.length;
  const missingCr = activeFijs.filter(f => !reports.some(r => r.fij_house_id === f.id));
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');

  // FIJ en difficulté (pas de CR ou low attendance)
  const strugglingFijs = activeFijs.filter(f => {
    const r = reports.find(rep => rep.fij_house_id === f.id);
    return !r || (r.participants_count || 0) < 3;
  });

  const sendToDirection = async () => {
    await base44.entities.DepartmentReport.create({
      department_name: 'FIJ',
      period_type: period,
      period_start: getMonday(new Date()),
      period_end: new Date().toISOString().split('T')[0],
      submitted_by_name: user?.full_name,
      status: 'submitted',
      summary: `${activeFijs.length} FIJ actives, ${totalParticipants} participants, ${newVisitors} nouveaux visiteurs, ${crReceived}/${crExpected} CR reçus.`,
      difficulties: strugglingFijs.length > 0 ? `${strugglingFijs.length} FIJ en difficulté: ${strugglingFijs.map(f => f.name).join(', ')}` : 'Aucune difficulté majeure.',
      needs: missingCr.length > 0 ? `${missingCr.length} CR manquants à relancer.` : 'Aucun besoin particulier.',
      alerts: criticalAlerts.length > 0 ? `${criticalAlerts.length} alertes critiques ouvertes.` : 'Aucune alerte critique.',
      metrics_json: { activeFijs: activeFijs.length, totalParticipants, newVisitors, crReceived, crExpected, missingCr: missingCr.length },
    });
    alert('Bilan envoyé à la direction');
  };

  const exportCsv = () => {
    const rows = [
      ['FIJ', 'Ville', 'Participants', 'Nouveaux', 'Statut CR'],
      ...activeFijs.map(f => {
        const r = reports.find(rep => rep.fij_house_id === f.id);
        return [f.name, f.city, r?.participants_count || 0, r?.new_visitors_count || 0, r?.status || 'manquant'];
      })
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `fij_bilan_${getMonday(new Date())}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <FijPageShell
      accessLevel={accessLevel}
      title="Reporting"
      subtitle="Bilans hebdomadaires et mensuels FIJ"
      requiredRoles={['coordination', 'direction']}
    >
      {/* Sélecteur période */}
      <div className="flex gap-1 mb-6">
        {[
          { v: 'weekly', l: 'Hebdomadaire' },
          { v: 'monthly', l: 'Mensuel' },
        ].map(f => (
          <button key={f.v} onClick={() => setPeriod(f.v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              period === f.v ? 'bg-secondary/15 text-secondary border border-secondary/20' : 'text-muted-foreground hover:text-foreground border border-transparent'
            }`}>
            {f.l}
          </button>
        ))}
      </div>

      {/* Indicateurs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <StatCard icon={Users} label="FIJ actives" value={activeFijs.length} color="text-secondary" />
        <StatCard icon={Users} label="Participants" value={totalParticipants} color="text-success" />
        <StatCard icon={TrendingUp} label="Nouveaux visiteurs" value={newVisitors} color="text-rose-600" />
        <StatCard icon={FileText} label="CR reçus" value={`${crReceived}/${crExpected}`} color="text-primary" />
        <StatCard icon={AlertTriangle} label="CR manquants" value={missingCr.length} color="text-danger" />
        <StatCard icon={AlertTriangle} label="Alertes critiques" value={criticalAlerts.length} color="text-warning" />
      </div>

      {/* Résumé synthétique */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-6 shadow-sm">
        <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Résumé synthétique</h2>
        <p className="text-sm text-foreground/80 leading-relaxed">
          {period === 'weekly' ? 'Cette semaine' : 'Ce mois'}, {activeFijs.length} FIJ actives ont accueilli {totalParticipants} participants
          dont {newVisitors} nouveaux visiteurs. {crReceived} CR sur {crExpected} attendus ont été reçus
          {missingCr.length > 0 ? `, avec ${missingCr.length} manquant(s)` : ', tous reçus'}.
          {criticalAlerts.length > 0 ? ` ${criticalAlerts.length} alerte(s) critique(s) à traiter.` : ' Aucune alerte critique.'}
        </p>
      </div>

      {/* FIJ en difficulté */}
      {strugglingFijs.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">FIJ en difficulté</h2>
          <div className="space-y-2">
            {strugglingFijs.map(f => (
              <Link key={f.id} to={`/app/responsabilites/fij-pilote/fij/${f.id}`}
                className="flex items-center gap-3 bg-warning/5 border border-warning/20 rounded-xl p-3 hover:border-warning/40 transition-colors">
                <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.city}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={sendToDirection} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl py-2.5 transition-colors">
          <Send className="w-3.5 h-3.5" /> Envoyer à la direction
        </button>
        <button onClick={exportCsv} className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground border border-border rounded-xl px-4 py-2.5 hover:bg-surface transition-colors">
          <Download className="w-3.5 h-3.5" /> CSV
        </button>
      </div>
    </FijPageShell>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
      <Icon className={`w-4 h-4 ${color} mb-1.5`} />
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">{label}</p>
    </div>
  );
}

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay() || 7;
  if (day !== 1) date.setHours(-24 * (day - 1));
  return date.toISOString().split('T')[0];
}