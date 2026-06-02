import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, LogOut, Menu, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * Header commun pour tous les layouts.
 * roleConfig : { label, accentClass, avatarClass, dotClass }
 * accentClass : texte coloré pour le badge de rôle (ex: 'text-amber-400')
 * avatarClass : fond de l'avatar (ex: 'bg-amber-400/20 border-amber-400/30 text-amber-400')
 * navActiveClass : classe active du lien (ex: 'bg-white/10 text-white')
 */
export default function AppHeader({ user, navItems, roleConfig }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => base44.auth.logout('/');

  const { label, accentClass, avatarClass, navActiveClass } = roleConfig;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/85 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className={`w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center`}>
              <Heart className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-semibold text-sm text-white">EJP Nantes</span>
              {label && <span className={`text-[9px] uppercase tracking-widest ${accentClass}`}>{label}</span>}
            </div>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label: lbl, icon: Icon }) => {
              const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive ? navActiveClass : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {lbl}
                </Link>
              );
            })}
          </nav>

          {/* Droite : profil + logout */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 mr-1">
              <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold ${avatarClass}`}>
                {user?.full_name?.[0] || '?'}
              </div>
              <span className="text-xs text-gray-300 max-w-[120px] truncate">{user?.full_name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1 text-gray-500 hover:text-red-400 transition-colors text-xs px-2 py-1.5 rounded-lg hover:bg-white/5"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
            <button
              className="md:hidden text-gray-400 p-1"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Menu mobile */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-14 left-0 right-0 z-40 bg-zinc-950/97 backdrop-blur-xl border-b border-white/10 p-4 md:hidden"
        >
          {/* Info utilisateur */}
          <div className="flex items-center gap-3 px-4 py-3 mb-2 border-b border-white/5">
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold ${avatarClass}`}>
              {user?.full_name?.[0] || '?'}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.full_name}</p>
              <p className={`text-xs ${accentClass}`}>{label}</p>
            </div>
          </div>

          {navItems.map(({ path, label: lbl, icon: Icon }) => {
            const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all mb-1 ${
                  isActive ? navActiveClass : 'text-gray-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                {lbl}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 mt-2 w-full rounded-lg hover:bg-white/5"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </motion.div>
      )}
    </>
  );
}