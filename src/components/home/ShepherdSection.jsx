import React from 'react';
import { motion } from 'framer-motion';

export default function ShepherdSection({ shepherd }) {
  if (!shepherd) return null;

  const name = `${shepherd.first_name} ${shepherd.last_name}`;

  return (
    <section className="py-28 px-6 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(ellipse at 0% 50%, #f59e0b, transparent 60%)' }} />

      <div className="max-w-screen-lg mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            {shepherd.photo_url ? (
              <img
                src={shepherd.photo_url}
                alt={name}
                className="w-72 h-72 md:w-80 md:h-80 rounded-3xl object-cover border border-white/10"
              />
            ) : (
              <div className="w-72 h-72 rounded-3xl bg-gradient-to-br from-amber-500/20 to-purple-700/20 border border-white/10 flex items-center justify-center text-5xl font-bold text-amber-400">
                {shepherd.first_name?.[0]}{shepherd.last_name?.[0]}
              </div>
            )}
          </motion.div>

          {/* Texte */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-xs uppercase tracking-[0.3em] text-amber-400/80 font-medium">Notre bergère</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-2">{name}</h2>
            <p className="text-amber-400/80 text-sm font-medium mb-6">{shepherd.role}</p>
            <p className="text-gray-400 leading-relaxed text-base">
              {shepherd.bio || `Sous la conduite de notre Bergère ${name}, l'EJP Nantes accompagne les jeunes dans leur croissance spirituelle, leur engagement et leur service au sein de l'Église.`}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}