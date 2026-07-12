import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PublicHeader from '@/components/public/PublicHeader';
import StickyCTA from '@/components/public/StickyCTA';
import HeroLumineux from '@/components/public/sections/HeroLumineux';
import CeDimanche from '@/components/public/sections/CeDimanche';
import PremiereFois from '@/components/public/sections/PremiereFois';
import Temoignages from '@/components/public/sections/Temoignages';
import CTAFinal from '@/components/public/sections/CTAFinal';
import PublicFooter from '@/components/public/sections/PublicFooter';
import RevealOnScroll from '@/components/public/RevealOnScroll';
import { ArrowRight, Users, BookOpen, Heart } from 'lucide-react';

export default function Home() {
  const [config, setConfig] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = () => {
    setLoading(true);
    setError(false);
    Promise.all([
      base44.entities.ChurchConfig.list(),
      base44.entities.Testimonial.filter({ is_published: true }, 'display_order', 3),
    ]).then(([c, t]) => {
      setConfig(c?.[0] || null);
      setTestimonials(t || []);
    }).catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFAF7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E8E2D5] border-t-[#D8B76A] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FBFAF7] flex flex-col items-center justify-center text-center px-6">
        <p className="font-display text-[#D8B76A] text-2xl mb-3">Connexion impossible</p>
        <p className="text-[#4B5563] text-sm mb-6 max-w-xs">Une erreur réseau est survenue. Vérifie ta connexion et réessaie.</p>
        <button onClick={fetchData} className="bg-[#101827] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#1a2740] transition-colors">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#FBFAF7] overflow-x-hidden">
      <PublicHeader />

      {/* 1. Hero cinématique */}
      <HeroLumineux config={config} />

      {/* 2. Prochain culte */}
      <CeDimanche config={config} />

      {/* 3. Présentation courte — vers Qui sommes-nous ? */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <RevealOnScroll>
            <p className="text-xs uppercase tracking-[0.25em] text-[#D8B76A] font-semibold mb-4 text-center">Notre identité</p>
            <h2 className="font-display text-4xl md:text-6xl text-[#101827] text-center mb-6 leading-tight">
              Une maison pour<br />une génération entière.
            </h2>
            <p className="text-[#4B5563] text-lg text-center max-w-2xl mx-auto leading-relaxed mb-10">
              L'EJP Nantes réunit des jeunes qui croient, qui servent et qui grandissent ensemble — dans la foi, l'excellence et la fraternité.
            </p>
          </RevealOnScroll>

          {/* 3 piliers */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: BookOpen, titre: 'Grandir', texte: 'Une formation spirituelle profonde, des parcours PCNC et des formations internes.' },
              { icon: Users, titre: 'Servir', texte: 'Chaque membre est un serviteur. Les ministères donnent une place à chaque talent.' },
              { icon: Heart, titre: 'Appartenir', texte: 'Les FIJ et la fraternité du dimanche créent une famille réelle, pas virtuelle.' },
            ].map((p) => (
              <RevealOnScroll key={p.titre}>
                <div className="bg-white border border-[#E8E2D5] rounded-3xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-2xl bg-[#EAF0F8] flex items-center justify-center mx-auto mb-4">
                    <p.icon className="w-5 h-5 text-[#D8B76A]" />
                  </div>
                  <h3 className="font-heading font-bold text-[#101827] text-lg mb-2">{p.titre}</h3>
                  <p className="text-[#4B5563] text-sm leading-relaxed">{p.texte}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>

          <RevealOnScroll>
            <div className="text-center">
              <Link
                to="/a-propos"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#101827] border-b-2 border-[#D8B76A] pb-0.5 hover:text-[#D8B76A] transition-colors"
              >
                Découvrir qui nous sommes <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* 4. Aperçu des programmes — vers Nos Programmes */}
      <section className="bg-[#101827] text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <RevealOnScroll>
            <p className="text-xs uppercase tracking-[0.25em] text-[#D8B76A] font-semibold mb-4">Nos rendez-vous</p>
            <h2 className="font-display text-4xl md:text-5xl mb-6">Chaque dimanche à 15h. Et bien plus.</h2>
            <p className="text-white/70 max-w-xl mx-auto leading-relaxed mb-10">
              Le culte du dimanche, les FIJ, les formations PCNC, les événements spéciaux — une vie communautaire riche et structurée.
            </p>
            <Link
              to="/programmes"
              className="inline-flex items-center gap-2 bg-[#D8B76A] text-[#101827] text-sm font-bold px-8 py-4 rounded-full hover:bg-[#c9a85a] transition-all hover:scale-[1.02]"
            >
              Voir tous nos programmes <ArrowRight className="w-4 h-4" />
            </Link>
          </RevealOnScroll>
        </div>
      </section>

      {/* 5. Première visite */}
      <PremiereFois />

      {/* 6. Témoignages (3 max) */}
      <Temoignages testimonials={testimonials} />

      {/* 7. Appel à venir */}
      <CTAFinal />

      {/* Footer */}
      <PublicFooter config={config} />

      {/* Sticky CTA mobile */}
      <StickyCTA />
    </div>
  );
}