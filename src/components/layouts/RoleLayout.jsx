import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

export default function RoleLayout() {
  const [user, setUser] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.Department.filter({ is_active: true }, 'display_order', 10),
    ]).then(([u, d]) => {
      setUser(u);
      setDepartments(d || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-ejp-void">
        <div className="w-7 h-7 border-2 border-ejp-greyTech border-t-ejp-orangeRS rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-ejp-void text-ejp-textLight">

      {/* Sidebar desktop */}
      <div className="hidden md:flex">
        <DashboardSidebar user={user} departments={departments} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0">
            <DashboardSidebar user={user} departments={departments} />
          </div>
        </div>
      )}

      {/* Bloc droite */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader user={user} onMobileMenuToggle={() => setMobileOpen(v => !v)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>

    </div>
  );
}