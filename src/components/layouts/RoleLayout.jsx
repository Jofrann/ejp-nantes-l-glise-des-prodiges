import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import StarLayout from './StarLayout';

export default function RoleLayout() {
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

  return <StarLayout user={user}><Outlet /></StarLayout>;
}