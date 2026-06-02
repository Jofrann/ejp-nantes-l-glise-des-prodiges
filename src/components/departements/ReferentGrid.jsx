import React from 'react';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';

export default function ReferentGrid({ referents, colors, isAdmin, onDelete }) {
  if (referents.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Crown className={`w-4 h-4 ${colors.text}`} />
        <h2 className={`text-xs uppercase tracking-widest font-semibold ${colors.text}`}>
          Référent{referents.length > 1 ? 's' : ''}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {referents.map((m, i) => {
          const initials = m.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`relative flex items-center gap-4 bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-2xl p-4`}
            >
              {/* Avatar large */}
              <div className={`w-14 h-14 rounded-2xl flex-shrink-0 overflow-hidden border ${colors.border} shadow-lg`}>
                {m.photo_url ? (
                  <img src={m.photo_url} alt={m.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full ${colors.bg} flex items-center justify-center`}>
                    <span className={`text-lg font-bold ${colors.text}`}>{initials}</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{m.full_name}</p>
                {m.note && <p className={`text-xs ${colors.text} opacity-80 truncate mt-0.5`}>{m.note}</p>}
                <div className={`inline-flex items-center gap-1 mt-1.5 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/20 ${colors.text}`}>
                  <Crown className="w-2.5 h-2.5" /> Référent
                </div>
              </div>

              {isAdmin && (
                <DeleteButton onDelete={async () => {
                  if (!confirm(`Retirer ${m.full_name} ?`)) return;
                  const { base44 } = await import('@/api/base44Client');
                  await base44.entities.DepartmentMember.update(m.id, { is_active: false });
                  onDelete?.();
                }} />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function DeleteButton({ onDelete }) {
  return (
    <button
      onClick={onDelete}
      className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-gray-700 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}