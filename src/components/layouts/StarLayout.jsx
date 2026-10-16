import useChromeInset from '@/hooks/useChromeInset';
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import {
  LogOut, Plus, Menu as MenuIcon, Shield, Settings, User, ChevronDown,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { isBureauLike, isAdmin, getRoles } from '@/lib/permissions';
import { MOBILE_BOTTOM_NAV } from '@/lib/starMegaMenu';
import { MobilePlanStar } from '@/components/star/MegaMenu';
import PrivateSidebar from '@/components/star/PrivateSidebar';
import NotificationBell from '@/components/star/NotificationBell';

const QUICK_ACTIONS = [
  { label: 'Déclarer une présence', to: '/app/presences' },
  { label: 'Demander un rendez-vous', to: '/app/rendez-vous' },
  { label: 'Créer un objectif', to: '/app/objectifs' },
  { label: 'Ajouter une lecture', to: '/app/croissance' },
  { label: 'Ajouter une occupation', to: '/app/agenda' },
];

export default function StarLayout({ children, user }) {
  const headerRef = useRef(null);
  const bottomRef = useRef(null);
  useChromeInset(headerRef, '--app-header-height');
  useChromeInset(bottomRef, '--app-bottom-height');
  const location = useLocation();
  const navigate = useNavigate();
  const [planOpen, setPlanOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const showSupervision = user?.account_status === 'active' && (user?.ejp_permissions?.canViewAllEJPData === true || user?.ejp_permissions?.canManagePilotageDecisions === true);
  const showAdmin = isAdmin(user);
  const [workspaceAccess,setWorkspaceAccess]=useState({managed:false,student:false});
  useEffect(()=>{let current=true;
    if(!user?.id || user.first_login)return;
    Promise.all([base44.functions.invoke('getManagedDepartments',{}),base44.functions.invoke('getAcademicEligibility',{})]).then(([managed,academic])=>{if(current)setWorkspaceAccess({managed:managed.data.departments.length>0,student:academic.data.is_student});}).catch(()=>{if(current)setWorkspaceAccess({managed:false,student:false});});
    return()=>{current=false;};
  },[user?.id,user?.first_login]);

  // Fermer overlays sur changement de route
  useEffect(() => {
    setPlanOpen(false);
    setProfileOpen(false);
    setQuickOpen(false);
  }, [location.pathname]);

  // Modules conditionnels basés sur les badges
  const extraModules = [];
  const roles = getRoles(user);
  // Badge Étudiant: si l'utilisateur est étudiant, alternant ou en recherche
  if (workspaceAccess.student) {
    extraModules.push('etudiant');
  }
  // Badge Responsable: référent ou bureau → Mon Équipe
  if (workspaceAccess.managed) {
    extraModules.push('equipe');
  }

  const isActive = (item) => {
    if (item.end) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  useEffect(() => {
    const escape = event => { if (event.key === 'Escape') { setQuickOpen(false); setProfileOpen(false); } };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, []);

  const handleLogout = () => base44.auth.logout('/');

  return (
    <MotionConfig reducedMotion="user"><div className="serviteur-app min-h-screen bg-background text-foreground flex flex-col" data-page={location.pathname}>
      <PrivateSidebar showAdmin={showAdmin} showSupervision={showSupervision} extraModules={extraModules} onOpenTools={() => setPlanOpen(true)} />
      {/* Header desktop — glass premium, simplified */}
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 glass-header">
        <div className="h-full flex items-center justify-between px-4 max-w-screen-2xl">
          {/* Logo */}
          <Link to="/app" className="flex items-center gap-2 flex-shrink-0">
            <img src="/brand/ejp-logo.png" alt="Église des Jeunes Prodiges" className="serviteur-logo" width="75" height="55" />
            <div className="flex flex-col leading-none">
              <span className="font-heading font-bold text-sm text-foreground">EJP Nantes</span>
              <span className="text-[9px] uppercase tracking-widest text-secondary">ESPACE SERVITEUR</span>
            </div>
          </Link>

          {/* Mega-menu desktop — anchored per-trigger */}
          <div className="private-header-context"><span>Mon espace</span><span aria-hidden="true">/</span><b>{location.pathname === '/app' ? 'Mon bureau' : location.pathname.startsWith('/app/departements') ? 'Ministères' : location.pathname.startsWith('/app/admin') ? 'Administration' : location.pathname.startsWith('/app/formations') ? 'Formations' : location.pathname.startsWith('/app/annuaire') ? 'Annuaire' : 'Espace serviteur'}</b></div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {/* Quick actions + */}
            <div className="relative hidden sm:block">
              <button
                aria-label="Actions rapides" aria-expanded={quickOpen}
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
            <NotificationBell />

            {/* Profil + restricted links */}
            <div className="relative">
              <button
                aria-label="Mon profil et mes accès" aria-expanded={profileOpen}
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-1.5 px-1.5 py-1 rounded-xl hover:bg-surface transition-all"
              >
                <div className="w-8 h-8 rounded-full border border-secondary/30 bg-secondary/10 flex items-center justify-center text-xs font-bold text-secondary overflow-hidden">
                  {user?.photo_url ? (
                    <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user?.full_name?.[0] || '?'
                  )}
                </div>
                <ChevronDown className="w-3 h-3 text-muted-foreground hidden lg:block" />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-[55]" onClick={() => setProfileOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 top-11 z-[56] glass-panel rounded-2xl p-2 min-w-[220px]"
                    >
                      <div className="px-3 py-2 border-b border-border/50 mb-1">
                        <p className="text-xs font-semibold text-foreground truncate">{user?.full_name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{user?.internal_identifier || user?.email}</p>
                      </div>
                      <button
                        onClick={() => { navigate('/app/profil'); setProfileOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-surface transition-colors text-left"
                      >
                        <User className="w-3.5 h-3.5 text-muted-foreground" /> Mon profil
                      </button>
                      <button
                        onClick={() => { navigate('/app/espace-personnel'); setProfileOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-surface transition-colors text-left"
                      >
                        <Settings className="w-3.5 h-3.5 text-muted-foreground" /> Espace personnel
                      </button>
                      {showSupervision && (
                        <button
                          onClick={() => { navigate('/app/pilotage'); setProfileOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-surface transition-colors text-left"
                        >
                          <Shield className="w-3.5 h-3.5 text-primary" /> Pilotage
                        </button>
                      )}
                      {showAdmin && (
                        <button
                          onClick={() => { navigate('/app/admin'); setProfileOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-surface transition-colors text-left"
                        >
                          <Settings className="w-3.5 h-3.5 text-danger" /> Administration
                        </button>
                      )}
                      <div className="border-t border-border/50 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-danger hover:bg-danger/5 transition-colors text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Déconnexion
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu trigger */}
            <button
              aria-label="Ouvrir le menu serviteur" aria-expanded={planOpen}
              onClick={() => setPlanOpen(true)}
              className="private-menu-trigger xl:hidden w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface transition-all"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="serviteur-main flex-1 min-w-0">
        {children}
      </main>

      {/* Bottom nav mobile — Accueil, Agenda, Présences, Plus */}
      <nav ref={bottomRef} className="fixed bottom-0 left-0 right-0 z-50 glass-bottom xl:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {MOBILE_BOTTOM_NAV.map(({ path, label, icon: Icon, end }) => (
            <Link
              key={path}
              to={path}
              aria-current={isActive({path,end}) ? "page" : undefined}
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
            aria-expanded={planOpen} aria-label="Tous les outils"
            onClick={() => setPlanOpen(true)}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-muted-foreground"
          >
            <MenuIcon className="w-5 h-5" />
            <span className="text-[9px] font-medium">Plus</span>
          </button>
        </div>
      </nav>

      {/* Mobile "Plan STAR" drawer */}
      <MobilePlanStar
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        showSupervision={showSupervision}
        showAdmin={showAdmin}
        extraModules={extraModules}
      />
    </div></MotionConfig>
  );
}
