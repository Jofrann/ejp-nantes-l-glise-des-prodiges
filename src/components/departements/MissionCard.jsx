import React from 'react';
import { motion } from 'framer-motion';

export default function MissionCard({ icon: Icon, label, text, colors }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 bg-card border border-border rounded-2xl p-4 shadow-sm`}
    >
      <div className={`flex-shrink-0 w-9 h-9 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${colors.text}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm text-foreground/80 leading-relaxed">{text}</p>
      </div>
    </motion.div>
  );
}