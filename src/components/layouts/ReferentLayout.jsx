import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Users, User, BookOpen } from 'lucide-react';
import AppHeader from './AppHeader';

const navItems = [
  { path: '/espace-serviteur', label: 'Tableau de bord', icon: Home },
  { path: '/departements', label: 'Départements', icon: Users },
  { path: '/profil', label: 'Mon Profil', icon: User },
  { path: '/', label: 'Site public', icon: BookOpen },
];

const roleConfig = {
  label: 'Référent',
  accentClass: 'text-blue-400',
  avatarClass: 'bg-blue-400/20 border-blue-400/30 text-blue-400',
  navActiveClass: 'bg-blue-500/15 text-blue-300 border border-blue-500/20',
};

export default function ReferentLayout({ children, user }) {
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