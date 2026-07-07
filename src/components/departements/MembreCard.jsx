import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Crown } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function MembreCard({ member: m, index, colors, isAdmin, onDelete, badge }) {
  const handleDelete = async () => {
    if (!confirm(`Retirer ${m.full_name} du département ?`)) return;
    await base44.entities.DepartmentMember.update(m.id, { is_active: false });
    onDelete?.();
  };

  const initials = m.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const joinedStr = m.joined_at
    ? new Date(m.joined_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`flex items-center gap-3 bg-card border border-border rounded-2xl p-3.5 hover:border-secondary/30 transition-colors shadow-sm`}
    >
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden border ${colors.border}`}>
        {m.photo_url ? (
          <img src={m.photo_url} alt={m.full_name} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full ${colors.bg} flex items-center justify-center`}>
            <span className={`text-xs font-bold ${colors.text}`}>{initials}</span>
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground truncate">{m.full_name}</p>
          {badge && (
            <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
              <Crown className="w-2.5 h-2.5" /> {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {m.note && <p className="text-xs text-muted-foreground truncate">{m.note}</p>}
          {joinedStr && <p className="text-xs text-muted-foreground">depuis {joinedStr}</p>}
        </div>
      </div>

      {/* Action admin */}
      {isAdmin && (
        <button
          onClick={handleDelete}
          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-danger transition-colors rounded-lg hover:bg-danger/10 flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.div>
  );
}