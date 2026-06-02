import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Sparkles } from 'lucide-react';

const PILLARS = [
  { icon: Heart, label: 'Foi', text: 'Grandir dans une relation vivante et profonde avec Dieu.' },
  { icon: Users, label: 'Famille', text: 'Marcher ensemble dans l\'amour, l\'unité et la fraternité.' },
  { icon: Sparkles, label: 'Service', text: 'Découvrir ses dons et les mettre au service de Dieu et des autres.' },
];

export default function VisionSection({ title, text }) {
  return (
    <section id="vision" className="py-28 px-6 bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, #f59e0b, transparent 70%)' }} />

      <div className="max-w-screen-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-amber-400/80 font-medium">Qui nous sommes</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mt-3 mb-6">
            {title || 'Notre vision'}
          </h2>
          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed italic border-l-2 border-amber-400/40 pl-5 text-left">
            {text || "L'Église des Jeunes Prodiges existe pour conduire une génération de jeunes à connaître Dieu, découvrir leur identité, développer leurs dons et prendre leur place dans le corps de Christ."}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/8 hover:border-amber-400/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center mb-5">
                <pillar.icon className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{pillar.label}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{pillar.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}