import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/sections/PublicFooter';
import RevealOnScroll from '@/components/public/RevealOnScroll';
import { Calendar, Clock, MapPin, Users, Heart, Music, GraduationCap, Star } from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

const EVENT_TYPE_LABELS = {
  culte: 'Culte',
  ejp: 'EJP',
  formation: 'Formation',
  rendez_vous: 'Rendez-vous',
  reunion: 'Réunion',
  service: 'Service',
  special: 'Spécial',
  autre: 'Autre',
};

export default function Programmes() {
  const [config, setConfig] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.ChurchConfig.list(),
      base44.entities.Event.filter({ is_active: true }, 'event_date', 20),
    ]).then(([c, e]) => {
      setConfig(c?.[0] || null);
      setEvents(e || []);
    }).finally(() => setLoading(false));
  }, []);

  // Filter upcoming events
  const today = new Date().toISOString().split('T')[0];
  const upcoming = events.filter(e => e.event_date >= today);
  const special = events.filter(e => e.event_type === 'special' && e.event_date >= today);

  return (
    <div className="bg-[#FBFAF7] overflow-x-hidden">
      <PublicHeader />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center bg-gradient-to-b from-[#EAF0F8] to-[#FBFAF7]">
        <RevealOnScroll>
          <p className="text-xs uppercase tracking-[0.25em] text-[#D8B76A] font-semibold mb-4">EJP Nantes</p>
          <h1 className="font-display text-5xl md:text-7xl text-[#101827] leading-tight mb-6">
            Nos Programmes
          </h1>
          <p className="text-[#4B5563] text-lg max-w-xl mx-auto leading-relaxed">
            Des rendez-vous réguliers et exceptionnels pour grandir, se retrouver et servir ensemble.
          </p>
        </RevealOnScroll>
      </section>

      {/* 1. Réunion de jeunesse */}
      <section id="reunion" className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <RevealOnScroll>
            <p className="text-xs uppercase tracking-[0.25em] text-[#D8B76A] font-semibold mb-4">Chaque dimanche</p>
            <h2 className="font-display text-4xl md:text-5xl text-[#101827] mb-6">Réunion de jeunesse</h2>
            <p className="text-[#4B5563] leading-relaxed mb-6">
              Le cœur battant de l'EJP. Chaque dimanche à 15h, la communauté se réunit pour la louange, la prière et l'enseignement de la Parole. Trois cultes par dimanche, trois moments pour rencontrer Dieu.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-[#4B5563]">
                <div className="w-8 h-8 rounded-xl bg-[#EAF0F8] flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-[#D8B76A]" />
                </div>
                <span>Chaque dimanche à <strong className="text-[#101827]">{config?.culte_time || '15h00'}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#4B5563]">
                <div className="w-8 h-8 rounded-xl bg-[#EAF0F8] flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-[#D8B76A]" />
                </div>
                <span>{config?.address || 'Nantes, France'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#4B5563]">
                <div className="w-8 h-8 rounded-xl bg-[#EAF0F8] flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-[#D8B76A]" />
                </div>
                <span>Ouvert à tous — entrée libre</span>
              </div>
            </div>
          </RevealOnScroll>
          <RevealOnScroll>
            <div className="bg-[#101827] rounded-3xl p-10 text-white text-center">
              <p className="font-display text-7xl text-[#D8B76A] font-bold mb-2">3</p>
              <p className="font-heading font-semibold text-lg mb-4">cultes chaque dimanche</p>
              <p className="text-white/60 text-sm leading-relaxed">
                Louange · Prière · Parole · Fraternité
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* 2. Les cultes du dimanche détails */}
      <section className="bg-[#F5F0E8] py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <RevealOnScroll>
            <h3 className="font-heading text-xl font-bold text-[#101827] mb-8 text-center">Ce qui se passe chaque dimanche</h3>
          </RevealOnScroll>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Music, label: 'Louange', desc: 'Une montée vers Dieu' },
              { icon: Heart, label: 'Prière', desc: 'Ensemble et avec foi' },
              { icon: GraduationCap, label: 'Enseignement', desc: 'La Parole vivante' },
              { icon: Users, label: 'Fraternité', desc: 'La famille réelle' },
            ].map((item) => (
              <RevealOnScroll key={item.label}>
                <div className="bg-white rounded-2xl p-5 text-center border border-[#E8E2D5]">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF0F8] flex items-center justify-center mx-auto mb-3">
                    <item.icon className="w-5 h-5 text-[#D8B76A]" />
                  </div>
                  <p className="font-heading font-semibold text-[#101827] text-sm">{item.label}</p>
                  <p className="text-xs text-[#4B5563] mt-1">{item.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FIJ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <RevealOnScroll>
            <div className="bg-[#EAF0F8] rounded-3xl p-10 text-center">
              <Heart className="w-16 h-16 text-[#D8B76A] mx-auto mb-4" />
              <p className="font-display text-3xl text-[#101827] font-bold mb-2">FIJ</p>
              <p className="text-[#4B5563] text-sm">Flux des Jeunes</p>
            </div>
          </RevealOnScroll>
          <RevealOnScroll>
            <p className="text-xs uppercase tracking-[0.25em] text-[#D8B76A] font-semibold mb-4">Petits groupes</p>
            <h2 className="font-display text-4xl text-[#101827] mb-6">Les FIJ</h2>
            <p className="text-[#4B5563] leading-relaxed">
              Les Flux des Jeunes sont des petits groupes de croissance et de fraternité qui se réunissent en dehors du dimanche. Chaque FIJ est conduite par un pilote et réunit une dizaine de personnes dans un cadre convivial, pour étudier la Parole, prier et vivre ensemble.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* 4. Formations */}
      <section className="bg-[#101827] text-white py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <RevealOnScroll>
            <p className="text-xs uppercase tracking-[0.25em] text-[#D8B76A] font-semibold mb-4 text-center">Parcours de formation</p>
            <h2 className="font-display text-4xl md:text-5xl mb-10 text-center">Se former pour mieux servir</h2>
          </RevealOnScroll>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { code: 'PCNC 001', titre: 'Les fondamentaux', desc: "Introduction à la foi, à la communauté et aux bases du service." },
              { code: 'PCNC 101', titre: 'Grandir dans le service', desc: "Approfondissement du parcours STAR : mission, engagement, excellence." },
              { code: 'PCNC 201', titre: 'Responsabilité', desc: "Formation avancée pour ceux qui prennent des responsabilités de leadership." },
            ].map((f) => (
              <RevealOnScroll key={f.code}>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <p className="text-[#D8B76A] text-xs font-semibold uppercase tracking-widest mb-2">{f.code}</p>
                  <h3 className="font-heading font-bold text-white text-lg mb-2">{f.titre}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Événements spéciaux */}
      {special.length > 0 && (
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <RevealOnScroll>
              <p className="text-xs uppercase tracking-[0.25em] text-[#D8B76A] font-semibold mb-4 text-center">À venir</p>
              <h2 className="font-display text-4xl text-[#101827] text-center mb-12">Événements spéciaux</h2>
            </RevealOnScroll>
            <div className="space-y-4">
              {special.slice(0, 4).map((ev) => (
                <RevealOnScroll key={ev.id}>
                  <div className="flex items-start gap-5 bg-white border border-[#E8E2D5] rounded-2xl p-5 shadow-sm">
                    <div className="bg-[#EAF0F8] rounded-2xl px-4 py-3 text-center flex-shrink-0">
                      <p className="text-xs text-[#D8B76A] font-semibold uppercase">
                        {new Date(ev.event_date).toLocaleDateString('fr-FR', { month: 'short' })}
                      </p>
                      <p className="font-display text-2xl text-[#101827] font-bold">
                        {new Date(ev.event_date).getDate()}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-bold text-[#101827]">{ev.title}</p>
                      {ev.description && <p className="text-sm text-[#4B5563] mt-1 line-clamp-2">{ev.description}</p>}
                      <div className="flex items-center gap-4 mt-2 text-xs text-[#4B5563]">
                        {ev.event_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ev.event_time}</span>}
                        {ev.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</span>}
                      </div>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Calendrier */}
      <section id="calendrier" className="bg-[#F5F0E8] py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <RevealOnScroll>
            <p className="text-xs uppercase tracking-[0.25em] text-[#D8B76A] font-semibold mb-4 text-center">Calendrier</p>
            <h2 className="font-display text-4xl text-[#101827] text-center mb-12">À venir</h2>
          </RevealOnScroll>
          {upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.slice(0, 8).map((ev) => (
                <RevealOnScroll key={ev.id}>
                  <div className="flex items-center gap-4 bg-white rounded-xl p-4 border border-[#E8E2D5]">
                    <div className="text-center w-14 flex-shrink-0">
                      <p className="text-[10px] text-[#D8B76A] font-semibold uppercase">
                        {new Date(ev.event_date).toLocaleDateString('fr-FR', { month: 'short' })}
                      </p>
                      <p className="font-heading font-bold text-[#101827] text-xl leading-none">
                        {new Date(ev.event_date).getDate()}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-semibold text-sm text-[#101827] truncate">{ev.title}</p>
                      {ev.event_time && <p className="text-xs text-[#4B5563]">{ev.event_time}</p>}
                    </div>
                    <span className="text-[10px] bg-[#EAF0F8] text-[#4B5563] px-2 py-1 rounded-full font-medium flex-shrink-0">
                      {EVENT_TYPE_LABELS[ev.event_type] || ev.event_type}
                    </span>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          ) : (
            <p className="text-center text-[#4B5563] text-sm">Le calendrier sera mis à jour prochainement.</p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <RevealOnScroll>
          <h2 className="font-display text-3xl md:text-4xl text-[#101827] mb-6">Viens vivre tout ça de l'intérieur</h2>
          <Link
            to="/venir"
            className="inline-flex items-center gap-2 bg-[#101827] text-white text-sm font-semibold px-8 py-4 rounded-full hover:bg-[#1a2740] transition-all hover:scale-[1.02]"
          >
            Je viens dimanche
          </Link>
        </RevealOnScroll>
      </section>

      <PublicFooter config={config} />
    </div>
  );
}