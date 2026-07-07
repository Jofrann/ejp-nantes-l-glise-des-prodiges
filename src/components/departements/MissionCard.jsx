import React from 'react';
import { motion } from 'framer-motion';

export default function MissionCard({ icon: Icon, label, text, colors }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 bg-white/3 border border-white/8 rounded-2xl p-4`}
    >
      <div className={`flex-shrink-0 w-9 h-9 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${colors.text}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm text-gray-300 leading-relaxed">{text}</p>
      </div>
    </motion.div>
  );
}