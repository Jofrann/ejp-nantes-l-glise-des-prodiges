import React from 'react';
import { UserCheck, Phone, Calendar, MessageSquare } from 'lucide-react';
import { VISITOR_STATUS_LABELS, VISITOR_STATUS_COLORS, VISITOR_STATUS_OPTIONS, formatDate } from '@/lib/welcomeConstants';

export default function WelcomeIntegrationTab({ welcomeData, isResponsable, currentUserId, colors, onRefresh }) {
  const { visitors = [] } = welcomeData;

  // Seuls les responsables voient la vue intégration complète
  if (!isResponsable) {
    return (
      <div className="text-center py-12">
        <UserCheck className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">La vue intégration est réservée aux responsables Accueil.</p>
      </div>
    );
  }

  const byStatus = {
    new: visitors.filter(v => v.status === 'new'),
    contacted: visitors.filter(v => v.status === 'contacted'),
    in_progress: visitors.filter(v => v.status === 'in_progress'),
    integrated: visitors.filter(v => v.status === 'integrated'),
  };

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Suivi d'intégration</p>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(byStatus).map(([status, list]) => (
            <div key={status} className="text-center">
              <p className="text-xl font-bold text-foreground">{list.length}</p>
              <p className="text-[10px] text-muted-foreground">{VISITOR_STATUS_LABELS[status]}</p>
            </div>
          ))}
        </div>
      </div>

      {VISITOR_STATUS_OPTIONS.filter(o => o.value !== 'closed').map(o => {
        const list = byStatus[o.value] || [];
        if (list.length === 0) return null;
        return (
          <div key={o.value} className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{o.label}</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${VISITOR_STATUS_COLORS[o.value] || ''}`}>{list.length}</span>
            </div>
            <div className="space-y-2">
              {list.map(v => (
                <div key={v.id} className="flex items-center justify-between text-xs bg-surface/50 rounded-lg px-3 py-2">
                  <div>
                    <p className="font-medium text-foreground">{v.first_name} {v.last_name || ''}</p>
                    {v.assigned_to_name && <p className="text-muted-foreground">Suivi : {v.assigned_to_name}</p>}
                  </div>
                  {v.first_visit_date && <span className="text-muted-foreground">{formatDate(v.first_visit_date)}</span>}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {visitors.length === 0 && (
        <div className="text-center py-12">
          <UserCheck className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun visiteur à suivre.</p>
        </div>
      )}
    </div>
  );
}