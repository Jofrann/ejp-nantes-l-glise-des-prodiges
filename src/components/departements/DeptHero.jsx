import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import DeptIcon from './DeptIcon';

export default function DeptHero({ dept, colors, memberCount, referentCount, isAdmin, onAddClick }) {
  return (
    <div className="relative">
      {/* Bannière */}
      <div className="relative h-44 md:h-56 overflow-hidden rounded-2xl mb-0">
        {dept.cover_url ? (
          <img src={dept.cover_url} alt={dept.name} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full ${colors.bg} flex items-center justify-center`}>
            <DeptIcon name={dept.icon} className={`w-20 h-20 ${colors.text} opacity-10`} />
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />

        {/* Back button sur la bannière */}
        <Link
          to="/app/departements"
          className="absolute top-4 left-4 flex items-center gap-1.5 text-xs text-foreground/70 hover:text-foreground bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all border border-border"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Retour
        </Link>
      </div>

      {/* Identité flottante sur la bannière */}
      <div className="px-5 -mt-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {/* Icône + nom */}
          <div className="flex items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className={`w-16 h-16 rounded-2xl ${colors.bg} border-2 ${colors.border} flex items-center justify-center flex-shrink-0 shadow-xl bg-card`}>
                <DeptIcon name={dept.icon} className={`w-7 h-7 ${colors.text}`} />
              </div>
              <div className="pb-1">
                <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">{dept.name}</h1>
                {dept.description && (
                  <p className={`text-xs ${colors.text} opacity-80 mt-0.5`}>{dept.description}</p>
                )}
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={onAddClick}
                className={`flex items-center gap-1.5 text-xs ${colors.bg} border ${colors.border} ${colors.text} px-3 py-2 rounded-xl hover:brightness-110 transition-all flex-shrink-0 mb-1`}
              >
                <UserPlus className="w-3.5 h-3.5" /> Ajouter
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-4 mb-6">
            <div className={`flex items-center gap-1.5 text-xs ${colors.text} bg-card border ${colors.border} rounded-full px-3 py-1 shadow-sm`}>
              <span className="font-bold">{memberCount}</span>
              <span className="opacity-70">membre{memberCount > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card border border-border rounded-full px-3 py-1 shadow-sm">
              <span className="font-bold">{referentCount}</span>
              <span className="opacity-70">référent{referentCount > 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Mission */}
          {dept.mission && (
            <div className={`border-l-2 ${colors.border} pl-4 mb-6`}>
              <p className="text-sm text-muted-foreground leading-relaxed italic">{dept.mission}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}