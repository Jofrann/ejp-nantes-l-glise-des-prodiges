import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, MessageCircle, LogIn } from 'lucide-react';

export default function HomeFooter({ config }) {
  return (
    <footer className="bg-gray-950 border-t border-white/5 py-12 px-6">
      <div className="max-w-screen-lg mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Identité */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
                <span className="text-amber-400 font-bold text-[10px]">EJP</span>
              </div>
              <span className="text-white font-semibold text-sm">EJP Nantes</span>
            </div>
            <p className="text-gray-600 text-xs leading-relaxed">
              Église des Jeunes Prodiges<br />
              Culte chaque {config?.service_day || 'dimanche'} à {config?.service_time || '15h00'}<br />
              {config?.address_label || 'Nantes, Loire-Atlantique'}
            </p>
          </div>

          {/* Liens */}
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Navigation</p>
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              {['#vision', '#culte', '#evenements', '#leaders', '#ministeres', '#adresse', '#contact'].map(href => (
                <a key={href} href={href} className="hover:text-amber-400 transition-colors capitalize">
                  {href.replace('#', '')}
                </a>
              ))}
            </div>
          </div>

          {/* Réseaux & espace serviteur */}
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Nous suivre</p>
            <div className="flex gap-3 mb-6">
              {[
                { icon: Instagram, href: config?.instagram_url || '#' },
                { icon: Youtube, href: config?.youtube_url || '#' },
                { icon: MessageCircle, href: config?.whatsapp_url || '#' },
              ].map(({ icon: Icon, href }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-amber-400 hover:border-amber-400/30 transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-xs text-gray-600 hover:text-amber-400 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              Espace serviteur
            </Link>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 text-center">
          <p className="text-xs text-gray-700">
            © {new Date().getFullYear()} EJP Nantes — Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
}