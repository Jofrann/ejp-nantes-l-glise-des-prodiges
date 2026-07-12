import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, Mail } from 'lucide-react';

export default function PublicFooter({ config }) {
  const socials = [
    { icon: Instagram, url: config?.instagram_url, label: 'Instagram' },
    { icon: Youtube, url: config?.youtube_url, label: 'YouTube' },
  ].filter(s => s.url);

  return (
    <footer className="bg-[#FBFAF7] border-t border-[#E8E2D5] pt-16 pb-24 md:pb-12 px-5 md:px-8">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full border-2 border-[#D8B76A] flex items-center justify-center">
                <span className="font-display text-[#D8B76A] text-xs tracking-widest font-semibold">EJP</span>
              </div>
              <div>
                <p className="font-heading font-bold text-[#101827] text-sm">Église des Jeunes Prodiges</p>
                <p className="text-xs text-[#9CA3AF]">Nantes, France</p>
              </div>
            </div>
            <p className="text-sm text-[#4B5563] leading-relaxed max-w-sm mb-4">
              Une maison pour rencontrer Dieu, grandir dans la foi et marcher avec une génération qui sert avec excellence.
            </p>
            <p className="text-sm text-[#4B5563]">
              {config?.service_day || 'Dimanche'} à {config?.service_time?.replace(':', 'h') || '15h'}
              {config?.address_label && ` · ${config.address_label}`}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs uppercase tracking-widest text-[#D8B76A] font-semibold mb-4">Navigation</p>
            <div className="flex flex-col gap-2.5">
              <Link to="/" className="text-sm text-[#4B5563] hover:text-[#101827] transition-colors">Accueil</Link>
              <Link to="/a-propos" className="text-sm text-[#4B5563] hover:text-[#101827] transition-colors">Qui sommes-nous ?</Link>
              <Link to="/programmes" className="text-sm text-[#4B5563] hover:text-[#101827] transition-colors">Nos Programmes</Link>
              <Link to="/venir" className="text-sm text-[#4B5563] hover:text-[#101827] transition-colors">Rejoins-nous</Link>
              <Link to="/espace-serviteur" className="text-sm text-[#4B5563] hover:text-[#101827] transition-colors">Espace Serviteur</Link>
            </div>
          </div>

          {/* Contact + socials */}
          <div>
            <p className="text-xs uppercase tracking-widest text-[#D8B76A] font-semibold mb-4">Nous contacter</p>
            <div className="flex flex-col gap-2.5 mb-5">
              {config?.contact_email && (
                <a href={`mailto:${config.contact_email}`} className="flex items-center gap-2 text-sm text-[#4B5563] hover:text-[#101827] transition-colors">
                  <Mail className="w-4 h-4 text-[#D8B76A]" /> Email
                </a>
              )}
              <Link to="/venir" className="text-sm text-[#4B5563] hover:text-[#101827] transition-colors">Préparer ma venue</Link>
              <Link to="/espace-serviteur" className="text-sm text-[#4B5563] hover:text-[#101827] transition-colors">Espace serviteur</Link>
            </div>
            {socials.length > 0 && (
              <div className="flex gap-3">
                {socials.map(s => {
                  const Icon = s.icon;
                  return (
                    <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white border border-[#E8E2D5] flex items-center justify-center hover:border-[#D8B76A]/40 hover:bg-[#F5F0E8] transition-all">
                      <Icon className="w-4 h-4 text-[#4B5563]" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-[#E8E2D5] pt-8">
          <p className="text-xs text-[#9CA3AF]">
            © {new Date().getFullYear()} Église des Jeunes Prodiges Nantes. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}