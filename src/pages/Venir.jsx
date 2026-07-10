import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Navigation, Calendar, MessageCircle, Mail, ArrowLeft, HelpCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PublicHeader from '@/components/public/PublicHeader';
import StickyCTA from '@/components/public/StickyCTA';
import FirstVisitForm from '@/components/public/FirstVisitForm';
import RevealOnScroll from '@/components/public/RevealOnScroll';

const FAQ_ITEMS = [
  { q: 'À quelle heure commence le culte ?', a: 'Le culte commence chaque dimanche à 15h00.' },
  { q: 'Dois-je m\'inscrire ?', a: 'Non, tu peux venir directement. Le formulaire est optionnel.' },
  { q: 'Puis-je venir seul ?', a: 'Bien sûr ! Notre équipe t\'accueille dès ton arrivée.' },
  { q: 'Combien de temps dure le culte ?', a: 'Environ 1h30 à 2h, avec louange, Parole et communion.' },
];

function getNextSunday() {
  const now = new Date();
  const sunday = new Date(now);
  const day = now.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  sunday.setDate(now.getDate() + diff);
  sunday.setHours(15, 0, 0, 0);
  if (sunday <= now) sunday.setDate(sunday.getDate() + 7);
  return sunday;
}

export default function Venir() {
  const [config, setConfig] = useState(null);
  const nextSunday = getNextSunday();

  useEffect(() => {
    base44.entities.ChurchConfig.list().then(c => setConfig(c?.[0] || null)).catch(() => {});
  }, []);

  const address = config?.address_label || 'Nantes, France';
  const mapsUrl = config?.maps_link || 'https://maps.google.com/?q=Nantes';
  const contactEmail = config?.contact_email || '';
  const whatsappUrl = config?.whatsapp_url || '';

  const icsUrl = `data:text/calendar;charset=utf8,${encodeURIComponent(
    `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nURL:${window.location.href}\nDTSTART:${nextSunday.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\nDTEND:${new Date(nextSunday.getTime() + 7200000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z\nSUMMARY:Culte EJP Nantes\nLOCATION:${address}\nEND:VEVENT\nEND:VCALENDAR`
  )}`;

  return (
    <div className="min-h-screen bg-[#FBFAF7]">
      <PublicHeader />

      <div className="pt-20 md:pt-24">
        <div className="max-w-4xl mx-auto px-5 md:px-8 pb-24">
          {/* Back link */}
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-[#4B5563] hover:text-[#101827] transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
          </Link>

          {/* Header */}
          <RevealOnScroll className="mb-10">
            <span className="text-[11px] uppercase tracking-[0.3em] text-[#D8B76A] font-semibold">Préparer ma venue</span>
            <h1 className="font-display text-3xl md:text-5xl text-[#101827] mt-3 mb-4 font-medium leading-tight">
              Je viens dimanche
            </h1>
            <p className="text-[#4B5563] text-base leading-relaxed max-w-xl">
              Tout ce qu'il faut savoir pour vivre ton premier culte à l'EJP Nantes en toute simplicité.
            </p>
          </RevealOnScroll>

          {/* Info cards */}
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            <RevealOnScroll>
              <div className="bg-white rounded-[20px] border border-[#E8E2D5] p-5">
                <Clock className="w-5 h-5 text-[#D8B76A] mb-3" />
                <p className="text-sm font-semibold text-[#101827]">Horaire</p>
                <p className="text-sm text-[#4B5563]">Dimanche à 15h00</p>
              </div>
            </RevealOnScroll>
            <RevealOnScroll delay={100}>
              <div className="bg-white rounded-[20px] border border-[#E8E2D5] p-5">
                <MapPin className="w-5 h-5 text-[#D8B76A] mb-3" />
                <p className="text-sm font-semibold text-[#101827]">Adresse</p>
                <p className="text-sm text-[#4B5563]">{address}</p>
              </div>
            </RevealOnScroll>
            <RevealOnScroll delay={200}>
              <div className="bg-white rounded-[20px] border border-[#E8E2D5] p-5">
                <Calendar className="w-5 h-5 text-[#D8B76A] mb-3" />
                <p className="text-sm font-semibold text-[#101827]">Prochain culte</p>
                <p className="text-sm text-[#4B5563]">{nextSunday.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
            </RevealOnScroll>
          </div>

          {/* Map + actions */}
          <RevealOnScroll className="mb-10">
            <div className="bg-white rounded-[24px] border border-[#E8E2D5] overflow-hidden shadow-[0_16px_50px_rgba(16,24,39,0.05)]">
              <div className="aspect-[16/9] bg-[#EAF0F8]">
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                  title="Carte EJP Nantes"
                />
              </div>
              <div className="p-5 flex flex-wrap gap-2">
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-[#101827] text-white text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-[#1a2740] transition-colors">
                  <Navigation className="w-3.5 h-3.5" /> Itinéraire
                </a>
                <a href={icsUrl} download="culte-ejp-nantes.ics" className="flex items-center gap-1.5 bg-[#F5F0E8] text-[#101827] text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-[#EDE6D8] transition-colors">
                  <Calendar className="w-3.5 h-3.5" /> Ajouter au calendrier
                </a>
              </div>
            </div>
          </RevealOnScroll>

          {/* First visit explanation */}
          <RevealOnScroll className="mb-10">
            <div className="bg-gradient-to-br from-[#EAF0F8] to-white rounded-[24px] border border-[#E8E2D5] p-6 md:p-8">
              <h2 className="font-display text-2xl text-[#101827] mb-4 font-medium">Comment se passe l'arrivée ?</h2>
              <div className="space-y-3 text-sm text-[#4B5563] leading-relaxed">
                <p>1. <strong className="text-[#101827]">Tu arrives</strong> — une équipe t'accueille à l'entrée et t'oriente.</p>
                <p>2. <strong className="text-[#101827]">Tu trouves ta place</strong> — installe-toi tranquillement, le culte commence à 15h.</p>
                <p>3. <strong className="text-[#101827]">Tu participes</strong> — louange, prière, Parole. Vis le moment à ton rythme.</p>
                <p>4. <strong className="text-[#101827]">Tu restes après</strong> — un temps fraternel pour échanger et poser tes questions.</p>
              </div>
            </div>
          </RevealOnScroll>

          {/* Form + contact */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <RevealOnScroll>
              <FirstVisitForm sourceSection="venir" />
            </RevealOnScroll>

            <RevealOnScroll delay={100}>
              <div className="bg-white rounded-[24px] border border-[#E8E2D5] p-6 md:p-8 h-full">
                <h3 className="font-display text-xl text-[#101827] mb-4 font-medium">Contact rapide</h3>
                <p className="text-sm text-[#4B5563] mb-5">Une question avant de venir ? Contacte-nous directement.</p>
                <div className="space-y-3">
                  {whatsappUrl && (
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#DCEFE7] rounded-xl p-4 hover:opacity-80 transition-opacity">
                      <MessageCircle className="w-5 h-5 text-[#101827]" />
                      <div>
                        <p className="text-sm font-semibold text-[#101827]">WhatsApp</p>
                        <p className="text-xs text-[#4B5563]">Réponse rapide</p>
                      </div>
                    </a>
                  )}
                  {contactEmail && (
                    <a href={`mailto:${contactEmail}`} className="flex items-center gap-3 bg-[#EAF0F8] rounded-xl p-4 hover:opacity-80 transition-opacity">
                      <Mail className="w-5 h-5 text-[#101827]" />
                      <div>
                        <p className="text-sm font-semibold text-[#101827]">Email</p>
                        <p className="text-xs text-[#4B5563]">{contactEmail}</p>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* Mini FAQ */}
          <RevealOnScroll>
            <div className="bg-white rounded-[24px] border border-[#E8E2D5] p-6 md:p-8">
              <div className="flex items-center gap-2 mb-5">
                <HelpCircle className="w-5 h-5 text-[#D8B76A]" />
                <h3 className="font-display text-xl text-[#101827] font-medium">FAQ pratique</h3>
              </div>
              <div className="space-y-4">
                {FAQ_ITEMS.map((item, i) => (
                  <div key={i} className="border-b border-[#F0EBE0] last:border-0 pb-4 last:pb-0">
                    <p className="text-sm font-semibold text-[#101827] mb-1">{item.q}</p>
                    <p className="text-sm text-[#4B5563]">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>

      <StickyCTA />
    </div>
  );
}