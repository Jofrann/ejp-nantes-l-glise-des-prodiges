import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import RevealOnScroll from '../RevealOnScroll';

const FAQ_ITEMS = [
  { q: 'À quelle heure commence le culte ?', a: 'Le culte commence chaque dimanche à 15h00. Nous te conseillons d\'arriver 10 minutes avant pour trouver ta place tranquillement.' },
  { q: 'Où se trouve l\'EJP Nantes ?', a: 'L\'EJP Nantes se trouve à Nantes, France. L\'adresse exacte est disponible sur notre page "Préparer ma venue" avec un lien Google Maps.' },
  { q: 'Dois-je m\'inscrire avant de venir ?', a: 'Non, tu n\'as pas besoin de t\'inscrire. Tu peux venir directement. Si tu le souhaites, tu peux remplir le formulaire "Je viens dimanche" pour que l\'équipe d\'accueil sache que tu viens.' },
  { q: 'Puis-je venir seul ?', a: 'Bien sûr ! Beaucoup viennent seuls la première fois. Notre équipe d\'accueil est là pour t\'orienter et tu ne seras jamais laissé de côté.' },
  { q: 'Comment se passe l\'accueil ?', a: 'Dès ton arrivée, une équipe t\'accueille et t\'oriente. Tu n\'as besoin de rien connaître : on t\'explique tout au fur et à mesure.' },
  { q: 'Combien de temps dure le culte ?', a: 'Le culte dure environ 1h30 à 2h, avec la louange, la Parole et un temps de communion fraternelle.' },
  { q: 'Qui contacter si j\'ai une question ?', a: 'Tu peux nous contacter via WhatsApp ou par email. Les coordonnées sont sur la page "Préparer ma venue" et en bas de cette page.' },
];

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className="bg-white rounded-[20px] border border-[#E8E2D5] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <span className="text-sm md:text-base font-semibold text-[#101827] pr-4">{item.q}</span>
        <ChevronDown className={`w-5 h-5 text-[#D8B76A] flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: isOpen ? '200px' : '0' }}
      >
        <p className="px-5 pb-5 text-sm text-[#4B5563] leading-relaxed">{item.a}</p>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="py-20 md:py-28 px-5 md:px-8 bg-[#FBFAF7]">
      <div className="max-w-3xl mx-auto">
        <RevealOnScroll className="text-center mb-12">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#D8B76A] font-semibold">FAQ</span>
          <h2 className="font-display text-3xl md:text-5xl text-[#101827] mt-3 mb-4 font-medium leading-tight">
            Avant de venir
          </h2>
          <p className="text-[#4B5563] text-base leading-relaxed">
            Tout ce que tu veux savoir avant ton premier dimanche.
          </p>
        </RevealOnScroll>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <RevealOnScroll key={i} delay={i * 50}>
              <FAQItem
                item={item}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
              />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}