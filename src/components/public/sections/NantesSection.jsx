import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import RevealOnScroll from '../RevealOnScroll';

export default function NantesSection() {
  return (
    <section className="py-20 md:py-28 px-5 md:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <RevealOnScroll>
            <div className="relative rounded-[28px] overflow-hidden aspect-[4/5] shadow-[0_24px_70px_rgba(16,24,39,0.10)]">
              <img
                src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80"
                alt="Nantes"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101827]/40 to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-2 text-white">
                <MapPin className="w-4 h-4 text-[#D8B76A]" />
                <span className="text-sm font-medium">Nantes, France</span>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={150}>
            <div>
              <span className="text-[11px] uppercase tracking-[0.3em] text-[#D8B76A] font-semibold">Au cœur de Nantes</span>
              <h2 className="font-display text-3xl md:text-4xl text-[#101827] mt-3 mb-5 font-medium leading-tight">
                Une jeunesse au cœur de la ville
              </h2>
              <p className="text-[#4B5563] text-base leading-relaxed mb-4">
                L'EJP Nantes est ancrée dans une ville dynamique, jeune et créative. Nous croyons que Dieu a placé cette église ici pour être une lumière, un refuge et une famille pour la génération de Nantes.
              </p>
              <p className="text-[#4B5563] text-base leading-relaxed mb-8">
                Chaque dimanche, des jeunes de tous horizons se rassemblent pour vivre quelque chose de vrai, de profond et de transformateur.
              </p>
              <Link
                to="/venir"
                className="inline-flex items-center gap-2 bg-[#101827] text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#1a2740] transition-colors"
              >
                Nous rendre visite
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}