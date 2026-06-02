import React from 'react';
import { motion } from 'framer-motion';

export default function ShepherdSection({ shepherd }) {
  if (!shepherd) return null;
  const name = `${shepherd.first_name} ${shepherd.last_name}`;

  return (
    <section className="py-36 px-6 bg-[#0B0B0C]">
      <div className="max-w-screen-lg mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="order-2 md:order-1"
          >
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#C8A96A]/70 font-light block mb-6">Notre bergère</span>
            <h2 className="font-display text-4xl md:text-5xl text-[#F7F4EF] font-light mb-2 leading-tight">
              {name}
            </h2>
            <p className="text-[#C8A96A]/70 text-xs tracking-[0.2em] uppercase mb-8">{shepherd.role}</p>
            <p className="text-[#B8B8B8] text-base leading-relaxed font-light">
              {shepherd.bio || `Sous la conduite de notre Bergère ${name}, l'EJP Nantes accompagne les jeunes dans leur croissance spirituelle, leur engagement et leur service au sein de l'Église.`}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="order-1 md:order-2 flex justify-center"
          >
            {shepherd.photo_url ? (
              <img
                src={shepherd.photo_url}
                alt={name}
                className="w-72 h-80 md:w-80 md:h-96 object-cover"
              />
            ) : (
              <div className="w-72 h-80 bg-[#111318] border border-white/5 flex items-center justify-center">
                <span className="font-display text-6xl text-[#C8A96A]/30 font-light">
                  {shepherd.first_name?.[0]}{shepherd.last_name?.[0]}
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}