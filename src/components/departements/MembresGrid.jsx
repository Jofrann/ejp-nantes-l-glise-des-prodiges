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
        <Users className="w-4 h-4 text-gray-400" />
        <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-400">
          Membres <span className="text-gray-600 font-normal ml-1">({membres.length})</span>
        </h2>
      </div>

      {membres.length === 0 ? (
        <div className="text-center py-10 text-gray-600">
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
                className="group flex items-center gap-3 bg-white/3 border border-white/8 hover:border-white/15 rounded-xl p-3 transition-all"
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
                  <p className="text-sm font-semibold text-white truncate">{m.full_name}</p>
                  <div className="flex items-center gap-2">
                    {m.note && <p className="text-xs text-gray-500 truncate">{m.note}</p>}
                    {joinedStr && !m.note && <p className="text-xs text-gray-600">{joinedStr}</p>}
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => handleDelete(m)}
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center text-gray-700 hover:text-red-400 transition-all rounded-lg hover:bg-red-400/10 flex-shrink-0"
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