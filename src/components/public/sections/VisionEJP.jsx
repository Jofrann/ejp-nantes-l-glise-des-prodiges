import React from 'react';
import { Flame, Home, HandHeart } from 'lucide-react';
import RevealOnScroll from '../RevealOnScroll';

const PILLARS = [
  { icon: Flame, title: 'Foi', text: "Chercher Dieu en vérité, grandir dans la connaissance de Sa Parole et vivre une foi authentique au quotidien.", color: 'bg-[#F7E9E5]' },
  { icon: Home, title: 'Famille', text: "Bâtir des relations fraternelles profondes, où chacun est connu, aimé et accompagné.", color: 'bg-[#DCEFE7]' },
  { icon: HandHeart, title: 'Service', text: "Découvrir ses dons, prendre sa place et servir avec excellence dans le corps de Christ.", color: 'bg-[#EAF0F8]' },
];

export default function VisionEJP({ config }) {
  const visionText = config?.vision_text || "L'EJP Nantes existe pour conduire une génération à connaître Dieu, grandir ensemble, découvrir ses dons et prendre sa place dans le corps de Christ.";

  return (
    <section id="vision" className="py-20 md:py-32 px-5 md:px-8 bg-gradient-to-b from-[#FBFAF7] to-white">
      <div className="max-w-4xl mx-auto text-center">
        <RevealOnScroll>
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#D8B76A] font-semibold">Notre vision</span>
          <h2 className="font-display text-3xl md:text-5xl text-[#101827] mt-3 mb-6 font-medium leading-tight">
            {config?.vision_title || 'Une génération qui sert'}
          </h2>
          <p className="text-[#4B5563] text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-16">
            {visionText}
          </p>
        </RevealOnScroll>

        <div className="grid md:grid-cols-3 gap-6">
          {PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <RevealOnScroll key={pillar.title} delay={i * 120}>
                <div className="bg-white rounded-[24px] border border-[#E8E2D5] p-8 h-full hover:shadow-[0_16px_50px_rgba(16,24,39,0.06)] transition-all duration-300">
                  <div className={`w-14 h-14 rounded-2xl ${pillar.color} flex items-center justify-center mb-5`}>
                    <Icon className="w-6 h-6 text-[#101827]" />
                  </div>
                  <h3 className="font-display text-2xl text-[#101827] mb-3 font-medium">{pillar.title}</h3>
                  <p className="text-sm text-[#4B5563] leading-relaxed">{pillar.text}</p>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}