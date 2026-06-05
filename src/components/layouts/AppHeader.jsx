import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, LogOut, Menu, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AppHeader({ user, navItems, roleConfig }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => base44.auth.logout('/');

  const { label, accentClass, avatarClass, navActiveClass } = roleConfig;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-ejp-panel/80 backdrop-blur-xl border-b border-ejp-greyTech">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-ejp-orangeRS to-orange-700 flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-semibold text-sm text-ejp-textLight tracking-wide">EJP Nantes</span>
              {label && <span className={`text-[9px] uppercase tracking-widest font-bold ${accentClass}`}>{label}</span>}
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive ? navActiveClass : 'text-ejp-textMuted hover:text-ejp-textLight hover:bg-white/5'
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
              <span className="text-xs text-ejp-textMuted max-w-[120px] truncate">{user?.full_name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1 text-ejp-textMuted hover:text-red-400 transition-colors text-xs px-2 py-1.5 rounded-lg hover:bg-red-500/10"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
            <button
              className="md:hidden text-ejp-textMuted p-1"
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
          className="fixed top-14 left-0 right-0 z-40 bg-ejp-panel/97 backdrop-blur-xl border-b border-ejp-greyTech p-4 md:hidden"
        >
          <div className="flex items-center gap-3 px-4 py-3 mb-2 border-b border-ejp-greyTech/40">
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold ${avatarClass}`}>
              {user?.full_name?.[0] || '?'}
            </div>
            <div>
              <p className="text-sm font-medium text-ejp-textLight">{user?.full_name}</p>
              <p className={`text-xs font-bold ${accentClass}`}>{label}</p>
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
                  isActive ? navActiveClass : 'text-ejp-textMuted'
                }`}
              >
                <Icon className="w-4 h-4" />
                {lbl}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 mt-2 w-full rounded-lg hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </motion.div>
      )}
    </>
  );
}