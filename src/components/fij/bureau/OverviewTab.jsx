import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Target, FileText, TrendingUp, Calendar } from 'lucide-react';

export default function OverviewTab({ fij, members, reports, basePath }) {
  const lastReport = reports[0];
  const goalProgress = fij.member_goal ? Math.round((members.length / fij.member_goal) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Mission / description */}
      {fij.description && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-sm text-foreground">{fij.description}</p>
        </div>
      )}

      {/* Objectif membres */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-secondary" />
          <p className="text-sm font-semibold text-foreground">Objectif de membres</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
            <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${Math.min(goalProgress, 100)}%` }} />
          </div>
          <span className="text-sm font-medium text-foreground">{members.length}/{fij.member_goal || 13}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{goalProgress}% de l'objectif</p>
      </div>

      {/* Dernier CR */}
      {lastReport ? (
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Dernier CR du jeudi</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                {new Date(lastReport.thursday_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <p className="text-xs text-muted-foreground">
                {lastReport.present_count} présents · {lastReport.absent_count} absents · {lastReport.late_count} retard
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{lastReport.attendance_rate}%</p>
              <p className="text-[10px] text-muted-foreground">présence</p>
            </div>
          </div>
          <Link
            to={`${basePath}/${fij.id}/cr-jeudi/${lastReport.id}`}
            className="text-xs text-secondary font-medium mt-3 inline-block hover:underline"
          >
            Voir le détail →
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <Calendar className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Aucun CR du jeudi pour le moment</p>
        </div>
      )}

      {/* Répartition croissance */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-secondary" />
          <p className="text-sm font-semibold text-foreground">Croissance des membres</p>
        </div>
        <div className="space-y-2">
          {['passif', 'regulier', 'disciple', 'serviteur', 'reproducteur'].map(status => {
            const count = members.filter(m => (m.growth_status || 'passif') === status).length;
            const pct = members.length > 0 ? Math.round((count / members.length) * 100) : 0;
            return (
              <div key={status} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-20 capitalize">{status}</span>
                <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-medium text-foreground w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}