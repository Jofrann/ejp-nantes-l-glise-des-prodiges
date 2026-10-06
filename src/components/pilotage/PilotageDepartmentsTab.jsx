import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Users } from 'lucide-react';
import { HEALTH_META } from '@/lib/pilotageConstants';

export default function PilotageDepartmentsTab({ data }) {
  const departments = data?.departments || [];

  if (departments.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Aucun département actif.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {departments.map((dept) => {
        const meta = HEALTH_META[dept.health_status] || HEALTH_META.stable;
        return (
          <Link
            key={dept.id}
            to={`/app/pilotage/departements/${dept.slug}`}
            className="glass-card border border-border rounded-2xl p-5 hover:shadow-md transition-all block group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-base font-heading font-bold text-foreground">{dept.name}</p>
                  {dept.short_name && (
                    <span className="text-[10px] text-muted-foreground bg-surface border border-border rounded px-1.5 py-0.5">{dept.short_name}</span>
                  )}
                </div>
                {dept.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-1">{dept.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{dept.member_count}</span> membre{dept.member_count > 1 ? 's' : ''}
                  </span>
                  <span className="text-muted-foreground">
                    {dept.responsible_name ? `Resp. : ${dept.responsible_name}` : 'Sans responsable'}
                  </span>
                  {dept.alert_count > 0 && (
                    <span className="text-danger">{dept.alert_count} alerte{dept.alert_count > 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${meta.bg} ${meta.color} flex items-center gap-1.5`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                  {dept.health_label}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}