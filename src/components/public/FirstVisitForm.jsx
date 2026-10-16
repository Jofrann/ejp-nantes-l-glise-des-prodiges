import { isPublicPreview } from '@/lib/publicCopy';
import { PublicText, usePublicText } from '@/components/public/PublicCopy';
import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const COMING_OPTIONS = [
  { value: 'seul', label: 'Je viens seul' },
  { value: 'accompagne', label: 'Je viens accompagné' },
  { value: 'incertain', label: 'Je ne sais pas encore' },
];

export default function FirstVisitForm({ sourceSection = 'venir', compact = false }) {
  const text = usePublicText();
  const formId = React.useId();
  const [firstName, setFirstName] = useState('');
  const [contact, setContact] = useState('');
  const [comingStatus, setComingStatus] = useState('incertain');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isPublicPreview()) { setError("Aperçu : aucun formulaire ne sera envoyé."); return; }
    if (!firstName.trim() || !contact.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await base44.entities.FirstVisitIntent.create({
        first_name: firstName.trim(),
        contact: contact.trim(),
        coming_status: comingStatus,
        message: message.trim() || undefined,
        source_section: sourceSection,
        status: 'new',
      });
      setSubmitted(true);
    } catch (err) {
      setError('Une erreur est survenue. Réessaie ou contacte-nous directement.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={`bg-white rounded-[24px] border border-[#E8E2D5] p-8 text-center ${compact ? '' : 'shadow-[0_24px_70px_rgba(16,24,39,0.08)]'}`}>
        <div className="w-14 h-14 rounded-full bg-[#DCEFE7] flex items-center justify-center mx-auto mb-4">
          <Check className="w-7 h-7 text-[#101827]" />
        </div>
        <h3 className="font-display text-2xl text-[#101827] mb-2 font-medium"><PublicText value={"Merci "} /><PublicText value={firstName} /><PublicText value={" !"} /></h3>
        <p className="text-sm text-[#4B5563] leading-relaxed max-w-sm mx-auto"><PublicText value={"Nous avons bien noté ton intention de venue. L'équipe d'accueil sera prévenue. On a hâte de te rencontrer ce dimanche !"} /></p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`bg-white rounded-[24px] border border-[#E8E2D5] p-6 md:p-8 ${compact ? '' : 'shadow-[0_24px_70px_rgba(16,24,39,0.08)]'}`}>
      <h3 className="font-display text-xl md:text-2xl text-[#101827] mb-1 font-medium"><PublicText value={"Je viens dimanche"} /></h3>
      <p className="text-sm text-[#4B5563] mb-5"><PublicText value={"Remplis ce formulaire pour que l'équipe d'accueil sache que tu viens. C'est optionnel."} /></p>

      <div className="space-y-4">
        <div>
          <label htmlFor={`${formId}-first`} className="text-xs font-medium text-[#4B5563] mb-1.5 block"><PublicText value={"Prénom *"} /></label>
          <input
            type="text"
            id={`${formId}-first`}
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-[#E8E2D5] bg-[#FBFAF7] text-sm text-[#101827] focus:outline-none focus:border-[#D8B76A]/40 transition-colors"
            placeholder={text("Ton prénom")}
          />
        </div>

        <div>
          <label htmlFor={`${formId}-contact`} className="text-xs font-medium text-[#4B5563] mb-1.5 block"><PublicText value={"Téléphone ou email *"} /></label>
          <input
            type="text"
            id={`${formId}-contact`}
            value={contact}
            onChange={e => setContact(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-[#E8E2D5] bg-[#FBFAF7] text-sm text-[#101827] focus:outline-none focus:border-[#D8B76A]/40 transition-colors"
            placeholder={text("Pour qu'on puisse te contacter si besoin")}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[#4B5563] mb-2 block"><PublicText value={"Je viens"} /></label>
          <div className="grid grid-cols-3 gap-2">
            {COMING_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setComingStatus(opt.value)}
                className={`text-xs font-medium px-3 py-2.5 rounded-xl border transition-all ${
                  comingStatus === opt.value
                    ? 'bg-[#101827] text-white border-[#101827]'
                    : 'bg-[#FBFAF7] text-[#4B5563] border-[#E8E2D5] hover:border-[#D8B76A]/30'
                }`}
              >
                <PublicText value={opt.label} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor={`${formId}-message`} className="text-xs font-medium text-[#4B5563] mb-1.5 block"><PublicText value={"Question (optionnel)"} /></label>
          <textarea
            id={`${formId}-message`}
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-[#E8E2D5] bg-[#FBFAF7] text-sm text-[#101827] focus:outline-none focus:border-[#D8B76A]/40 transition-colors resize-none"
            placeholder={text("Une question ? Un besoin particulier ?")}
          />
        </div>

        {error && <p className="text-xs text-red-500"><PublicText value={error} /></p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#101827] text-white text-sm font-semibold py-3.5 rounded-full hover:bg-[#1a2740] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /><PublicText value={" Envoi..."} /></> : <PublicText value={"Confirmer ma venue"} />}
        </button>
      </div>
    </form>
  );
}