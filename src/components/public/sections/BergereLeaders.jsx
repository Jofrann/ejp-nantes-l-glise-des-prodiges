import React from 'react';
import { motion } from 'framer-motion';
import RevealOnScroll from '../RevealOnScroll';

export default function BergereLeaders({ leaders }) {
  const shepherd = (leaders || []).find(l => l.is_main_shepherd);
  const team = (leaders || []).filter(l => !l.is_main_shepherd && l.is_active !== false).slice(0, 6);

  return (
    <section id="bergere" className="py-20 md:py-28 px-5 md:px-8 bg-[#FBFAF7]">
      <div className="max-w-5xl mx-auto">
        <RevealOnScroll className="text-center mb-12">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#D8B76A] font-semibold">Bergère & Leaders</span>
          <h2 className="font-display text-3xl md:text-5xl text-[#101827] mt-3 mb-4 font-medium leading-tight">
            Une équipe au service
          </h2>
        </RevealOnScroll>

        {/* Bergère */}
        {shepherd && (
          <RevealOnScroll className="mb-12">
            <div className="bg-white rounded-[28px] border border-[#E8E2D5] shadow-[0_24px_70px_rgba(16,24,39,0.08)] overflow-hidden max-w-3xl mx-auto">
              <div className="grid md:grid-cols-2">
                {shepherd.photo_url && (
                  <div className="h-64 md:h-auto bg-[#F5F0E8] overflow-hidden">
                    <img src={shepherd.photo_url} alt={`${shepherd.first_name} ${shepherd.last_name}`} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className={`p-8 md:p-10 flex flex-col justify-center ${!shepherd.photo_url ? 'md:col-span-2' : ''}`}>
                  <span className="text-[11px] uppercase tracking-[0.3em] text-[#D8B76A] font-semibold mb-3">Bergère de l'EJP Nantes</span>
                  <h3 className="font-display text-2xl md:text-3xl text-[#101827] mb-1 font-medium">
                    {shepherd.first_name} {shepherd.last_name}
                  </h3>
                  <p className="text-sm text-[#D8B76A] font-medium mb-4">{shepherd.role}</p>
                  {shepherd.bio && <p className="text-sm text-[#4B5563] leading-relaxed">{shepherd.bio}</p>}
                </div>
              </div>
            </div>
          </RevealOnScroll>
        )}

        {/* Leaders */}
        {team.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {team.map((leader, i) => (
              <RevealOnScroll key={leader.id} delay={i * 80}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-[20px] border border-[#E8E2D5] p-5 text-center hover:shadow-[0_12px_40px_rgba(16,24,39,0.05)] transition-all duration-300"
                >
                  {leader.photo_url ? (
                    <img src={leader.photo_url} alt={`${leader.first_name} ${leader.last_name}`} className="w-16 h-16 rounded-full object-cover mx-auto mb-3" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F5F0E8] to-[#EAF0F8] flex items-center justify-center mx-auto mb-3">
                      <span className="font-display text-[#D8B76A] text-lg font-semibold">
                        {leader.first_name?.[0]}
                      </span>
                    </div>
                  )}
                  <p className="text-sm font-semibold text-[#101827]">{leader.first_name} {leader.last_name}</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{leader.role}</p>
                </motion.div>
              </RevealOnScroll>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}