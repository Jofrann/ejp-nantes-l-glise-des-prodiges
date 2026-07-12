import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PublicHeader from '@/components/public/PublicHeader';
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
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.ChurchConfig.list(),
      base44.entities.Leader.list('display_order', 20),
    ]).then(([c, l]) => {
      setConfig(c?.[0] || null);
      setLeaders(l || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#FBFAF7] overflow-x-hidden">
      <PublicHeader />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center bg-gradient-to-b from-[#EAF0F8] to-[#FBFAF7]">
        <RevealOnScroll>
          <p className="text-xs uppercase tracking-[0.25em] text-[#D8B76A] font-semibold mb-4">EJP Nantes</p>
          <h1 className="font-display text-5xl md:text-7xl text-[#101827] leading-tight mb-6">
            Qui sommes-nous ?
          </h1>
          <p className="text-[#4B5563] text-lg max-w-xl mx-auto leading-relaxed">
            Une génération qui croit, qui sert et qui grandit ensemble — au cœur de Nantes.
          </p>
        </RevealOnScroll>
      </section>

      {/* 1. Introduction */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <RevealOnScroll>
          <p className="font-display text-3xl md:text-4xl text-[#101827] leading-snug text-center">
            L'EJP Nantes est une <span className="text-[#D8B76A]">église de jeunes</span>, ancrée dans la foi chrétienne évangélique, portée par la conviction que chaque génération peut marquer son époque.
          </p>
        </RevealOnScroll>
      </section>

      {/* 2. Notre vision */}
      <section id="vision" className="bg-[#101827] text-white py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <RevealOnScroll>
            <p className="text-xs uppercase tracking-[0.25em] text-[#D8B76A] font-semibold mb-4">Notre vision</p>
            <h2 className="font-display text-4xl md:text-5xl mb-8 leading-tight">
              Susciter une génération<br />de prodiges au service de Dieu.
            </h2>
            <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
              Nous croyons que Dieu appelle des jeunes ordinaires à vivre des vies extraordinaires. Notre vision est de former, ancrer et envoyer une génération de serviteurs excellents, profondément enracinés dans la Parole et audacieusement tournés vers leur génération.
            </p>
          </RevealOnScroll>
        </div>
      </section>

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
                  <span className="font-display text-[#D8B76A] text-2xl font-bold">{p.titre[0]}</span>
                </div>
                <h3 className="font-heading text-xl font-bold text-[#101827] mb-3">{p.titre}</h3>
                <p className="text-[#4B5563] text-sm leading-relaxed">{p.texte}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* 4. Nos valeurs */}
      <section id="valeurs" className="bg-[#F5F0E8] py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <RevealOnScroll>
            <p className="text-xs uppercase tracking-[0.25em] text-[#D8B76A] font-semibold mb-4 text-center">Nos valeurs</p>
            <h2 className="font-display text-4xl md:text-5xl text-[#101827] text-center mb-14">Ce qui nous tient</h2>
          </RevealOnScroll>
          <div className="grid md:grid-cols-2 gap-6">
            {VALEURS.map((v, i) => (
              <RevealOnScroll key={i}>
                <div className="bg-white rounded-3xl p-8 border border-[#E8E2D5] shadow-sm">
                  <span className="text-3xl font-display text-[#D8B76A] font-bold block mb-3">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="font-heading text-xl font-bold text-[#101827] mb-2">{v.titre}</h3>
                  <p className="text-[#4B5563] text-sm leading-relaxed">{v.texte}</p>
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
            <p className="text-xs uppercase tracking-[0.25em] text-[#D8B76A] font-semibold mb-4 text-center">Notre histoire</p>
            <h2 className="font-display text-4xl md:text-5xl text-[#101827] text-center mb-10">Une maison qui a grandi</h2>
            <div className="space-y-6 text-[#4B5563] leading-relaxed text-base">
              <p>
                L'EJP Nantes est née d'une conviction simple : les jeunes méritent une église qui les prend au sérieux — spirituellement, académiquement, humainement.
              </p>
              <p>
                Fondée avec un groupe restreint de jeunes déterminés, elle a grandi dimanche après dimanche, serviteur après serviteur. Ce qui a commencé comme un rassemblement est devenu une maison, un département, une communauté.
              </p>
              <p>
                Aujourd'hui, l'EJP Nantes réunit des dizaines de jeunes chaque dimanche à 15h, portés par la louange, la Parole et une fraternité réelle qui dépasse les réunions.
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* 6. Notre Bergère */}
      <section className="bg-[#101827] text-white py-24 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <RevealOnScroll className="flex-1">
            <p className="text-xs uppercase tracking-[0.25em] text-[#D8B76A] font-semibold mb-4">Notre Bergère</p>
            <h2 className="font-display text-4xl mb-6">{config?.shepherd_name || 'Notre Bergère'}</h2>
            <p className="text-white/70 leading-relaxed text-base">
              {config?.shepherd_bio || "La Bergère de l'EJP Nantes guide la communauté avec vision, amour et rigueur. Son rôle est de conduire chaque personne vers son plein potentiel en Dieu, en veillant à la santé spirituelle, relationnelle et opérationnelle de la maison."}
            </p>
          </RevealOnScroll>
          {config?.shepherd_image_url && (
            <div className="flex-shrink-0">
              <img
                src={config.shepherd_image_url}
                alt={config.shepherd_name}
                className="w-48 h-48 md:w-64 md:h-64 rounded-3xl object-cover border-2 border-[#D8B76A]/30"
              />
            </div>
          )}
        </div>
      </section>

      {/* 7. Les responsables */}
      <section id="responsables" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <RevealOnScroll>
            <p className="text-xs uppercase tracking-[0.25em] text-[#D8B76A] font-semibold mb-4 text-center">Les responsables</p>
            <h2 className="font-display text-4xl md:text-5xl text-[#101827] text-center mb-14">L'équipe de direction</h2>
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
                          <span className="font-display text-[#D8B76A] text-2xl">{leader.name?.[0]}</span>
                        </div>
                      )}
                    </div>
                    <p className="font-heading font-semibold text-sm text-[#101827]">{leader.name}</p>
                    <p className="text-xs text-[#4B5563] mt-0.5">{leader.role}</p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          ) : (
            <p className="text-center text-[#4B5563] text-sm">Les responsables seront présentés prochainement.</p>
          )}
        </div>
      </section>

      {/* 8. Notre ancrage à Nantes */}
      <section className="bg-[#EAF0F8] py-24 px-6 text-center">
        <RevealOnScroll>
          <p className="text-xs uppercase tracking-[0.25em] text-[#D8B76A] font-semibold mb-4">Notre ancrage</p>
          <h2 className="font-display text-4xl md:text-5xl text-[#101827] mb-6">À Nantes, pour Nantes</h2>
          <p className="text-[#4B5563] max-w-xl mx-auto leading-relaxed">
            L'EJP Nantes n'est pas hors-sol. Elle est profondément ancrée dans la ville de Nantes, engagée pour sa génération, attentive à ses besoins et convaincue que l'Évangile est une bonne nouvelle pour cette cité.
          </p>
        </RevealOnScroll>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <RevealOnScroll>
          <h2 className="font-display text-3xl md:text-4xl text-[#101827] mb-6">Prêt à nous rejoindre ?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/programmes" className="inline-flex items-center justify-center gap-2 bg-[#101827] text-white text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-[#1a2740] transition-all">
              Voir nos programmes
            </Link>
            <Link to="/venir" className="inline-flex items-center justify-center gap-2 border-2 border-[#D8B76A] text-[#101827] text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-[#D8B76A]/10 transition-all">
              Je viens dimanche
            </Link>
          </div>
        </RevealOnScroll>
      </section>

      <PublicFooter config={config} />
    </div>
  );
}