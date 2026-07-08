import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Calendar } from 'lucide-react';
import { canCreateThursdayReport } from '@/lib/fijPermissions';

export default function CrJeudiTab({ fij, reports, user, basePath }) {
  const canCreate = canCreateThursdayReport(user, fij);

  return (
    <div className="space-y-3">
      {canCreate && (
        <Link
          to={`${basePath}/${fij.id}/cr-jeudi/nouveau`}
          className="flex items-center justify-center gap-2 w-full px-3 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" /> Faire le CR du jeudi
        </Link>
      )}

      {reports.length === 0 ? (
        <div className="text-center py-10">
          <Calendar className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Aucun CR du jeudi</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {reports.map(report => (
            <Link
              key={report.id}
              to={`${basePath}/${fij.id}/cr-jeudi/${report.id}`}
              className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 hover:border-secondary/30 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {new Date(report.thursday_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {report.present_count} présents · {report.absent_count} absents · {report.late_count} retard
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-foreground">{report.attendance_rate}%</p>
                <StatusPill status={report.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const cfg = {
    draft: { label: 'Brouillon', cls: 'text-muted-foreground bg-muted' },
    submitted: { label: 'Soumis', cls: 'text-primary bg-primary/10' },
    validated: { label: 'Validé', cls: 'text-success bg-success/10' },
  };
  const c = cfg[status] || cfg.draft;
  return <span className={`text-[9px] px-1.5 py-0.5 rounded ${c.cls}`}>{c.label}</span>;
}