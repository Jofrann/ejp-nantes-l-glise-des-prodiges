import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { LayoutDashboard, Megaphone, CalendarDays, Users2, User, LogOut } from 'lucide-react';

const baseLink = "flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent font-medium text-sm text-ejp-textMuted hover:text-ejp-textLight hover:bg-white/5 transition-all duration-200 group";
const activeRS  = "bg-black/50 text-white border-l-2 border-l-ejp-orangeRS";
const activeTAF = "bg-black/50 text-white border-l-2 border-l-ejp-blueTAF";

export default function DashboardSidebar({ user, departments = [] }) {
  const firstName = user?.full_name?.split(' ')[0] || '?';

  return (
    <aside className="w-64 h-full bg-ejp-panel/80 backdrop-blur-xl border-r border-ejp-greyTech flex flex-col justify-between p-4 z-30 flex-shrink-0">

      {/* ── HAUT ── */}
      <div className="flex flex-col gap-6">

        {/* Branding */}
        <div className="flex items-center gap-2.5 px-2 pb-4 border-b border-ejp-greyTech/30">
          <div className="w-7 h-7 rounded-full bg-ejp-orangeRS/15 border border-ejp-orangeRS/30 flex items-center justify-center flex-shrink-0">
            <span className="text-ejp-orangeRS text-[9px] font-bold tracking-widest">EJP</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-ejp-textLight text-sm font-semibold tracking-wide">EJP Hub</span>
            <span className="text-ejp-orangeRS text-[9px] uppercase tracking-widest font-bold">Dashboard</span>
          </div>
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-ejp-orangeRS shadow-[0_0_6px_#ff5500] animate-pulse flex-shrink-0" />
        </div>

        {/* Nav Communauté (accent Orange) */}
        <div className="flex flex-col gap-1">
          <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-ejp-textMuted mb-1">Communauté</p>

          <NavLink to="/espace-serviteur" end className={({ isActive }) => `${baseLink} ${isActive ? activeRS : ''}`}>
            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
            Main Deck
          </NavLink>

          <NavLink to="/hub" className={({ isActive }) => `${baseLink} ${isActive ? activeRS : ''}`}>
            <Megaphone className="w-4 h-4 flex-shrink-0" />
            Le Parvis
          </NavLink>
        </div>

        {/* Nav Opérationnel (accent Bleu) */}
        <div className="flex flex-col gap-1">
          <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-ejp-textMuted mb-1">Opérationnel</p>

          <NavLink to="/departements" className={({ isActive }) => `${baseLink} ${isActive ? activeTAF : ''}`}>
            <Users2 className="w-4 h-4 flex-shrink-0" />
            Départements
          </NavLink>

          <NavLink to="/profil" className={({ isActive }) => `${baseLink} ${isActive ? activeTAF : ''}`}>
            <User className="w-4 h-4 flex-shrink-0" />
            Mon Profil
          </NavLink>
        </div>

        {/* Mes Pôles (dynamique) */}
        {departments.length > 0 && (
          <div className="flex flex-col gap-1 border-t border-ejp-greyTech/20 pt-4">
            <p className="px-4 text-[9px] font-bold uppercase tracking-widest text-ejp-textMuted mb-1">Mes Pôles</p>
            {departments.slice(0, 5).map(d => (
              <NavLink
                key={d.id}
                to={`/departement/${d.id}`}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'text-ejp-blueTAF bg-ejp-blueTAF/10 border border-ejp-blueTAF/20'
                      : 'text-ejp-textMuted hover:text-ejp-textLight hover:bg-white/5'
                  }`
                }
              >
                <span className="h-1.5 w-1.5 rounded-full bg-ejp-blueTAF/60 flex-shrink-0" />
                {d.name}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* ── BAS ── */}
      <div className="flex flex-col gap-1 border-t border-ejp-greyTech/30 pt-4">
        <div className="flex items-center gap-3 px-4 py-3 mb-1">
          <div className="w-7 h-7 rounded-full bg-ejp-orangeRS/15 border border-ejp-orangeRS/20 flex items-center justify-center flex-shrink-0">
            {user?.photo_url
              ? <img src={user.photo_url} alt="" className="w-full h-full object-cover rounded-full" />
              : <span className="text-xs font-bold text-ejp-orangeRS">{firstName[0]}</span>
            }
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-ejp-textLight truncate">{user?.full_name}</p>
            <p className="text-[10px] text-ejp-textMuted capitalize">{user?.role || 'Serviteur'}</p>
          </div>
        </div>

        <button
          onClick={() => base44.auth.logout('/')}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all w-full font-medium"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>

    </aside>
  );
}