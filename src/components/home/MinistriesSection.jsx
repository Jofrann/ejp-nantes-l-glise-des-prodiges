import React from 'react';
import { motion } from 'framer-motion';
import { Music, Users, Mic2, Hand, BookOpen, Star } from 'lucide-react';

const ICON_MAP = {
  Music, Users, Mic2, Hand, BookOpen, Star
};

const DEFAULT_MINISTRIES = [
  { name: 'Coordination', description: 'Organisation et pilotage de la vie de l\'EJP.', icon: 'Star' },
  { name: 'Communication', description: 'Présence digitale, réseaux, médias et création.', icon: 'Mic2' },
  { name: 'Prodiges Musique', description: 'Louange, adoration et production musicale.', icon: 'Music' },
  { name: 'Accueil', description: 'Intégration et accompagnement des nouveaux.', icon: 'Hand' },
  { name: 'Pôle Vie Académique', description: 'Soutien, orientation et excellence académique.', icon: 'BookOpen' },
];

export default function MinistriesSection({ ministries = [] }) {
  const items = ministries.filter(m => m.is_active).length > 0
    ? ministries.filter(m => m.is_active)
    : DEFAULT_MINISTRIES;

  return (
    <section id="ministeres" className="py-28 px-6 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(ellipse at 100% 50%, #f59e0b, transparent 60%)' }} />

      <div className="max-w-screen-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-6"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-amber-400/80 font-medium">Departments</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mt-3 mb-4">Nos ministères</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm">
            Chaque jeune peut découvrir, développer et exercer ses dons dans un cadre structuré, fraternel et stimulant.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((ministry, i) => {
            const IconComp = ICON_MAP[ministry.icon] || Star;
            return (
              <motion.div
                key={ministry.id || ministry.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/8 hover:border-amber-400/25 transition-all duration-300"
              >
                {ministry.image_url ? (
                  <img src={ministry.image_url} alt={ministry.name} className="w-12 h-12 rounded-xl object-cover mb-5" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center mb-5">
                    <IconComp className="w-6 h-6 text-amber-400" />
                  </div>
                )}
                <h3 className="font-bold text-white text-base mb-2">{ministry.name}</h3>
                {ministry.description && (
                  <p className="text-sm text-gray-500 leading-relaxed">{ministry.description}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}