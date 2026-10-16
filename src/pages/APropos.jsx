import { PublicText } from '@/components/public/PublicCopy';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44, publicContent } from '@/api/base44Client';
import Authorities from '@/components/public/sections/Authorities';
import PublicHeader from '@/components/public/PublicHeader';
import usePublicMotion from '@/components/public/motion/usePublicMotion';
import { PUBLIC_PHOTOS } from '@/components/public/publicPhotos';
import { EditorialPhoto } from '@/components/public/sections/PhotoStory';
import PublicFooter from '@/components/public/sections/PublicFooter';
import RevealOnScroll from '@/components/public/RevealOnScroll';

const VALEURS = [
  { titre: 'Excellence', texte: "Nous faisons les choses à fond, avec soin et conviction. L'excellence n'est pas la perfection, c'est le refus de la médiocrité." },
  { titre: 'Famille', texte: "Nous sommes une maison, pas un programme. Chaque personne qui entre doit sentir qu'elle appartient à quelque chose." },
  { titre: 'Service', texte: "Notre vie est organisée autour du don. Servir n'est pas une charge, c'est notre façon d'exprimer notre foi." },
  { titre: 'Croissance', texte: "Nous ne nous installons pas. Chaque semestre est une occasion de progresser spirituellement, académiquement et humainement." },
];

