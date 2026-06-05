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
  accentClass: 'text-ejp-orangeRS',
  avatarClass: 'bg-ejp-orangeRS/15 border-ejp-orangeRS/30 text-ejp-orangeRS',
  navActiveClass: 'bg-ejp-orangeRS/10 text-white border border-ejp-orangeRS/25 border-l-2 border-l-ejp-orangeRS',
};

export default function ServiteurLayout({ children, user }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-ejp-void text-ejp-textLight flex flex-col">
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