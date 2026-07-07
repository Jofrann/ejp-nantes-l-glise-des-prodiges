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
  accentClass: 'text-primary',
  avatarClass: 'bg-primary/10 border-primary/30 text-primary',
  navActiveClass: 'bg-primary/10 text-primary border border-primary/20',
};

export default function BureauLayout({ children, user }) {
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