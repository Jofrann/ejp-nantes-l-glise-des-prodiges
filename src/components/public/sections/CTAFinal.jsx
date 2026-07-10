import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import RevealOnScroll from '../RevealOnScroll';

export default function CTAFinal() {
  return (
    <section className="py-20 md:py-32 px-5 md:px-8 bg-gradient-to-br from-[#101827] to-[#1a2740] relative overflow-hidden">
      {/* Glow effects */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `
          radial-gradient(ellipse 60% 40% at 30% 30%, rgba(216,183,106,0.15), transparent 60%),
          radial-gradient(ellipse 50% 30% at 70% 70%, rgba(216,183,106,0.08), transparent 60%)
        `
      }} />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <RevealOnScroll>
          <span className="text-[11px] uppercase tracking-[0.35em] text-[#D8B76A] font-semibold">Une porte t'est ouverte</span>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-white mt-4 mb-6 font-medium leading-tight">
            Et si tu venais ce dimanche ?
          </h2>
          <p className="text-white/60 text-base md:text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            Tu n'as pas besoin de tout comprendre. Viens comme tu es. Une place t'attend.
          </p>
          <Link
            to="/venir"
            className="group inline-flex items-center gap-2 bg-[#D8B76A] text-[#101827] text-base font-bold px-8 py-4 rounded-full hover:bg-[#E4C77A] transition-all hover:scale-[1.03] shadow-[0_8px_40px_rgba(216,183,106,0.3)]"
          >
            Je viens dimanche
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </RevealOnScroll>
      </div>
    </section>
  );
}