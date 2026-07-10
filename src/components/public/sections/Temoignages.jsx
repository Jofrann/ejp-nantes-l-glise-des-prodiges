import React from 'react';
import { Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import RevealOnScroll from '../RevealOnScroll';

export default function Temoignages({ testimonials }) {
  const featured = (testimonials || []).filter(t => t.is_featured).slice(0, 5);
  const list = featured.length > 0 ? featured : (testimonials || []).slice(0, 5);

  if (!list || list.length === 0) return null;

  return (
    <section id="temoignages" className="py-20 md:py-28 px-5 md:px-8 bg-gradient-to-b from-white to-[#FBFAF7]">
      <div className="max-w-6xl mx-auto">
        <RevealOnScroll className="text-center mb-12">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#D8B76A] font-semibold">Témoignages</span>
          <h2 className="font-display text-3xl md:text-5xl text-[#101827] mt-3 mb-4 font-medium leading-tight">
            Ce que Dieu fait ici
          </h2>
          <p className="text-[#4B5563] text-base max-w-xl mx-auto leading-relaxed">
            Des histoires vraies de transformation, de foi et de rencontre.
          </p>
        </RevealOnScroll>

        <div className="grid md:grid-cols-3 gap-5">
          {list.map((t, i) => (
            <RevealOnScroll key={t.id} delay={i * 100}>
              <motion.div
                whileHover={{ y: -4 }}
                className={`bg-white rounded-[24px] border border-[#E8E2D5] p-7 h-full flex flex-col ${i === 0 ? 'md:row-span-2 md:col-span-1' : ''}`}
              >
                <Quote className="w-8 h-8 text-[#D8B76A]/30 mb-4 flex-shrink-0" />
                <p className={`text-[#101827] leading-relaxed flex-1 ${i === 0 ? 'text-lg' : 'text-sm'}`}>
                  « {t.content} »
                </p>
                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-[#F0EBE0]">
                  {t.photo_url ? (
                    <img src={t.photo_url} alt={t.author_name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#F5F0E8] flex items-center justify-center">
                      <span className="font-display text-[#D8B76A] text-sm font-semibold">
                        {(t.author_name || 'A')[0]}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-[#101827]">
                      {t.is_anonymous ? 'Anonyme' : t.author_name}
                    </p>
                    {t.author_role && <p className="text-xs text-[#9CA3AF]">{t.author_role}</p>}
                  </div>
                </div>
              </motion.div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}