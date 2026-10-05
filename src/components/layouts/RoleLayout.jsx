import React, { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import StarLayout from './StarLayout';
import { isAuthConfigured } from '@/lib/ejpAuth';

export default function RoleLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authConfigured, setAuthConfigured] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setLoading(false);
    }).catch(() => setLoading(false));
    isAuthConfigured().then(setAuthConfigured);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  // Guard first_login : si l'auth interne est configurée ET l'utilisateur
  // a first_login=true ET n'est pas admin → forcer le changement de mot de passe.
  // L'admin et les comptes existants (avant configuration) ne sont pas affectés.
  if (authConfigured && user?.first_login) {
    const isAdmin = user.role === 'admin' || (Array.isArray(user.badges) && user.badges.includes('ADMIN'));
    if (!isAdmin) {
      return <Navigate to="/first-login" replace />;
    }
  }

  return <StarLayout user={user}><Outlet /></StarLayout>;
}