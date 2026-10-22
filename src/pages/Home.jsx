import { PublicText } from '@/components/public/PublicCopy';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44, publicContent } from '@/api/base44Client';
import PublicHeader from '@/components/public/PublicHeader';
import usePublicMotion from '@/components/public/motion/usePublicMotion';
import Authorities from '@/components/public/sections/Authorities';
import VisionEJP from '@/components/public/sections/VisionEJP';
import FijInvitation from '@/components/public/sections/FijInvitation';
import Ministeres from '@/components/public/sections/Ministeres';
import GalerieVivante from '@/components/public/sections/GalerieVivante';
import PhotoStory from '@/components/public/sections/PhotoStory';
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
  const motionRoot = usePublicMotion(config);
  const [testimonials, setTestimonials] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [ministries, setMinistries] = useState([]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Rediriger vers /reset-password si un jeton d'invitation/réinitialisation est présent dans l'URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || params.get('reset_token') || params.get('invite_token');
    if (token) {
      window.location.href = `/reset-password?token=${encodeURIComponent(token)}`;
    }
  }, []);

  const fetchData = () => {
    setLoading(true);
    setError(false);
    Promise.all([
      base44.entities.ChurchConfig.list(),
      publicContent.leadership().catch(() => []),
      publicContent.ministries().catch(() => []),
      base44.entities.Testimonial.filter({ is_published: true }, 'display_order', 3),
      base44.entities.GalleryMedia.filter({ is_active: true }, 'display_order', 1000).catch(() => []),
    ]).then(([c, l, m, t, g]) => {
      setConfig(c?.[0] || null);
      setLeaders(l);
      setMinistries(m);
      setTestimonials(t || []);
      setMedia(g || []);
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
        <p className="font-display text-[#D8B76A] text-2xl mb-3"><PublicText value={"Connexion impossible"} /></p>
        <p className="text-[#4B5563] text-sm mb-6 max-w-xs"><PublicText value={"Une erreur réseau est survenue. Vérifie ta connexion et réessaie."} /></p>
        <button onClick={fetchData} className="bg-[#101827] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#1a2740] transition-colors"><PublicText value={"Réessayer"} /></button>
      </div>
    );
  }

  return (
    <div ref={motionRoot} className="ejp-public bg-[#FBFAF7] overflow-x-hidden">
      <PublicHeader />

      {/* 1. Hero cinématique */}
      <HeroLumineux config={config} />

      <VisionEJP config={config} />
      <Authorities config={config} leaders={leaders} />
      <FijInvitation config={config} />
      <PhotoStory config={config} media={media} />

      {/* 2. Prochain culte */}
      <CeDimanche config={config} />

      {/* 3. Présentation courte — vers Qui sommes-nous ? */}
      <section className="ejp-identity py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <RevealOnScroll>
            <p className="text-xs uppercase tracking-[0.25em] text-[#D8B76A] font-semibold mb-4 text-center"><PublicText value={"Notre identité"} /></p>
            <h2 className="font-display text-4xl md:text-6xl text-[#101827] text-center mb-6 leading-tight"><PublicText value={"Une maison pour"} /><br /><PublicText value={"une génération entière."} /></h2>
            <p className="text-[#4B5563] text-lg text-center max-w-2xl mx-auto leading-relaxed mb-10"><PublicText value={"L'EJP Nantes réunit des jeunes qui croient, qui servent et qui grandissent ensemble — dans la foi, l'excellence et la fraternité."} /></p>
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
                  <h3 className="font-heading font-bold text-[#101827] text-lg mb-2"><PublicText value={p.titre} /></h3>
                  <p className="text-[#4B5563] text-sm leading-relaxed"><PublicText value={p.texte} /></p>
                </div>
              </RevealOnScroll>
            ))}
          </div>

          <RevealOnScroll>
            <div className="text-center">
              <Link
                to="/a-propos"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#101827] border-b-2 border-[#D8B76A] pb-0.5 hover:text-[#D8B76A] transition-colors"
              ><PublicText value={"Découvrir qui nous sommes "} /><ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* 4. Aperçu des programmes — vers Nos Programmes */}
      <section className="ejp-rendezvous bg-[#101827] text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <RevealOnScroll>
            <p className="text-xs uppercase tracking-[0.25em] text-[#D8B76A] font-semibold mb-4"><PublicText value={"Nos rendez-vous"} /></p>
            <h2 className="font-display text-4xl md:text-5xl mb-6"><PublicText field="service_day" value={config?.service_day || 'Dimanche'} /><PublicText value={" à "} /><PublicText field="service_time" value={config?.service_time || '15:00'} /><PublicText value={". Et bien plus."} /></h2>
            <p className="text-white/70 max-w-xl mx-auto leading-relaxed mb-10"><PublicText value={"Le culte du dimanche, les FIJ, les formations PCNC, les événements spéciaux — une vie communautaire riche et structurée."} /></p>
            <Link
              to="/programmes"
              className="inline-flex items-center gap-2 bg-[#D8B76A] text-[#101827] text-sm font-bold px-8 py-4 rounded-full hover:bg-[#c9a85a] transition-all hover:scale-[1.02]"
            ><PublicText value={"Voir tous nos programmes "} /><ArrowRight className="w-4 h-4" />
            </Link>
          </RevealOnScroll>
        </div>
      </section>

      {/* 5. Première visite */}
      <Ministeres ministries={ministries} />
      <GalerieVivante media={media} />
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