import React from 'react';
import { formatDate } from '@/lib/annuaireConstants';

const ACTION_LABELS = {
  user_create: { label: 'Compte créé', icon: '✨' },
  user_update: { label: 'Profil mis à jour', icon: '✏️' },
  user_suspended: { label: 'Compte suspendu', icon: '⏸️' },
  user_active: { label: 'Compte réactivé', icon: '▶️' },
  user_archived: { label: 'Compte archivé', icon: '📦' },
  badges_update: { label: 'Badges modifiés', icon: '🏅' },
  membership_add: { label: 'Ajoutée à un département', icon: '➕' },
  membership_remove: { label: 'Retirée d\u2019un département', icon: '➖' },
  membership_role_change: { label: 'Rôle modifié', icon: '🔄' },
  fij_pilot_assign: { label: 'Assignée comme pilote FIJ', icon: '❤️' },
  user_migration: { label: 'Migration de compte', icon: '🔧' },
  access_denied: { label: 'Accès refusé', icon: '🚫' },
};

export default function FicheHistorique({ auditLogs }) {
  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-muted-foreground">Aucun événement enregistré.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />

      <div className="space-y-4">
        {auditLogs.map((log, i) => {
          const info = ACTION_LABELS[log.action] || { label: log.action, icon: '•' };
          return (
            <div key={log.id || i} className="relative pl-10">
              {/* Dot */}
              <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full bg-card border-2 border-secondary/40 flex items-center justify-center text-[8px]">
                {info.icon}
              </div>

              <div className="bg-card border border-border rounded-xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{info.label}</p>
                    {log.details && (
                      <p className="text-xs text-muted-foreground mt-0.5">{log.details}</p>
                    )}
                    {log.performed_by_name && log.performed_by_id !== log.entity_id && (
                      <p className="text-[10px] text-muted-foreground/60 mt-1">par {log.performed_by_name}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap">
                    {formatDate(log.created_date)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}