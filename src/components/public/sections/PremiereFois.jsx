import React from 'react';
import { DoorOpen, HandHeart, Users, Coffee } from 'lucide-react';
import RevealOnScroll from '../RevealOnScroll';

const CARDS = [
  {
    icon: DoorOpen,
    title: 'Tu arrives',
    text: "Une équipe t'accueille et t'oriente dès ton arrivée. Tu n'as pas besoin de connaître personne.",
    color: 'bg-[#DCEFE7]',
  },
  {
    icon: HandHeart,
    title: 'Tu participes au culte',
    text: 'Louange, prière, Parole et communion fraternelle. Vis ce temps à ton rythme.',
    color: 'bg-[#F7E9E5]',
  },
  {
    icon: Users,
    title: "Tu n'es pas seul",
    text: 'Tu peux venir comme tu es. Il y a une place pour toi dans cette maison.',
    color: 'bg-[#EAF0F8]',
  },
  {
    icon: Coffee,
    title: 'Tu peux rester après',
    text: 'Un moment simple pour échanger, poser tes questions et partager un temps fraternel.',
    color: 'bg-[#F5F0E8]',
  },
];

export default function PremiereFois() {
  return (
    <section id="premiere-fois" className="py-20 md:py-28 px-5 md:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <RevealOnScroll className="text-center mb-12">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#D8B76A] font-semibold">Première fois</span>
          <h2 className="font-display text-3xl md:text-5xl text-[#101827] mt-3 mb-4 font-medium leading-tight">
            Tu viens pour la première fois ?
          </h2>
          <p className="text-[#4B5563] text-base max-w-xl mx-auto leading-relaxed">
            Tu n'as pas besoin de tout connaître avant d'arriver. Notre équipe t'accueille, t'oriente et t'aide à vivre ce temps simplement.
          </p>
        </RevealOnScroll>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <RevealOnScroll key={card.title} delay={i * 100}>
                <div className="bg-[#FBFAF7] rounded-[24px] border border-[#E8E2D5] p-6 h-full hover:shadow-[0_16px_50px_rgba(16,24,39,0.06)] hover:border-[#D8B76A]/30 transition-all duration-300 group">
                  <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-[#101827]" />
                  </div>
                  <div className="text-xs text-[#D8B76A] font-semibold mb-1">Étape {i + 1}</div>
                  <h3 className="font-heading text-lg font-semibold text-[#101827] mb-2">{card.title}</h3>
                  <p className="text-sm text-[#4B5563] leading-relaxed">{card.text}</p>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}