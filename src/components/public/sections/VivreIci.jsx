import React from 'react';
import { Music, Heart, BookOpen, Sparkles, Users, HandHeart } from 'lucide-react';
import RevealOnScroll from '../RevealOnScroll';

const EXPERIENCES = [
  { icon: Music, title: 'Louange vivante', text: "Une louange sincère qui élève le cœur vers Dieu et crée une atmosphère de Sa présence." },
  { icon: BookOpen, title: 'Parole profonde', text: "Un enseignement biblique clair, ancré dans la vérité et applicable à ta vie." },
  { icon: Heart, title: 'Prière partagée', text: "Des moments de prière où tu peux confier ce qui te pèse et recevoir." },
  { icon: Users, title: 'Communion fraternelle', text: "Une famille de jeunes où tu n'es jamais seul, où chacun compte." },
  { icon: Sparkles, title: 'Découverte de tes dons', text: "Apprends à identifier et développer les dons que Dieu a déposés en toi." },
  { icon: HandHeart, title: 'Service concret', text: "Prends part à des missions qui transforment la vie des autres et la tienne." },
];

export default function VivreIci() {
  return (
    <section className="py-20 md:py-28 px-5 md:px-8 bg-[#FBFAF7]">
      <div className="max-w-5xl mx-auto">
        <RevealOnScroll className="text-center mb-12">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#D8B76A] font-semibold">Ce que tu peux vivre</span>
          <h2 className="font-display text-3xl md:text-5xl text-[#101827] mt-3 mb-4 font-medium leading-tight">
            Bien plus qu'un culte
          </h2>
          <p className="text-[#4B5563] text-base max-w-xl mx-auto leading-relaxed">
            Une vie d'église où chaque dimension de ta foi trouve sa place.
          </p>
        </RevealOnScroll>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXPERIENCES.map((exp, i) => {
            const Icon = exp.icon;
            return (
              <RevealOnScroll key={exp.title} delay={i * 80}>
                <div className="bg-white rounded-[20px] border border-[#E8E2D5] p-6 hover:shadow-[0_12px_40px_rgba(16,24,39,0.05)] hover:border-[#D8B76A]/20 transition-all duration-300 group h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F5F0E8] flex items-center justify-center flex-shrink-0 group-hover:bg-[#D8B76A]/15 transition-colors">
                      <Icon className="w-5 h-5 text-[#D8B76A]" />
                    </div>
                    <div>
                      <h3 className="font-heading text-base font-semibold text-[#101827] mb-1.5">{exp.title}</h3>
                      <p className="text-sm text-[#4B5563] leading-relaxed">{exp.text}</p>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}