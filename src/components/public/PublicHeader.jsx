import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, Calendar, MapPin, Clock, Sparkles, Camera, Music, HeartHandshake, HelpCircle, Navigation } from 'lucide-react';

const NAV_ITEMS = [
  {
    label: 'Découvrir',
    links: [
      { label: 'Notre vision', href: '#vision' },
      { label: 'Bergère & leaders', href: '#bergere' },
      { label: 'Témoignages', href: '#temoignages' },
      { label: 'Ministères', href: '#ministeres' },
    ],
  },
  {
    label: 'Ce dimanche',
    links: [
      { label: 'Horaire du culte', href: '#ce-dimanche' },
      { label: 'Adresse', href: '#ce-dimanche' },
      { label: 'Compte à rebours', href: '#ce-dimanche' },
      { label: 'Ajouter au calendrier', href: '#ce-dimanche' },
    ],
  },
  {
    label: 'Ambiance',
    links: [
      { label: 'Photos', href: '#galerie' },
      { label: 'Vidéos', href: '#galerie' },
      { label: 'Louange', href: '#immersion' },
      { label: 'Vie fraternelle', href: '#immersion' },
    ],
  },
  {
    label: 'Venir',
    links: [
      { label: 'Préparer ma venue', href: '/venir', isRoute: true },
      { label: 'Google Maps', href: '#ce-dimanche' },
      { label: 'Première fois ?', href: '#premiere-fois' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
];

export default function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[70] transition-all duration-500 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl border-b border-[#E8E2D5] shadow-[0_2px_20px_rgba(16,24,39,0.04)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-screen-xl mx-auto flex items-center justify-between px-5 md:px-8 h-16 md:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-full border-2 border-[#D8B76A] flex items-center justify-center bg-white/60">
              <span className="font-display text-[#D8B76A] text-[11px] tracking-widest font-semibold">EJP</span>
            </div>
            <span className={`text-sm font-heading font-semibold tracking-wide hidden sm:block ${scrolled ? 'text-[#101827]' : 'text-[#101827]'}`}>
              Nantes
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <button className={`flex items-center gap-1 px-3.5 py-2 text-sm font-medium transition-colors ${scrolled ? 'text-[#4B5563] hover:text-[#101827]' : 'text-[#4B5563] hover:text-[#101827]'}`}>
                  {item.label}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${hoveredItem === item.label ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {hoveredItem === item.label && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50"
                    style={{ minWidth: '220px' }}
                  >
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-[#E8E2D5] shadow-[0_20px_60px_rgba(16,24,39,0.10)] p-2 overflow-hidden">
                      {item.links.map((link) =>
                        link.isRoute ? (
                          <Link
                            key={link.label}
                            to={link.href}
                            className="block px-4 py-2.5 text-sm text-[#4B5563] hover:bg-[#FBFAF7] hover:text-[#101827] rounded-xl transition-colors whitespace-nowrap"
                          >
                            {link.label}
                          </Link>
                        ) : (
                          <a
                            key={link.label}
                            href={link.href}
                            className="block px-4 py-2.5 text-sm text-[#4B5563] hover:bg-[#FBFAF7] hover:text-[#101827] rounded-xl transition-colors whitespace-nowrap"
                          >
                            {link.label}
                          </a>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <Link
              to="/venir"
              className="hidden sm:flex items-center gap-2 bg-[#101827] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#1a2740] transition-all hover:scale-[1.02] shadow-[0_4px_20px_rgba(216,183,106,0.15)]"
            >
              Je viens dimanche
            </Link>
            <button
              className="lg:hidden p-2 text-[#101827]"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[69] lg:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 left-0 right-0 bg-white shadow-2xl rounded-b-3xl p-6 pt-20 max-h-[85vh] overflow-y-auto">
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <div key={item.label} className="border-b border-[#F0EBE0] last:border-0 pb-3 mb-3">
                  <p className="text-xs uppercase tracking-widest text-[#D8B76A] font-semibold mb-2">{item.label}</p>
                  <div className="grid grid-cols-2 gap-1">
                    {item.links.map((link) =>
                      link.isRoute ? (
                        <Link
                          key={link.label}
                          to={link.href}
                          onClick={() => setMobileOpen(false)}
                          className="text-sm text-[#4B5563] hover:text-[#101827] py-1.5"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          key={link.label}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className="text-sm text-[#4B5563] hover:text-[#101827] py-1.5"
                        >
                          {link.label}
                        </a>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/venir"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-[#101827] text-white text-sm font-semibold py-3.5 rounded-full mt-4"
            >
              Je viens dimanche
            </Link>
            <Link
              to="/espace-serviteur"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center w-full text-sm text-[#4B5563] py-3 mt-2"
            >
              Espace serviteur
            </Link>
          </div>
        </div>
      )}
    </>
  );
}