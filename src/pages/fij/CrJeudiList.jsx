import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { FileText, Calendar, Users } from 'lucide-react';
import FijPageShell, { LoadingSpinner, EmptyState } from '@/components/fij/FijPageShell';
import { useFijData } from '@/hooks/useFijData';
import { getCurrentThursday } from '@/lib/fijDateUtils';

export default function CrJeudiList() {
  const { user, fijs, loading, accessLevel } = useFijData();
  const [reports, setReports] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const thursdayDate = getCurrentThursday();

  useEffect(() => {
    if (!user) return;
    const fijIds = fijs.map(f => f.id);
    if (!fijIds.length) { setDataLoading(false); return; }

    base44.entities.FijThursdayReport.filter({}, '-thursday_date', 500)
      .then(r => {
        setReports((r || []).filter(rep => fijIds.includes(rep.fij_id)));
      })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, [user, fijs]);

  if (loading || dataLoading) return <LoadingSpinner />;

  const thisWeekReports = reports.filter(r => r.thursday_date === thursdayDate);
  const previousReports = reports.filter(r => r.thursday_date !== thursdayDate);
  const activeFijs = fijs.filter(f => !f.status || f.status === 'active');
  const missingFijs = activeFijs.filter(f => !thisWeekReports.some(r => r.fij_id === f.id));

  return (
    <FijPageShell
      accessLevel={accessLevel}
      requiredRoles={['coordination', 'admin']}
      title="CR du jeudi"
      subtitle="Suivi des comptes rendus de présence"
      breadcrumbLabel="CR Jeudi"
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <StatCard label="Reçus cette semaine" value={thisWeekReports.length} color="text-success" />
        <StatCard label="Manquants" value={missingFijs.length} color="text-danger" />
        <StatCard label="Total CR" value={reports.length} color="text-primary" />
      </div>

      {/* Missing this week */}
      {missingFijs.length > 0 && (
        <div className="bg-danger/5 border border-danger/20 rounded-xl p-3 mb-4">
          <p className="text-xs font-semibold text-danger mb-2">CR manquants — {new Date(thursdayDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</p>
          <div className="flex flex-wrap gap-1.5">
            {missingFijs.map(f => (
              <Link
                key={f.id}
                to={`/app/departements/fij/coordination/registre/${f.id}`}
                className="text-[10px] bg-danger/10 text-danger px-2 py-0.5 rounded-full hover:bg-danger/20"
              >
                {f.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* This week */}
      {thisWeekReports.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Cette semaine</p>
          <div className="space-y-1.5">
            {thisWeekReports.map(report => (
              <ReportRow key={report.id} report={report} fijs={fijs} />
            ))}
          </div>
        </div>
      )}

      {/* Previous */}
      {previousReports.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Historique</p>
          <div className="space-y-1.5">
            {previousReports.slice(0, 30).map(report => (
              <ReportRow key={report.id} report={report} fijs={fijs} />
            ))}
          </div>
        </div>
      )}

      {reports.length === 0 && (
        <EmptyState icon={FileText} title="Aucun CR du jeudi" sub="Les comptes rendus apparaîtront ici." />
      )}
    </FijPageShell>
  );
}

function ReportRow({ report, fijs }) {
  const fij = fijs.find(f => f.id === report.fij_id);
  return (
    <Link
      to={`/app/departements/fij/coordination/registre/${report.fij_id}/cr-jeudi/${report.id}`}
      className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 hover:border-secondary/30 transition-colors"
    >
      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
        <FileText className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{fij?.name || report.fij_name || 'FIJ'}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(report.thursday_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · {report.present_count}P / {report.absent_count}A
        </p>
      </div>
      <span className="text-sm font-bold text-foreground">{report.attendance_rate}%</span>
    </Link>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 text-center">
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}