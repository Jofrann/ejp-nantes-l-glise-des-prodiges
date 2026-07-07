import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, User, BookOpen, Users } from 'lucide-react';
import AppHeader from './AppHeader';

const navItems = [
  { path: '/app', label: 'Tableau de bord', icon: Home },
  { path: '/app/departements', label: 'Départements', icon: Users },
  { path: '/app/profil', label: 'Mon Profil', icon: User },
  { path: '/', label: 'Site public', icon: BookOpen },
];

const roleConfig = {
  label: 'Serviteur',
  accentClass: 'text-secondary',
  avatarClass: 'bg-secondary/10 border-secondary/30 text-secondary',
  navActiveClass: 'bg-secondary/10 text-secondary border border-secondary/20',
};

export default function ServiteurLayout({ children, user }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
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