import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, User, BookOpen, Users } from 'lucide-react';
import AppHeader from './AppHeader';

const navItems = [
  { path: '/espace-serviteur', label: 'Tableau de bord', icon: Home },
  { path: '/departements', label: 'Départements', icon: Users },
  { path: '/profil', label: 'Mon Profil', icon: User },
  { path: '/', label: 'Site public', icon: BookOpen },
];

const roleConfig = {
  label: 'Serviteur',
  accentClass: 'text-amber-400',
  avatarClass: 'bg-amber-400/20 border-amber-400/30 text-amber-400',
  navActiveClass: 'bg-amber-400/10 text-amber-300 border border-amber-400/20',
};

export default function ServiteurLayout({ children, user }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <AppHeader user={user} navItems={navItems} roleConfig={roleConfig} />
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex-1 pt-14"
      >
        {children}
      </motion.main>
    </div>
  );
}