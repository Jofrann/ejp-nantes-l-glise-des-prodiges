import React from 'react';
import { motion } from 'framer-motion';

const DEFAULT_MINISTRIES = [
  { name: 'Coordination', description: 'Organisation et pilotage de la vie de l\'EJP Nantes.' },
  { name: 'Communication', description: 'Présence digitale, réseaux sociaux, médias et création de contenu.' },
  { name: 'Prodiges Musique', description: 'Louange, adoration et excellence musicale au service de Dieu.' },
  { name: 'Accueil', description: 'Recevoir, orienter et honorer chaque personne qui entre dans la maison.' },
  { name: 'Pôle Vie Académique', description: 'Soutien, orientation et excellence académique pour les jeunes.' },
];

export default function MinistriesSection({ ministries = [] }) {
  const items = ministries.filter(m => m.is_active).length > 0
    ? ministries.filter(m => m.is_active).sort((a, b) => a.display_order - b.display_order)
    : DEFAULT_MINISTRIES;

  return (
    <section id="ministeres" className="py-36 px-6 bg-[#0B0B0C]">
      <div className="max-w-screen-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#C8A96A]/70 font-light block mb-4">Servir</span>
          <h2 className="font-display text-4xl md:text-6xl text-[#F7F4EF] font-light leading-tight mb-5">Nos ministères</h2>
          <p className="text-[#B8B8B8]/60 text-sm font-light max-w-md leading-relaxed">
            Chaque jeune peut découvrir, développer et exercer ses dons dans un cadre structuré et fraternel.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
          {items.map((ministry, i) => (
            <motion.div
              key={ministry.id || ministry.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="bg-[#0B0B0C] p-8 group hover:bg-[#111318] transition-colors duration-300"
            >
              <span className="font-display text-4xl text-white/5 font-light block mb-5">0{i + 1}</span>
              {ministry.image_url && (
                <div className="w-10 h-10 mb-5 overflow-hidden">
                  <img src={ministry.image_url} alt={ministry.name} className="w-full h-full object-cover" />
                </div>
              )}
              <h3 className="text-[#F7F4EF] text-sm font-medium tracking-wide mb-3">{ministry.name}</h3>
              {ministry.description && (
                <p className="text-[#B8B8B8]/50 text-xs leading-relaxed font-light">{ministry.description}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}