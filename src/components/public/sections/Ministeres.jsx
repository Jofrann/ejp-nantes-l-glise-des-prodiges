import React from 'react';
import { motion } from 'framer-motion';
import { Users, Megaphone, Music, Settings, GraduationCap, Heart } from 'lucide-react';
import RevealOnScroll from '../RevealOnScroll';

const ICON_MAP = {
  Users, Megaphone, Music, Settings, GraduationCap, Heart,
};

const FALLBACK_MINISTRIES = [
  { name: 'Accueil', icon: 'Users', description: "Une équipe qui accueille, oriente et crée un climat chaleureux dès l'arrivée.", benefit_text: 'Chaque visiteur se sent chez lui.' },
  { name: 'Communication', icon: 'Megaphone', description: 'Diffusion de la vision, création de contenus et gestion des canaux numériques.', benefit_text: 'Une voix claire qui rayonne.' },
  { name: 'Prodiges Musique', icon: 'Music', description: 'Louange, répétitions et créations musicales qui élèvent le cœur vers Dieu.', benefit_text: 'Une louange vivante et sincère.' },
  { name: 'Coordination', icon: 'Settings', description: "Organisation, planning et cohérence des activités de l'église.", benefit_text: 'Un service fluide et excellent.' },
  { name: 'Vie Académique', icon: 'GraduationCap', description: 'Accompagnement des étudiants, orientation et soutien dans les études.', benefit_text: 'Des jeunes accompagnés et soutenus.' },
  { name: 'FIJ', icon: 'Heart', description: 'Flux des Jeunes — petits groupes de croissance et de fraternité.', benefit_text: 'Des vies transformées en profondeur.' },
];

export default function Ministeres({ ministries }) {
  const list = (ministries && ministries.length > 0) ? ministries : FALLBACK_MINISTRIES;

  return (
    <section id="ministeres" className="py-20 md:py-28 px-5 md:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <RevealOnScroll className="text-center mb-12">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#D8B76A] font-semibold">Ministères</span>
          <h2 className="font-display text-3xl md:text-5xl text-[#101827] mt-3 mb-4 font-medium leading-tight">
            Espaces de service
          </h2>
          <p className="text-[#4B5563] text-base max-w-xl mx-auto leading-relaxed">
            Chaque ministère porte une mission, sert des personnes et produit un fruit concret.
          </p>
        </RevealOnScroll>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((m, i) => {
            const Icon = ICON_MAP[m.icon] || Users;
            return (
              <RevealOnScroll key={m.id || m.name} delay={i * 80}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-[#FBFAF7] rounded-[24px] border border-[#E8E2D5] overflow-hidden h-full hover:shadow-[0_16px_50px_rgba(16,24,39,0.06)] hover:border-[#D8B76A]/20 transition-all duration-300 group"
                >
                  {m.image_url && (
                    <div className="h-32 overflow-hidden bg-[#F5F0E8]">
                      <img src={m.image_url} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#D8B76A]/15 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[#D8B76A]" />
                      </div>
                      <h3 className="font-heading text-lg font-semibold text-[#101827]">{m.name}</h3>
                    </div>
                    <p className="text-sm text-[#4B5563] leading-relaxed mb-3">{m.description}</p>
                    {m.benefit_text && (
                      <p className="text-xs text-[#D8B76A] font-medium italic">→ {m.benefit_text}</p>
                    )}
                  </div>
                </motion.div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}