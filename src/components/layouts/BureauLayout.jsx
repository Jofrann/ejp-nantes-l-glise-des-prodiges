import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Users, Settings, BookOpen, BarChart3, Shield, LogOut, Menu, X, Heart, Bell } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const navItems = [
  { path: '/', label: 'Accueil', icon: Home },
  { path: '/bureau/annuaire', label: 'Annuaire', icon: Users },
  { path: '/bureau/ministeres', label: 'Ministères', icon: BookOpen },
  { path: '/bureau/stats', label: 'Statistiques', icon: BarChart3 },
  { path: '/bureau/parametres', label: 'Paramètres', icon: Settings },
];

export default function BureauLayout({ children, user }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => base44.auth.logout('/');

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Admin Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-purple-500/10">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-violet-700 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-semibold text-sm text-white">EJP Nantes</span>
              <span className="text-[9px] text-purple-400 uppercase tracking-widest">Bureau</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  location.pathname === path
                    ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button className="hidden md:flex w-8 h-8 items-center justify-center text-gray-400 hover:text-white rounded-lg hover:bg-white/5">
              <Bell className="w-4 h-4" />
            </button>
            <div className="hidden md:flex items-center gap-2 mr-2">
              <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-400">
                {user?.full_name?.[0] || 'B'}
              </div>
              <span className="text-xs text-gray-300">{user?.full_name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1 text-gray-500 hover:text-red-400 transition-colors text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
            <button
              className="md:hidden text-gray-400"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-14 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-b border-white/10 p-4 md:hidden"
        >
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all mb-1 ${
                location.pathname === path ? 'bg-purple-500/15 text-purple-300' : 'text-gray-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 mt-2 w-full"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </motion.div>
      )}

      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="flex-1 pt-14"
      >
        {children}
      </motion.main>
    </div>
  );
}