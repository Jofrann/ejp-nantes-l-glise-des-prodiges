import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ServiteurLayout from './ServiteurLayout';
import ReferentLayout from './ReferentLayout';
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
      <div className="fixed inset-0 bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    );
  }

  const role = user?.role || 'serviteur';

  if (role === 'bureau') {
    return <BureauLayout user={user}>{children}</BureauLayout>;
  }

  if (role === 'referent') {
    return <ReferentLayout user={user}>{children}</ReferentLayout>;
  }

  return <ServiteurLayout user={user}>{children}</ServiteurLayout>;
}