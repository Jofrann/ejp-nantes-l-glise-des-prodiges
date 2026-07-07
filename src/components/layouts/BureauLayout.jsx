import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Users, BarChart3, Settings, User } from 'lucide-react';
import AppHeader from './AppHeader';

const navItems = [
  { path: '/app/direction', label: 'Direction', icon: BarChart3 },
  { path: '/app/departements', label: 'Départements', icon: Users },
  { path: '/app/profil', label: 'Mon Profil', icon: User },
  { path: '/app/admin', label: 'Admin vitrine', icon: Settings },
  { path: '/', label: 'Site public', icon: Home },
];

const roleConfig = {
  label: 'Bureau',
  accentClass: 'text-purple-400',
  avatarClass: 'bg-purple-400/20 border-purple-400/30 text-purple-400',
  navActiveClass: 'bg-purple-500/15 text-purple-300 border border-purple-500/20',
};

export default function BureauLayout({ children, user }) {
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