import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';

const NAV_ITEMS = [
  {
    label: 'Qui sommes-nous ?',
    href: '/a-propos',
    sections: [
      { label: 'Notre vision', anchor: '#vision' },
      { label: 'Nos valeurs', anchor: '#valeurs' },
      { label: 'Notre histoire', anchor: '#histoire' },
      { label: 'Les responsables', anchor: '#responsables' },
    ],
  },
  {
    label: 'Nos Programmes',
    href: '/programmes',
    sections: [
      { label: 'Réunion de jeunesse', anchor: '#reunion' },
      { label: 'Événements', anchor: '#evenements' },
      { label: 'Calendrier', anchor: '#calendrier' },
    ],
  },
  {
    label: 'Rejoins-nous',
    href: '/venir',
    sections: [
      { label: 'Horaire / lieu / date', anchor: '#horaire' },
      { label: 'Comment venir', anchor: '#comment-venir' },
      { label: 'FAQ', anchor: '#faq' },
      { label: 'Nous contacter', anchor: '#contact' },
    ],
  },
];

export default function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);

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
            ? 'bg-white/90 backdrop-blur-xl border-b border-[#E8E2D5] shadow-[0_2px_20px_rgba(16,24,39,0.05)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-screen-xl mx-auto flex items-center justify-between px-5 md:px-8 h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-full border-2 border-[#D8B76A] flex items-center justify-center bg-white/60">
              <span className="font-display text-[#D8B76A] text-[11px] tracking-widest font-semibold">EJP</span>
            </div>
            <span className="text-sm font-heading font-semibold tracking-wide hidden sm:block text-[#101827]">
              Nantes
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {/* Accueil */}
            <Link to="/" className="px-3.5 py-2 text-sm font-medium text-[#4B5563] hover:text-[#101827] transition-colors">
              Accueil
            </Link>

            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  to={item.href}
                  className="flex items-center gap-1 px-3.5 py-2 text-sm font-medium text-[#4B5563] hover:text-[#101827] transition-colors"
                >
                  {item.label}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${hoveredItem === item.label ? 'rotate-180' : ''}`} />
                </Link>

                {hoveredItem === item.label && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50" style={{ minWidth: '210px' }}>
                    <div className="bg-white/97 backdrop-blur-xl rounded-2xl border border-[#E8E2D5] shadow-[0_20px_60px_rgba(16,24,39,0.10)] p-2">
                      {item.sections.map((sec) => (
                        <Link
                          key={sec.label}
                          to={item.href + sec.anchor}
                          className="block px-4 py-2.5 text-sm text-[#4B5563] hover:bg-[#FBFAF7] hover:text-[#101827] rounded-xl transition-colors whitespace-nowrap"
                        >
                          {sec.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Espace Serviteur */}
            <Link to="/espace-serviteur" className="px-3.5 py-2 text-sm font-medium text-[#4B5563] hover:text-[#101827] transition-colors">
              Espace Serviteur
            </Link>
          </nav>

          {/* CTA + hamburger */}
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
              {/* Accueil */}
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-semibold text-[#101827] py-3 border-b border-[#F0EBE0]"
              >
                Accueil
              </Link>

              {NAV_ITEMS.map((item) => (
                <div key={item.label} className="border-b border-[#F0EBE0]">
                  <button
                    className="w-full flex items-center justify-between text-sm font-semibold text-[#101827] py-3"
                    onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                  >
                    {item.label}
                    <ChevronDown className={`w-4 h-4 transition-transform text-[#D8B76A] ${mobileExpanded === item.label ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileExpanded === item.label && (
                    <div className="pb-3 grid grid-cols-2 gap-1 pl-2">
                      {item.sections.map((sec) => (
                        <Link
                          key={sec.label}
                          to={item.href + sec.anchor}
                          onClick={() => setMobileOpen(false)}
                          className="text-sm text-[#4B5563] hover:text-[#101827] py-1.5"
                        >
                          {sec.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Espace Serviteur */}
              <Link
                to="/espace-serviteur"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-semibold text-[#101827] py-3 border-b border-[#F0EBE0]"
              >
                Espace Serviteur
              </Link>
            </div>

            <Link
              to="/venir"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-[#101827] text-white text-sm font-semibold py-3.5 rounded-full mt-5"
            >
              Je viens dimanche
            </Link>
          </div>
        </div>
      )}
    </>
  );
}