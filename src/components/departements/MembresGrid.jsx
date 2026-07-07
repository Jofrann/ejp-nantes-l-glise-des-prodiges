import React from 'react';
import { motion } from 'framer-motion';
import { Users, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function MembresGrid({ membres, colors, isAdmin, onDelete }) {
  const handleDelete = async (m) => {
    if (!confirm(`Retirer ${m.full_name} du département ?`)) return;
    await base44.entities.DepartmentMember.update(m.id, { is_active: false });
    onDelete?.();
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
          Membres <span className="text-muted-foreground/60 font-normal ml-1">({membres.length})</span>
        </h2>
      </div>

      {membres.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
          <p className="text-sm">Aucun membre pour l'instant.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {membres.map((m, i) => {
            const initials = m.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
            const joinedStr = m.joined_at
              ? new Date(m.joined_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
              : null;

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="group flex items-center gap-3 bg-card border border-border hover:border-secondary/30 rounded-xl p-3 transition-all shadow-sm"
              >
                {/* Avatar compact */}
                <div className={`w-9 h-9 rounded-xl flex-shrink-0 overflow-hidden border ${colors.border}`}>
                  {m.photo_url ? (
                    <img src={m.photo_url} alt={m.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full ${colors.bg} flex items-center justify-center`}>
                      <span className={`text-[11px] font-bold ${colors.text}`}>{initials}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{m.full_name}</p>
                  <div className="flex items-center gap-2">
                    {m.note && <p className="text-xs text-muted-foreground truncate">{m.note}</p>}
                    {joinedStr && !m.note && <p className="text-xs text-muted-foreground">{joinedStr}</p>}
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => handleDelete(m)}
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-danger transition-all rounded-lg hover:bg-danger/10 flex-shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}