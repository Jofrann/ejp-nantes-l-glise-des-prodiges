import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Calendar, CheckCircle, GraduationCap, Sprout,
  CalendarClock, Target, BookOpen, Map, Settings,
  Briefcase, MoreHorizontal, Heart, LogOut, User,
  LayoutGrid, X
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { isBureauLike, isAdmin, hasRole, getPrimaryRoleLabel } from '@/lib/permissions';

const MAIN_NAV = [
  { path: '/app', label: 'Accueil', icon: Home, end: true },
  { path: '/app/agenda', label: 'Agenda', icon: Calendar },
  { path: '/app/presences', label: 'Présences', icon: CheckCircle },
  { path: '/app/formations', label: 'Formations', icon: GraduationCap },
  { path: '/app/croissance', label: 'Croissance', icon: Sprout },
  { path: '/app/rendez-vous', label: 'RDV', icon: CalendarClock },
];

const MORE_NAV = [
  { path: '/app/objectifs', label: 'Objectifs', icon: Target },
  { path: '/app/ressources', label: 'Ressources', icon: BookOpen },
  { path: '/app/parcours', label: 'Parcours', icon: Map },
  { path: '/app/responsabilites', label: 'Responsabilités', icon: Briefcase },
  { path: '/app/organisation', label: 'Organisation', icon: LayoutGrid },
  { path: '/app/espace-personnel', label: 'Mon espace', icon: Settings },
  { path: '/app/profil', label: 'Profil', icon: User },
];

export default function StarOSLayout({ children, user }) {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const showDirection = isBureauLike(user);
  const showAdmin = isAdmin(user);

  const isActive = (item) => {
    if (item.end) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const handleLogout = () => base44.auth.logout('/');

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header desktop */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-b border-border h-14">
        <div className="h-full flex items-center justify-between px-4 max-w-screen-2xl">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-semibold text-sm text-foreground">EJP Nantes</span>
              <span className="text-[9px] uppercase tracking-widest text-secondary">STAR OS</span>
            </div>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-0.5">
            {MAIN_NAV.map(({ path, label, icon: Icon, end }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive({ path, end })
                    ? 'bg-secondary/10 text-secondary border border-secondary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
            <button
              onClick={() => setMoreOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface transition-all"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
              Plus
            </button>
            {showDirection && (
              <Link
                to="/app/direction"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive({ path: '/app/direction' })
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface'
                }`}
              >
                Direction
              </Link>
            )}
            {showAdmin && (
              <Link
                to="/app/admin"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive({ path: '/app/admin' })
                    ? 'bg-danger/10 text-danger border border-danger/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface'
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Profil */}
          <div className="flex items-center gap-2">
            <Link to="/app/profil" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-secondary/30 bg-secondary/10 flex items-center justify-center text-xs font-bold text-secondary overflow-hidden">
                {user?.photo_url ? (
                  <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  user?.full_name?.[0] || '?'
                )}
              </div>
              <span className="hidden md:block text-xs text-foreground max-w-[100px] truncate">{user?.full_name}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-danger transition-colors p-1.5 rounded-lg hover:bg-surface"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pt-14 pb-20 md:pb-6">
        {children}
      </main>

      {/* Bottom nav mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {MAIN_NAV.map(({ path, label, icon: Icon, end }) => (
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
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-muted-foreground"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[9px] font-medium">Plus</span>
          </button>
        </div>
      </nav>

      {/* Panel "Plus" */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
              className="fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-card rounded-t-3xl border-t border-border p-6 pb-8 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-foreground">Plus d'options</h3>
                <button onClick={() => setMoreOpen(false)} className="text-muted-foreground p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {MORE_NAV.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMoreOpen(false)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                      isActive({ path })
                        ? 'bg-secondary/10 border-secondary/20 text-secondary'
                        : 'bg-surface border-border text-foreground hover:border-secondary/20'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium text-center leading-tight">{label}</span>
                  </Link>
                ))}
                {showDirection && (
                  <Link
                    to="/app/direction"
                    onClick={() => setMoreOpen(false)}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border bg-primary/5 border-primary/20 text-primary"
                  >
                    <LayoutGrid className="w-5 h-5" />
                    <span className="text-[10px] font-medium text-center">Direction</span>
                  </Link>
                )}
                {showAdmin && (
                  <Link
                    to="/app/admin"
                    onClick={() => setMoreOpen(false)}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border bg-danger/5 border-danger/20 text-danger"
                  >
                    <Settings className="w-5 h-5" />
                    <span className="text-[10px] font-medium text-center">Admin</span>
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}