import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PublicHeader from '@/components/public/PublicHeader';
import StickyCTA from '@/components/public/StickyCTA';
import HeroLumineux from '@/components/public/sections/HeroLumineux';
import CeDimanche from '@/components/public/sections/CeDimanche';
import PremiereFois from '@/components/public/sections/PremiereFois';
import ImmersionScroll from '@/components/public/sections/ImmersionScroll';
import VisionEJP from '@/components/public/sections/VisionEJP';
import VivreIci from '@/components/public/sections/VivreIci';
import Temoignages from '@/components/public/sections/Temoignages';
import BergereLeaders from '@/components/public/sections/BergereLeaders';
import Ministeres from '@/components/public/sections/Ministeres';
import GalerieVivante from '@/components/public/sections/GalerieVivante';
import NantesSection from '@/components/public/sections/NantesSection';
import FAQSection from '@/components/public/sections/FAQSection';
import CTAFinal from '@/components/public/sections/CTAFinal';
import PublicFooter from '@/components/public/sections/PublicFooter';

export default function Home() {
  const [config, setConfig] = useState(null);
  const [leaders, setLeaders] = useState([]);
  const [events, setEvents] = useState([]);
  const [ministries, setMinistries] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = () => {
    setLoading(true);
    setError(false);
    Promise.all([
      base44.entities.ChurchConfig.list(),
      base44.entities.Leader.list('display_order', 20),
      base44.entities.Event.filter({ is_active: true }, 'event_date', 10),
      base44.entities.Ministry.list('display_order', 20),
      base44.entities.GalleryMedia.filter({ is_active: true }, 'display_order', 12),
      base44.entities.Testimonial.filter({ is_published: true }, 'display_order', 20),
    ]).then(([c, l, e, m, g, t]) => {
      setConfig(c?.[0] || null);
      setLeaders(l || []);
      setEvents(e || []);
      setMinistries(m || []);
      setGallery(g || []);
      setTestimonials(t || []);
    }).catch(() => {
      setError(true);
    }).finally(() => setLoading(false));
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

      {/* 1. Hero cinématique lumineux */}
      <HeroLumineux config={config} />

      {/* 2. Carte "Ce dimanche" */}
      <CeDimanche config={config} />

      {/* 3. Tu viens pour la première fois ? */}
      <PremiereFois />

      {/* 4. Section immersive au scroll */}
      <ImmersionScroll />

      {/* 5. Vision de l'EJP Nantes */}
      <VisionEJP config={config} />

      {/* 6. Ce que tu peux vivre ici */}
      <VivreIci />

      {/* 7. Témoignages */}
      <Temoignages testimonials={testimonials} />

      {/* 8. Bergère & leaders */}
      <BergereLeaders leaders={leaders} />

      {/* 9. Ministères / espaces de service */}
      <Ministeres ministries={ministries} />

      {/* 10. Galerie vivante */}
      <GalerieVivante media={gallery} />

      {/* 11. Au cœur de Nantes */}
      <NantesSection />

      {/* 12. FAQ avant de venir */}
      <FAQSection />

      {/* 13. CTA final */}
      <CTAFinal />

      {/* 14. Footer */}
      <PublicFooter config={config} />

      {/* Sticky CTA mobile */}
      <StickyCTA />
    </div>
  );
}