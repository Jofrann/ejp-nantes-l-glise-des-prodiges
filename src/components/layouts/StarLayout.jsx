import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Calendar, CheckCircle, GraduationCap, Sprout,
  CalendarClock, Target, BookOpen, Briefcase, MoreHorizontal,
  Heart, LogOut, User, Settings, Plus, X, Bell,
  Shield, ClipboardList, FileText, NotebookPen,
  TrendingUp
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { isBureauLike, isAdmin, isFijPilot, isFijCoordination } from '@/lib/permissions';

const MAIN_NAV = [
  { path: '/app', label: 'Accueil', icon: Home, end: true },
  { path: '/app/agenda', label: 'Agenda', icon: Calendar },
  { path: '/app/presences', label: 'Présences', icon: CheckCircle },
  { path: '/app/formations', label: 'Formations', icon: GraduationCap },
  { path: '/app/croissance', label: 'Croissance', icon: Sprout },
  { path: '/app/rendez-vous', label: 'Rendez-vous', icon: CalendarClock },
  { path: '/app/ressources', label: 'Ressources', icon: BookOpen },
];

const MOBILE_NAV = [
  { path: '/app', label: 'Accueil', icon: Home, end: true },
  { path: '/app/agenda', label: 'Agenda', icon: Calendar },
  { path: '/app/presences', label: 'Présences', icon: CheckCircle },
  { path: '/app/formations', label: 'Formations', icon: GraduationCap },
];

const MORE_NAV = [
  { path: '/app/croissance', label: 'Croissance', icon: Sprout },
  { path: '/app/rendez-vous', label: 'Rendez-vous', icon: CalendarClock },
  { path: '/app/ressources', label: 'Ressources', icon: BookOpen },
  { path: '/app/objectifs', label: 'Objectifs', icon: Target },
  { path: '/app/parcours', label: 'Parcours', icon: TrendingUp },
  { path: '/app/espace-personnel', label: 'Espace personnel', icon: NotebookPen },
  { path: '/app/responsabilites', label: 'Responsabilités', icon: Briefcase },
  { path: '/app/profil', label: 'Profil', icon: User },
];

export default function StarLayout({ children, user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const showSupervision = isBureauLike(user);
  const showAdmin = isAdmin(user);

  const isActive = (item) => {
    if (item.end) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const handleLogout = () => base44.auth.logout('/');

  const quickActions = [
    { label: 'Déclarer une présence', icon: CheckCircle, to: '/app/presences' },
    { label: 'Demander un rendez-vous', icon: CalendarClock, to: '/app/rendez-vous' },
    { label: 'Créer un objectif', icon: Target, to: '/app/objectifs' },
    { label: 'Ajouter une lecture', icon: BookOpen, to: '/app/croissance' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header desktop — glass premium */}
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
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                moreOpen ? 'bg-secondary/10 text-secondary' : 'text-muted-foreground hover:text-foreground hover:bg-surface'
              }`}
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
              Plus
            </button>
          </nav>

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
                      className="absolute right-0 top-10 z-[56] glass-panel rounded-2xl p-2 min-w-[220px]"
                    >
                      {quickActions.map(({ label, icon: Icon, to }) => (
                        <button
                          key={to}
                          onClick={() => { navigate(to); setQuickOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-surface transition-colors text-left"
                        >
                          <Icon className="w-3.5 h-3.5 text-secondary" />
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
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pt-16 pb-20 md:pb-8">
        {children}
      </main>

      {/* Bottom nav mobile — glass */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-bottom md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {MOBILE_NAV.map(({ path, label, icon: Icon, end }) => (
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
              className="fixed bottom-0 left-0 right-0 z-[70] glass-panel rounded-t-3xl p-6 pb-8 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-heading font-semibold text-foreground">Plus d'options</h3>
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
                {showSupervision && (
                  <Link
                    to="/app/supervision"
                    onClick={() => setMoreOpen(false)}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border bg-primary/5 border-primary/20 text-primary"
                  >
                    <Shield className="w-5 h-5" />
                    <span className="text-[10px] font-medium text-center">Supervision</span>
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