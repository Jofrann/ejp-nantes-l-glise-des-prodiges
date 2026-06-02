import React from 'react';
import { Link } from 'react-router-dom';

export default function HomeFooter({ config }) {
  const links = ['#vision', '#culte', '#evenements', '#temoignages', '#ministeres', '#adresse', '#contact'];

  return (
    <footer className="bg-[#0B0B0C] border-t border-white/5 py-16 px-6">
      <div className="max-w-screen-lg mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-full border border-[#C8A96A]/30 flex items-center justify-center">
                <span className="font-display text-[#C8A96A] text-[10px] tracking-widest">EJP</span>
              </div>
              <span className="text-[#F7F4EF]/70 text-sm font-light">Nantes</span>
            </div>
            <p className="text-[#B8B8B8]/40 text-xs leading-relaxed font-light">
              Église des Jeunes Prodiges<br />
              {config?.service_day || 'Dimanche'} à {config?.service_time || '15h00'}<br />
              {config?.address_label || 'Nantes, France'}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#B8B8B8]/30 mb-5">Navigation</p>
            <div className="flex flex-col gap-3">
              {links.map(href => (
                <a key={href} href={href} className="text-xs text-[#B8B8B8]/40 hover:text-[#C8A96A] transition-colors capitalize tracking-wide">
                  {href.replace('#', '')}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#B8B8B8]/30 mb-5">Nous suivre</p>
            <div className="flex flex-col gap-3">
              {[config?.instagram_url && 'Instagram', config?.tiktok_url && 'TikTok', config?.youtube_url && 'YouTube'].filter(Boolean).map(s => (
                <span key={s} className="text-xs text-[#B8B8B8]/40 tracking-wide">{s}</span>
              ))}
            </div>
            <Link to="/dashboard" className="inline-block mt-8 text-[10px] uppercase tracking-[0.3em] text-[#B8B8B8]/25 hover:text-[#C8A96A]/60 transition-colors">
              Espace serviteur
            </Link>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8">
          <p className="text-[10px] text-[#B8B8B8]/20 font-light tracking-wide">
            © {new Date().getFullYear()} Église des Jeunes Prodiges Nantes
          </p>
        </div>
      </div>
    </footer>
  );
}