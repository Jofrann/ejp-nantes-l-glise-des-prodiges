import React from 'react';
import { motion } from 'framer-motion';

const PHOTOS = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
];

export default function NantesSection() {
  return (
    <section className="py-36 px-6 bg-[#0B0B0C]">
      <div className="max-w-screen-lg mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#C8A96A]/70 font-light block mb-6">Notre ville</span>
            <h2 className="font-display text-4xl md:text-5xl text-[#F7F4EF] font-light mb-6 leading-tight">
              Au cœur de Nantes
            </h2>
            <p className="text-[#B8B8B8] text-base leading-relaxed font-light">
              Au cœur de Nantes, l'EJP rassemble une jeunesse appelée à vivre sa foi avec profondeur, joie et engagement. Une église locale, vivante, ancrée dans la ville et tournée vers le monde.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="grid grid-cols-2 gap-2"
          >
            <img src={PHOTOS[0]} alt="Nantes" className="col-span-2 w-full h-44 object-cover" />
            <img src={PHOTOS[1]} alt="Nantes" className="w-full h-28 object-cover" />
            <img src={PHOTOS[2]} alt="Nantes" className="w-full h-28 object-cover" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}