export default function APropos() {
  const [config, setConfig] = useState(null);
  const motionRoot = usePublicMotion(config);
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leadersError, setLeadersError] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.ChurchConfig.list(),
      publicContent.leadership().catch(() => { setLeadersError(true); return []; }),
    ]).then(([c, l]) => {
      setConfig(c?.[0] || null);
      setLeaders((l || []).map(person => ({ ...person, name: [person.first_name, person.last_name].filter(Boolean).join(' '), image_url: person.photo_url })));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div ref={motionRoot} className="ejp-public bg-[#FBFAF7] overflow-x-hidden">
      <PublicHeader />

      {/* Hero */}
      <section className="ejp-page-intro">
        <RevealOnScroll>
          <p className="text-xs uppercase tracking-[0.25em] text-[#D8B76A] font-semibold mb-4"><PublicText value={"EJP Nantes"} /></p>
          <h1 className="font-display text-5xl md:text-7xl text-[#101827] leading-tight mb-6"><PublicText value={"Qui sommes-nous ?"} /></h1>
          <p className="text-[#4B5563] text-lg max-w-xl mx-auto leading-relaxed"><PublicText value={"Une génération qui croit, qui sert et qui grandit ensemble — au cœur de Nantes."} /></p>
        </RevealOnScroll>
      </section>

      <EditorialPhoto className="ejp-page-photo" src={config?.community_image_url} photo={PUBLIC_PHOTOS.community} />

      {/* 1. Introduction */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <RevealOnScroll>
          <p className="font-display text-3xl md:text-4xl text-[#101827] leading-snug text-center"><PublicText value={"L'EJP Nantes est une "} /><span className="text-[#D8B76A]"><PublicText value={"église de jeunes"} /></span><PublicText value={", ancrée dans la foi chrétienne évangélique, portée par la conviction que chaque génération peut marquer son époque."} /></p>
        </RevealOnScroll>
      </section>

      {/* 2. Notre vision */}
      <section id="vision" className="bg-[#101827] text-white py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <RevealOnScroll>
            <p className="text-xs uppercase tracking-[0.25em] text-[#D8B76A] font-semibold mb-4"><PublicText value={"Notre vision"} /></p>
            <h2 className="font-display text-4xl md:text-5xl mb-8 leading-tight">
              <PublicText field="vision_title" value={config?.vision_title || 'Susciter une génération de prodiges au service de Dieu.'} />
            </h2>
            <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
              <PublicText field="vision_text" value={config?.vision_text || "Nous croyons que Dieu appelle des jeunes ordinaires à vivre des vies extraordinaires. Notre vision est de former, ancrer et envoyer une génération de serviteurs excellents, profondément enracinés dans la Parole et audacieusement tournés vers leur génération."} />
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {config?.mission_text && <section className="max-w-4xl mx-auto px-6 py-12"><RevealOnScroll><p className="ejp-eyebrow"><PublicText value={"Notre mission"} /></p><h2 className="font-display text-4xl mb-6"><PublicText field="mission_title" value={config.mission_title || 'Notre mission'} /></h2><p className="text-[#4B5563] leading-relaxed"><PublicText field="mission_text" value={config.mission_text} /></p></RevealOnScroll></section>}
      {/* 3. Notre mission */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { titre: 'Découvrir', texte: 'Présenter Dieu à ceux qui ne le connaissent pas encore, avec authenticité et amour.' },
            { titre: 'Grandir', texte: 'Accompagner chaque personne dans sa formation spirituelle, académique et humaine.' },
            { titre: 'Servir', texte: 'Équiper chaque membre pour contribuer activement à la vie de l\'église et de la cité.' },
          ].map((p) => (
            <RevealOnScroll key={p.titre}>
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF0F8] flex items-center justify-center mx-auto mb-4">
                  <span className="font-display text-[#D8B76A] text-2xl font-bold"><PublicText value={p.titre[0]} /></span>
                </div>
                <h3 className="font-heading text-xl font-bold text-[#101827] mb-3"><PublicText value={p.titre} /></h3>
                <p className="text-[#4B5563] text-sm leading-relaxed"><PublicText value={p.texte} /></p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* 4. Nos valeurs */}
      <section id="valeurs" className="bg-[#F5F0E8] py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <RevealOnScroll>
            <p className="text-xs uppercase tracking-[0.25em] text-[#D8B76A] font-semibold mb-4 text-center"><PublicText value={"Nos valeurs"} /></p>
            <h2 className="font-display text-4xl md:text-5xl text-[#101827] text-center mb-14"><PublicText value={"Ce qui nous tient"} /></h2>
          </RevealOnScroll>
          <div className="grid md:grid-cols-2 gap-6">
            {VALEURS.map((v, i) => (
              <RevealOnScroll key={i}>
                <div className="bg-white rounded-3xl p-8 border border-[#E8E2D5] shadow-sm">
                  <span className="text-3xl font-display text-[#D8B76A] font-bold block mb-3"><PublicText value={String(i + 1).padStart(2, '0')} /></span>
                  <h3 className="font-heading text-xl font-bold text-[#101827] mb-2"><PublicText value={v.titre} /></h3>
                  <p className="text-[#4B5563] text-sm leading-relaxed"><PublicText value={v.texte} /></p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Notre histoire */}
      <section id="histoire" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <RevealOnScroll>
            <p className="text-xs uppercase tracking-[0.25em] text-[#D8B76A] font-semibold mb-4 text-center"><PublicText value={"Notre histoire"} /></p>
            <h2 className="font-display text-4xl md:text-5xl text-[#101827] text-center mb-10"><PublicText value={"Une maison qui a grandi"} /></h2>
            <div className="space-y-6 text-[#4B5563] leading-relaxed text-base">
              <p><PublicText value={"L'EJP Nantes est née d'une conviction simple : les jeunes méritent une église qui les prend au sérieux — spirituellement, académiquement, humainement."} /></p>
              <p><PublicText value={"Fondée avec un groupe restreint de jeunes déterminés, elle a grandi dimanche après dimanche, serviteur après serviteur. Ce qui a commencé comme un rassemblement est devenu une maison, un ministère, une communauté."} /></p>
              <p><PublicText value={"Aujourd'hui, l'EJP Nantes réunit des dizaines de jeunes chaque dimanche à 15h, portés par la louange, la Parole et une fraternité réelle qui dépasse les réunions."} /></p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <Authorities config={config} leaders={leaders} />

      {/* 7. Les responsables */}
      <section id="responsables" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <RevealOnScroll>
            <p className="text-xs uppercase tracking-[0.25em] text-[#D8B76A] font-semibold mb-4 text-center"><PublicText value={"Les responsables"} /></p>
            <h2 className="font-display text-4xl md:text-5xl text-[#101827] text-center mb-14"><PublicText value={"L'équipe de direction"} /></h2>
          </RevealOnScroll>
          {leaders.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {leaders.map((leader, i) => (
                <RevealOnScroll key={leader.id}>
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden bg-[#EAF0F8] mb-3 border border-[#E8E2D5]">
                      {leader.image_url ? (
                        <img src={leader.image_url} alt={leader.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-display text-[#D8B76A] text-2xl"><PublicText value={leader.name?.[0]} /></span>
                        </div>
                      )}
                    </div>
                    <p className="font-heading font-semibold text-sm text-[#101827]"><PublicText value={leader.name} /></p>
                    <p className="text-xs text-[#4B5563] mt-0.5"><PublicText value={leader.role} /></p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          ) : (
            <p className="text-center text-[#4B5563] text-sm"><PublicText value={leadersError ? 'La présentation des responsables est momentanément indisponible.' : 'Les responsables seront présentés prochainement.'} /></p>
          )}
        </div>
      </section>

      {/* 8. Notre ancrage à Nantes */}
      <section className="bg-[#EAF0F8] py-24 px-6 text-center">
        <RevealOnScroll>
          <p className="text-xs uppercase tracking-[0.25em] text-[#D8B76A] font-semibold mb-4"><PublicText value={"Notre ancrage"} /></p>
          <h2 className="font-display text-4xl md:text-5xl text-[#101827] mb-6"><PublicText value={"À Nantes, pour Nantes"} /></h2>
          <p className="text-[#4B5563] max-w-xl mx-auto leading-relaxed"><PublicText value={"L'EJP Nantes n'est pas hors-sol. Elle est profondément ancrée dans la ville de Nantes, engagée pour sa génération, attentive à ses besoins et convaincue que l'Évangile est une bonne nouvelle pour cette cité."} /></p>
        </RevealOnScroll>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <RevealOnScroll>
          <h2 className="font-display text-3xl md:text-4xl text-[#101827] mb-6"><PublicText value={"Prêt à nous rejoindre ?"} /></h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/programmes" className="inline-flex items-center justify-center gap-2 bg-[#101827] text-white text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-[#1a2740] transition-all"><PublicText value={"Voir nos programmes"} /></Link>
            <Link to="/venir" className="inline-flex items-center justify-center gap-2 border-2 border-[#D8B76A] text-[#101827] text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-[#D8B76A]/10 transition-all"><PublicText value={"Je viens dimanche"} /></Link>
          </div>
        </RevealOnScroll>
      </section>

      <PublicFooter config={config} />
    </div>
  );
}