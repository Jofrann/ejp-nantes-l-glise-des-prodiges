import React from 'react';
import { Link } from 'react-router-dom';
import { getInitials, STATUS_LABELS, getBadgeLabel } from '@/lib/annuaireConstants';

export default function PersonCard({ person }) {
  const statusInfo = STATUS_LABELS[person.account_status] || STATUS_LABELS.pending;
  const initials = getInitials(person.first_name, person.last_name);

  return (
    <Link
      to={`/app/annuaire/${person.id}`}
      className="block bg-card border border-border rounded-2xl p-4 hover:border-secondary/30 hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-secondary/15 to-secondary/5 border border-secondary/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-secondary overflow-hidden">
          {person.photo_url ? (
            <img src={person.photo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-foreground truncate group-hover:text-secondary transition-colors">
              {person.first_name} {person.last_name}
            </p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusInfo.cls} flex items-center gap-1`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
              {statusInfo.label}
            </span>
          </div>

          {person.internal_identifier && (
            <p className="text-xs text-secondary/80 truncate font-mono mt-0.5">{person.internal_identifier}</p>
          )}

          {/* Badges */}
          {person.badges?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {person.badges.slice(0, 3).map(b => (
                <span key={b} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20 font-medium">
                  {getBadgeLabel(b)}
                </span>
              ))}
              {person.badges.length > 3 && (
                <span className="text-[9px] text-muted-foreground">+{person.badges.length - 3}</span>
              )}
            </div>
          )}

          {/* Départements */}
          {person.departments?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {person.departments.slice(0, 2).map(d => (
                <span key={d.membership_id} className="text-[10px] text-muted-foreground">
                  {d.department_name} <span className="text-secondary/70">— {d.role_in_dept}</span>
                </span>
              ))}
              {person.departments.length > 2 && (
                <span className="text-[10px] text-muted-foreground">+{person.departments.length - 2}</span>
              )}
            </div>
          )}

          {/* FIJ */}
          {person.fij_assignments?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {person.fij_assignments.map((f, i) => (
                <span key={i} className="text-[10px] text-rose-600">
                  Pilote FIJ — {f.fij_name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}