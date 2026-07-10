import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, LogOut, User, Plus, X, Bell, Menu as MenuIcon,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { isBureauLike, isAdmin } from '@/lib/permissions';
import { MOBILE_BOTTOM_NAV } from '@/lib/starMegaMenu';
import MegaMenu, { MobilePlanStar } from '@/components/star/MegaMenu';

const QUICK_ACTIONS = [
  { label: 'Déclarer une présence', icon: 'CheckCircle', to: '/app/presences' },
  { label: 'Demander un rendez-vous', icon: 'CalendarClock', to: '/app/rendez-vous' },
  { label: 'Créer un objectif', icon: 'Target', to: '/app/objectifs' },
  { label: 'Ajouter une lecture', icon: 'BookOpen', to: '/app/croissance' },
  { label: 'Ajouter une occupation', icon: 'Clock', to: '/app/agenda' },
];

export default function StarLayout({ children, user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [planOpen, setPlanOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const showSupervision = isBureauLike(user);
  const showAdmin = isAdmin(user);

  const isActive = (item) => {
    if (item.end) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const handleLogout = () => base44.auth.logout('/');

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header desktop — glass premium avec mega-menu */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-header">
        <div className="h-full flex items-center justify-between px-4 max-w-screen-2xl">
          {/* Logo */}
          <Link to="/app" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-secondary to-gold-light flex items-center justify-center shadow-sm">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-heading font-bold text-sm text-foreground">EJP Nantes</span>
              <span className="text-[9px] uppercase tracking-widest text-secondary">STAR OS</span>
            </div>
          </Link>

          {/* Mega-menu desktop */}
          <MegaMenu
            showSupervision={showSupervision}
            showAdmin={showAdmin}
            onNavigate={() => {}}
          />

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {/* Quick actions + */}
            <div className="relative">
              <button
                onClick={() => setQuickOpen(!quickOpen)}
                className="w-8 h-8 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary hover:bg-secondary/20 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {quickOpen && (
                  <>
                    <div className="fixed inset-0 z-[55]" onClick={() => setQuickOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 top-10 z-[56] glass-panel rounded-2xl p-2 min-w-[240px]"
                    >
                      {QUICK_ACTIONS.map(({ label, to }) => (
                        <button
                          key={to}
                          onClick={() => { navigate(to); setQuickOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-surface transition-colors text-left"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                          {label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <button className="hidden md:flex w-8 h-8 rounded-xl items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface transition-all">
              <Bell className="w-4 h-4" />
            </button>

            {/* Profil */}
            <Link to="/app/profil" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border border-secondary/30 bg-secondary/10 flex items-center justify-center text-xs font-bold text-secondary overflow-hidden">
                {user?.photo_url ? (
                  <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  user?.full_name?.[0] || '?'
                )}
              </div>
              <span className="hidden lg:block text-xs text-foreground max-w-[100px] truncate">{user?.full_name}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-danger transition-colors p-1.5 rounded-lg hover:bg-surface"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setPlanOpen(true)}
              className="lg:hidden w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface transition-all"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pt-16 pb-20 md:pb-8">
        {children}
      </main>

      {/* Bottom nav mobile — Accueil, Agenda, Présences, Formation, Menu */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-bottom lg:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {MOBILE_BOTTOM_NAV.map(({ path, label, icon: Icon, end }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors ${
                isActive({ path, end })
                  ? 'text-secondary'
                  : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium">{label}</span>
            </Link>
          ))}
          <button
            onClick={() => setPlanOpen(true)}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-muted-foreground"
          >
            <MenuIcon className="w-5 h-5" />
            <span className="text-[9px] font-medium">Menu</span>
          </button>
        </div>
      </nav>

      {/* Mobile "Plan STAR" drawer */}
      <MobilePlanStar
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        showSupervision={showSupervision}
        showAdmin={showAdmin}
      />
    </div>
  );
}