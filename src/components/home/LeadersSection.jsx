import React from 'react';
import { motion } from 'framer-motion';

export default function LeadersSection({ pastor, leaders = [] }) {
  if (!pastor && leaders.length === 0) return null;

  const all = pastor
    ? [{ name: pastor.pastor_name, role: pastor.pastor_title, photo_url: pastor.pastor_photo_url, bio: pastor.pastor_bio, isMain: true }, ...leaders]
    : leaders;

  return (
    <section className="py-24 px-6 bg-gray-950">
      <div className="max-w-screen-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-14 text-center"
        >
          <span className="text-xs uppercase tracking-widest text-amber-400 font-medium">Leadership</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">Ceux qui nous guident</h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {all.map((person, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`flex flex-col items-center text-center group ${person.isMain ? 'col-span-2 md:col-span-1' : ''}`}
            >
              <div className={`relative mb-4 ${person.isMain ? 'w-28 h-28' : 'w-20 h-20'}`}>
                {person.photo_url ? (
                  <img
                    src={person.photo_url}
                    alt={person.name}
                    className="w-full h-full rounded-full object-cover border-2 border-white/10 group-hover:border-amber-400/50 transition-all duration-300"
                  />
                ) : (
                  <div className={`w-full h-full rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/20 border-2 border-amber-500/20 flex items-center justify-center text-amber-400 font-bold ${person.isMain ? 'text-2xl' : 'text-xl'}`}>
                    {person.name?.[0] || '?'}
                  </div>
                )}
                {person.isMain && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                    Pasteur
                  </div>
                )}
              </div>
              <h3 className={`font-semibold text-white ${person.isMain ? 'text-lg' : 'text-sm'}`}>{person.name}</h3>
              <p className="text-xs text-amber-400/80 mt-0.5">{person.role}</p>
              {person.bio && (
                <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-3">{person.bio}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}