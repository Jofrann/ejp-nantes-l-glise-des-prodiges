import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { isBureauLike } from '@/lib/permissions';
import StarOSLayout from './StarOSLayout';
import BureauLayout from './BureauLayout';

export default function RoleLayout() {
  const children = <Outlet />;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  // Le bureau/bergère/admin garde le BureauLayout avec sa navigation spécifique
  if (isBureauLike(user)) {
    return <BureauLayout user={user}>{children}</BureauLayout>;
  }

  // Tous les autres serviteurs utilisent STAR OS
  return <StarOSLayout user={user}>{children}</StarOSLayout>;
}