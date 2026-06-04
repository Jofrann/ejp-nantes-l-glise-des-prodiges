import React from 'react';
import { motion } from 'framer-motion';

const PILLARS = [
  { label: 'Foi', text: 'Grandir dans une relation vivante et profonde avec Dieu.' },
  { label: 'Famille', text: 'Marcher ensemble dans l\'amour, l\'unité et la fraternité.' },
  { label: 'Service', text: 'Découvrir, développer et exercer ses dons au service de Dieu et des autres.' },
];

export default function VisionSection({ title, text }) {
  return (
    <section id="vision" className="py-36 px-6 bg-[#F7F4EF]/75 backdrop-blur-md">
      <div className="max-w-screen-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="max-w-2xl mb-20"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#C8A96A] font-medium block mb-5">Notre vision</span>
          <h2 className="font-display text-4xl md:text-6xl text-[#0B0B0C] leading-tight font-light mb-8">
            {title || 'Conduire une génération'}
          </h2>
          <p className="text-[#6B6B6B] text-base leading-relaxed font-light">
            {text || "L'EJP Nantes existe pour conduire une génération de jeunes à connaître Dieu, grandir dans la foi, découvrir ses dons et prendre sa place dans le corps de Christ."}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#E5E0D8]">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className="bg-[#F7F4EF]/70 p-10"
            >
              <span className="font-display text-5xl text-[#E5E0D8] font-light block mb-4">0{i + 1}</span>
              <h3 className="text-[#0B0B0C] font-medium text-base mb-3 tracking-wide">{pillar.label}</h3>
              <p className="text-[#6B6B6B] text-sm leading-relaxed font-light">{pillar.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}