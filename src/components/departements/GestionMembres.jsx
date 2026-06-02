import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { UserPlus, Trash2, Crown, User, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GestionMembres({ members, colors, departmentId, existingUserIds, onReload, onOpenAdd }) {
  const [open, setOpen] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [changingRole, setChangingRole] = useState(null);

  const handleRemove = async (m) => {
    if (!confirm(`Retirer ${m.full_name} du département ?`)) return;
    setRemoving(m.id);
    await base44.entities.DepartmentMember.update(m.id, { is_active: false });
    setRemoving(null);
    onReload();
  };

  const toggleRole = async (m) => {
    const newRole = m.role_in_dept === 'referent' ? 'membre' : 'referent';
    setChangingRole(m.id);
    await base44.entities.DepartmentMember.update(m.id, { role_in_dept: newRole });
    setChangingRole(null);
    onReload();
  };

  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden mb-6">
      {/* Header section */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded-lg ${colors.bg} flex items-center justify-center`}>
            <User className={`w-3 h-3 ${colors.text}`} />
          </div>
          <span className="text-sm font-semibold text-white">Gestion des membres</span>
          <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{members.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onOpenAdd(); }}
            className={`flex items-center gap-1.5 text-xs ${colors.bg} border ${colors.border} ${colors.text} px-2.5 py-1.5 rounded-lg hover:brightness-125 transition-all`}
          >
            <UserPlus className="w-3 h-3" /> Ajouter
          </button>
          {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </div>
      </button>

      {/* Liste */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {members.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-600">
                <p className="text-sm">Aucun membre dans ce département.</p>
                <button
                  onClick={onOpenAdd}
                  className={`mt-3 text-xs ${colors.text} hover:underline`}
                >
                  + Ajouter le premier membre
                </button>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {members.map(m => {
                  const initials = m.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
                  const isReferent = m.role_in_dept === 'referent';

                  return (
                    <div key={m.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors">
                      {/* Avatar */}
                      <div className={`w-9 h-9 rounded-full flex-shrink-0 overflow-hidden border ${colors.border}`}>
                        {m.photo_url ? (
                          <img src={m.photo_url} alt={m.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full ${colors.bg} flex items-center justify-center`}>
                            <span className={`text-[11px] font-bold ${colors.text}`}>{initials}</span>
                          </div>
                        )}
                      </div>

                      {/* Infos */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-white truncate">{m.full_name}</p>
                          {isReferent && (
                            <span className={`flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full ${colors.bg} ${colors.text} flex-shrink-0`}>
                              <Crown className="w-2 h-2" /> Réf.
                            </span>
                          )}
                        </div>
                        {m.note && <p className="text-xs text-gray-600 truncate">{m.note}</p>}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* Toggle rôle */}
                        <button
                          onClick={() => toggleRole(m)}
                          disabled={changingRole === m.id}
                          title={isReferent ? 'Rétrograder en membre' : 'Promouvoir référent'}
                          className={`text-xs px-2 py-1 rounded-lg border transition-all disabled:opacity-50 ${
                            isReferent
                              ? 'border-white/10 text-gray-500 hover:text-white hover:border-white/20 bg-white/3'
                              : `${colors.border} ${colors.text} ${colors.bg} hover:brightness-125`
                          }`}
                        >
                          <Crown className="w-3 h-3" />
                        </button>

                        {/* Retirer */}
                        <button
                          onClick={() => handleRemove(m)}
                          disabled={removing === m.id}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all disabled:opacity-50"
                        >
                          {removing === m.id
                            ? <div className="w-3 h-3 border border-gray-500 border-t-transparent rounded-full animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />
                          }
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}