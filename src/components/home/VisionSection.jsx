import React from 'react';
import { motion } from 'framer-motion';

export default function VisionSection({ title, text }) {
  if (!title && !text) return null;

  return (
    <section className="py-28 px-6 relative overflow-hidden">
      {/* Fond décoratif */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-slate-900/50 to-gray-950" />
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle at 30% 50%, #f59e0b 0%, transparent 60%), radial-gradient(circle at 70% 50%, #3b82f6 0%, transparent 60%)'
      }} />

      <div className="relative max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block text-xs uppercase tracking-widest text-amber-400 font-medium mb-4 border border-amber-400/20 px-3 py-1 rounded-full">
            Notre Vision
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-8">
            {title || 'La Vision de l\'Église'}
          </h2>
          <div className="relative">
            <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-amber-400/50 to-transparent" />
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed pl-8 text-left italic">
              "{text || 'Aller, faire de toutes les nations des disciples...'}"
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}