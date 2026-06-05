import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Search, Menu } from 'lucide-react';

const BREADCRUMBS = {
  '/espace-serviteur': 'Main Deck',
  '/hub': 'Le Parvis',
  '/departements': 'Départements',
  '/profil': 'Mon Profil',
};

export default function DashboardHeader({ user, onMobileMenuToggle }) {
  const location = useLocation();
  const firstName = user?.full_name?.split(' ')[0] || 'Serviteur';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Salut' : 'Bonsoir';

  const currentPage = Object.entries(BREADCRUMBS).find(([path]) =>
    location.pathname === path || (path !== '/espace-serviteur' && location.pathname.startsWith(path))
  )?.[1] || 'Hub';

  return (
    <header className="h-14 w-full bg-ejp-panel/70 backdrop-blur-xl border-b border-ejp-greyTech flex items-center justify-between px-6 flex-shrink-0 z-20">

      {/* Gauche : breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          className="md:hidden text-ejp-textMuted hover:text-white p-1"
          onClick={onMobileMenuToggle}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="text-xs font-semibold tracking-wider uppercase text-ejp-textMuted flex items-center gap-2">
          <span>EJP Hub</span>
          <span className="text-ejp-greyTech">/</span>
          <span className="text-ejp-textLight bg-white/5 border border-ejp-greyTech/40 px-2 py-0.5 rounded">
            {currentPage}
          </span>
        </div>
      </div>

      {/* Droite : outils */}
      <div className="flex items-center gap-3">

        {/* Recherche */}
        <div className="hidden sm:flex items-center gap-2 w-48 h-9 bg-black/30 border border-ejp-greyTech rounded-lg px-3 text-xs text-ejp-textMuted">
          <Search className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Rechercher...</span>
        </div>

        {/* Notifications */}
        <button className="h-9 w-9 bg-white/5 hover:bg-white/8 border border-ejp-greyTech rounded-lg flex items-center justify-center text-ejp-textMuted hover:text-white transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-ejp-orangeRS" />
        </button>

        {/* Avatar + salutation */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-ejp-greyTech">
          <div className="hidden sm:flex flex-col items-end leading-none">
            <span className="text-xs font-semibold text-ejp-textLight">{greeting}, {firstName}</span>
            <span className="text-[10px] text-ejp-textMuted capitalize">{user?.role || 'Serviteur'}</span>
          </div>
          <Link to="/profil" className="relative h-8 w-8 rounded-xl overflow-hidden bg-ejp-orangeRS/15 border border-ejp-orangeRS/25 flex items-center justify-center">
            {user?.photo_url
              ? <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
              : <span className="text-xs font-bold text-ejp-orangeRS">{firstName[0]}</span>
            }
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-ejp-void" />
          </Link>
        </div>
      </div>

    </header>
  );
}