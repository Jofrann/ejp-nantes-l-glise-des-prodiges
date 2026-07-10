import React from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, MapPin, Clock } from 'lucide-react';
import { GROWTH_STATUS_COLORS } from '@/lib/fijPermissions';

export default function FijWorkspaceCard({ fij, members = [], lastReport, user }) {
  const activeMembers = members.filter(m => m.is_active !== false);
  const memberGoal = fij.member_goal || 13;
  const progress = Math.min(100, Math.round((activeMembers.length / memberGoal) * 100));

  const isPilot = fij.pilot_user_id === user?.id;
  const isCopilot = fij.copilot_user_id === user?.id || (fij.co_pilot_user_ids || []).includes(user?.id);
  const roleLabel = isPilot ? 'Pilote' : isCopilot ? 'Copilote' : 'Pilote';

  const basePath = `/app/responsabilites/fij-pilote/mes-fij/${fij.id}`;
  const attendanceRate = lastReport?.attendance_rate || 0;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-foreground">{fij.name}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-secondary/10 text-secondary border border-secondary/20">
                {roleLabel}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <StatusPill status={fij.status} />
              {fij.city && (
                <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                  <MapPin className="w-3 h-3" /> {fij.city}
                </span>
              )}
            </div>
          </div>
        </div>
        {(fij.meeting_day || fij.meeting_time) && (
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {fij.meeting_day || '—'}{fij.meeting_time ? ` à ${fij.meeting_time}` : ''}
          </div>
        )}
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        <Metric label="Membres" value={`${activeMembers.length}/${memberGoal}`} />
        <Metric label="Présence" value={lastReport ? `${attendanceRate}%` : '—'} />
        <Metric label="Dernier CR" value={lastReport ? formatDate(lastReport.thursday_date) : '—'} />
      </div>

      {/* Member progress */}
      <div className="px-4 py-2.5">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
          <span>Objectif membres</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-surface rounded-full overflow-hidden">
          <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Member preview */}
      {activeMembers.length > 0 && (
        <div className="px-4 pb-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">
            Membres actifs ({activeMembers.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {activeMembers.slice(0, 6).map(m => (
              <Link
                key={m.id}
                to={`${basePath}/membres/${m.id}`}
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-opacity hover:opacity-70 ${GROWTH_STATUS_COLORS[m.growth_status] || GROWTH_STATUS_COLORS.passif}`}
              >
                {m.full_name}
              </Link>
            ))}
            {activeMembers.length > 6 && (
              <Link
                to={basePath}
                className="text-[10px] px-2 py-0.5 rounded-full font-medium text-muted-foreground bg-muted hover:opacity-70"
              >
                +{activeMembers.length - 6}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-3 flex gap-2 border-t border-border">
        <Link
          to={basePath}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-foreground bg-surface hover:bg-muted border border-border rounded-xl py-2.5 transition-colors"
        >
          <Users className="w-3.5 h-3.5" /> Bureau
        </Link>
        <Link
          to={`${basePath}/cr-jeudi/nouveau`}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl py-2.5 transition-colors"
        >
          <FileText className="w-3.5 h-3.5" /> CR du jeudi
        </Link>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="px-3 py-2.5 text-center">
      <p className="text-sm font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
    </div>
  );
}

function StatusPill({ status }) {
  const config = {
    active: { label: 'Active', cls: 'bg-success/10 text-success border-success/20' },
    paused: { label: 'En pause', cls: 'bg-warning/10 text-warning border-warning/20' },
    opening: { label: 'Ouverture', cls: 'bg-primary/10 text-primary border-primary/20' },
    closed: { label: 'Fermée', cls: 'bg-muted text-muted-foreground border-border' },
  };
  const c = config[status] || config.active;
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${c.cls}`}>{c.label}</span>;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}