import React from 'react';
import { motion } from 'framer-motion';

export default function LeadersSection({ leaders = [] }) {
  const active = leaders.filter(l => l.is_active && !l.is_main_shepherd).sort((a, b) => a.display_order - b.display_order);
  if (active.length === 0) return null;

  return (
    <section id="leaders" className="py-36 px-6 bg-[#F7F4EF]">
      <div className="max-w-screen-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#C8A96A] font-medium block mb-4">L'équipe</span>
          <h2 className="font-display text-4xl md:text-6xl text-[#0B0B0C] font-light leading-tight">Nos leaders</h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-10">
          {active.map((person, i) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="group"
            >
              <div className="mb-4 overflow-hidden aspect-square bg-[#E5E0D8]">
                {person.photo_url ? (
                  <img
                    src={person.photo_url}
                    alt={`${person.first_name} ${person.last_name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-display text-3xl text-[#6B6B6B]/40 font-light">
                      {person.first_name?.[0]}{person.last_name?.[0]}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="text-[#0B0B0C] text-sm font-medium">{person.first_name} {person.last_name}</h3>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#C8A96A]/80 mt-1 font-light">{person.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}