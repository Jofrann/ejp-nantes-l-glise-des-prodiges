import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, FileText, AlertTriangle } from 'lucide-react';
import { LoadingSpinner } from '@/components/fij/FijPageShell';
import PageBreadcrumb from '@/components/navigation/PageBreadcrumb';
import { canReadThursdayReport } from '@/lib/fijPermissions';

export default function CrJeudiDetail() {
  const { fijId, reportId } = useParams();
  const [user, setUser] = useState(null);
  const [fij, setFij] = useState(null);
  const [report, setReport] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [reportId]);

  const loadData = async () => {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const f = await base44.entities.FIJ.get(fijId);
      setFij(f);

      if (!canReadThursdayReport(u, f)) {
        setLoading(false);
        return;
      }

      const r = await base44.entities.FijThursdayReport.get(reportId);
      setReport(r);

      const e = await base44.entities.FijAttendanceEntry.filter({ report_id: reportId }, 'member_name', 200);
      setEntries(e || []);
    } catch {
      setReport(null);
    }
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;

  if (!fij || !report) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-5">
        <AlertTriangle className="w-10 h-10 text-muted-foreground mb-3" />
        <p className="text-sm font-semibold mb-1">CR introuvable</p>
        <Link to="/app/responsabilites" className="text-secondary text-sm font-medium">← Retour FIJ</Link>
      </div>
    );
  }

  const present = entries.filter(e => e.present);
  const absent = entries.filter(e => !e.present);
  const late = entries.filter(e => e.late);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-14 z-30 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-2">
          <PageBreadcrumb
            items={[
              { label: 'FIJ', to: '/app/responsabilites' },
              { label: fij.name, to: `/app/responsabilites/fij-pilote/mes-fij/${fijId}` },
              { label: 'CR du jeudi', to: '#' },
            ]}
            backTo={`/app/responsabilites/fij-pilote/mes-fij/${fijId}`}
            backLabel="← Bureau"
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="bg-card border border-border rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-heading font-bold text-foreground">CR du jeudi</h1>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {new Date(report.thursday_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{fij.name}</p>
                {report.submitted_by_name && <p className="text-xs text-muted-foreground">Par {report.submitted_by_name}</p>}
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-foreground">{report.attendance_rate}%</p>
                <p className="text-[10px] text-muted-foreground">taux de présence</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <StatCard icon={CheckCircle2} label="Présents" value={present.length} color="text-success" />
            <StatCard icon={XCircle} label="Absents" value={absent.length} color="text-danger" />
            <StatCard icon={Clock} label="Retards" value={late.length} color="text-warning" />
          </div>

          {/* Présents */}
          {present.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Présents ({present.length})</p>
              <div className="space-y-1">
                {present.map(e => (
                  <div key={e.id} className="bg-card border border-border rounded-lg p-2.5 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success flex-shrink-0" />
                    <span className="text-sm text-foreground">{e.member_name}</span>
                    {e.late && <span className="text-[10px] text-warning bg-warning/10 px-1.5 py-0.5 rounded">Retard</span>}
                    {e.comment && <span className="text-xs text-muted-foreground truncate">— {e.comment}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Absents */}
          {absent.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Absents ({absent.length})</p>
              <div className="space-y-1">
                {absent.map(e => (
                  <div key={e.id} className="bg-card border border-danger/20 rounded-lg p-2.5 flex items-center gap-2">
                    <XCircle className="w-3.5 h-3.5 text-danger flex-shrink-0" />
                    <span className="text-sm text-foreground">{e.member_name}</span>
                    {e.comment && <span className="text-xs text-muted-foreground truncate">— {e.comment}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Note générale */}
          {report.general_note && (
            <div className="bg-card border border-border rounded-2xl p-4 mb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Note générale</p>
              <p className="text-sm text-foreground">{report.general_note}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 text-center">
      <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}