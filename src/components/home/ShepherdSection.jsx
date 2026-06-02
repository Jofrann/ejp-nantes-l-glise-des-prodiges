import React from 'react';
import { motion } from 'framer-motion';

function ShepherdCard({ person, label, delay = 0 }) {
  const name = `${person.first_name} ${person.last_name}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay }}
      className="flex flex-col items-center text-center"
    >
      {/* Photo */}
      <div className="mb-8">
        {person.photo_url ? (
          <img
            src={person.photo_url}
            alt={name}
            loading="lazy"
            className="w-56 h-64 md:w-64 md:h-80 object-cover"
            onError={e => { e.target.style.display = 'none'; e.target.parentElement.querySelector('div') && (e.target.parentElement.querySelector('div').style.display = 'flex'); }}
          />
        ) : (
          <div className="w-56 h-64 md:w-64 md:h-80 bg-[#111318] border border-white/5 flex items-center justify-center">
            <span className="font-display text-6xl text-[#C8A96A]/30 font-light">
              {person.first_name?.[0]}{person.last_name?.[0]}
            </span>
          </div>
        )}
      </div>

      {/* Texte */}
      <span className="text-[10px] uppercase tracking-[0.4em] text-[#C8A96A]/70 font-light block mb-3">{label}</span>
      <h3 className="font-display text-3xl md:text-4xl text-[#F7F4EF] font-light mb-1 leading-tight">{name}</h3>
      <p className="text-[#C8A96A]/70 text-xs tracking-[0.2em] uppercase mb-6">{person.role}</p>
      <p className="text-[#B8B8B8] text-sm leading-relaxed font-light max-w-xs">{person.bio || ''}</p>
    </motion.div>
  );
}

export default function ShepherdSection({ shepherd, config }) {
  const worldShepherd = config?.world_shepherd_first_name ? {
    first_name: config.world_shepherd_first_name,
    last_name: config.world_shepherd_last_name || '',
    role: config.world_shepherd_role || 'Berger EJP Monde',
    bio: config.world_shepherd_bio || '',
    photo_url: config.world_shepherd_photo_url || '',
  } : null;

  if (!shepherd && !worldShepherd) return null;

  return (
    <section className="py-36 px-6 bg-[#0B0B0C]">
      <div className="max-w-screen-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#C8A96A]/70 font-light block mb-4">Couverture spirituelle</span>
          <h2 className="font-display text-4xl md:text-5xl text-[#F7F4EF] font-light">Notre encadrement</h2>
        </motion.div>

        <div className={`grid gap-16 md:gap-24 ${worldShepherd && shepherd ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-sm mx-auto'}`}>
          {worldShepherd && (
            <ShepherdCard person={worldShepherd} label="Berger EJP Monde" delay={0} />
          )}
          {shepherd && (
            <ShepherdCard person={shepherd} label="Bergère EJP Nantes" delay={0.2} />
          )}
        </div>
      </div>
    </section>
  );
}