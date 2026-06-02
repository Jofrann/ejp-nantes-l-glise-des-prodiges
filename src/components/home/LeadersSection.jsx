import React from 'react';
import { motion } from 'framer-motion';

export default function LeadersSection({ leaders = [] }) {
  const active = leaders.filter(l => l.is_active && !l.is_main_shepherd);
  if (active.length === 0) return null;

  return (
    <section id="leaders" className="py-28 px-6 bg-gray-950">
      <div className="max-w-screen-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-amber-400/80 font-medium">Leadership</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mt-3">Nos leaders</h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {active.map((person, i) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="relative mb-4 w-20 h-20">
                {person.photo_url ? (
                  <img
                    src={person.photo_url}
                    alt={`${person.first_name} ${person.last_name}`}
                    className="w-full h-full rounded-full object-cover border-2 border-white/10 group-hover:border-amber-400/50 transition-all duration-300"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-500/20 to-purple-700/20 border-2 border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-lg">
                    {person.first_name?.[0]}{person.last_name?.[0]}
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-white text-sm">{person.first_name} {person.last_name}</h3>
              <p className="text-xs text-amber-400/70 mt-0.5">{person.role}</p>
              {person.bio && (
                <p className="text-xs text-gray-600 mt-2 leading-relaxed line-clamp-3">{person.bio}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}