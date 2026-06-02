import React from 'react';
import { motion } from 'framer-motion';

const NANTES_PHOTOS = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80',
];

export default function NantesSection() {
  return (
    <section className="py-28 px-6 bg-slate-950 relative overflow-hidden">
      <div className="max-w-screen-lg mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-xs uppercase tracking-[0.3em] text-amber-400/80 font-medium">Notre ville</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-6">Au cœur de Nantes</h2>
            <p className="text-gray-400 leading-relaxed text-base mb-6">
              Au cœur de Nantes, l'EJP rassemble une jeunesse appelée à vivre sa foi avec profondeur, joie et engagement. Une église locale, vivante, ancrée dans la ville et tournée vers le monde.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
            >
              Nous rejoindre →
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 gap-3"
          >
            <img src={NANTES_PHOTOS[0]} alt="Nantes" className="rounded-2xl object-cover h-40 w-full col-span-2" />
            <img src={NANTES_PHOTOS[1]} alt="Nantes" className="rounded-2xl object-cover h-32 w-full" />
            <img src={NANTES_PHOTOS[2]} alt="Nantes" className="rounded-2xl object-cover h-32 w-full" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}