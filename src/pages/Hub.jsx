import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Megaphone, Users, Settings, LogOut,
  Bell, ChevronDown, Menu, X, Users2, Briefcase
} from 'lucide-react';
import PostCard from '@/components/hub/PostCard';
import NewPostForm from '@/components/hub/NewPostForm';
import { isBureauLike, getPrimaryRoleLabel } from '@/lib/permissions';

const NAV = [
  { id: 'feed', label: 'Hub', icon: LayoutDashboard, to: '/hub' },
  { id: 'departements', label: 'Départements', icon: Users2, to: '/app/departements' },
  { id: 'workspace', label: 'Mon Espace', icon: Briefcase, to: '/app' },
  { id: 'profil', label: 'Mon Profil', icon: Settings, to: '/app/profil' },
];

export default function Hub() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState('parvis');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const location = useLocation();

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.Post.list('-created_date', 30),
      base44.entities.Department.filter({ is_active: true }, 'display_order', 50),
      base44.entities.DepartmentMember.filter({ is_active: true }, null, 200),
    ]).then(([u, p, d, members]) => {
      setUser(u);
      setPosts(p || []);
      const allDepts = d || [];
      const admin = isBureauLike(u);
      const myDeptIds = (members || []).filter(m => m.user_id === u?.id).map(m => m.department_id);
      const visibleDepts = admin ? allDepts : allDepts.filter(dept => myDeptIds.includes(dept.id));
      setDepartments(visibleDepts);
      setLoading(false);
    });
  }, []);

  const filteredPosts = posts.filter(p => p.type === tab);
  const canPostAnnouncement = isBureauLike(user);

  const handleNewPost = (post) => {
    setPosts(prev => [post, ...prev]);
  };

  const firstName = user?.full_name?.split(' ')[0] || 'Serviteur';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Salut' : 'Bonsoir';

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-border border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-60 border-r border-border sticky top-0 h-screen bg-card/90 backdrop-blur-xl z-30">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-secondary/40 flex items-center justify-center">
              <span className="font-display text-secondary text-[10px] tracking-widest">EJP</span>
            </div>
            <span className="text-foreground text-sm font-semibold">EJP Hub</span>
          </div>
        </div>

        {/* User badge */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3 bg-surface rounded-xl p-3">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-secondary/10 border border-secondary/20 flex items-center justify-center flex-shrink-0">
              {user?.photo_url ? (
                <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-secondary">{firstName[0]}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{user?.full_name}</p>
              <p className="text-[10px] text-muted-foreground">{getPrimaryRoleLabel(user)}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(item => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.id}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? 'bg-secondary/10 text-secondary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}

          {departments.length > 0 && (
            <div className="pt-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-3 mb-2">Mes Départements</p>
              {departments.slice(0, 4).map(d => (
                <Link
                  key={d.id}
                  to={`/app/departements/${d.slug || d.id}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-surface transition-all truncate"
                >
                  <div className="w-2 h-2 rounded-full bg-secondary/50 flex-shrink-0" />
                  {d.name}
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Footer sidebar */}
        <div className="px-3 py-4 border-t border-border space-y-1">
          <button
            onClick={() => base44.auth.logout()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-danger/70 hover:text-danger hover:bg-danger/5 transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col p-4 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <span className="text-secondary font-semibold">EJP Hub</span>
              <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            {NAV.map(item => (
              <Link key={item.id} to={item.to} onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-surface transition-all">
                <item.icon className="w-4 h-4" /> {item.label}
              </Link>
            ))}
            <button onClick={() => base44.auth.logout()}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-danger/70 hover:text-danger mt-auto">
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="sticky top-0 z-20 bg-card/80 backdrop-blur-xl border-b border-border px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-semibold text-foreground">
                {greeting}, {firstName}
              </h1>
              <p className="text-xs text-muted-foreground hidden md:block">Une jeunesse. Une foi. Une maison.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-xl bg-surface border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <Link to="/app/profil" className="flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-xl px-3 py-1.5 hover:bg-secondary/15 transition-all">
              <div className="w-5 h-5 rounded-full overflow-hidden bg-secondary/20 flex items-center justify-center">
                {user?.photo_url ? (
                  <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[9px] font-bold text-secondary">{firstName[0]}</span>
                )}
              </div>
              <span className="text-xs text-secondary font-medium hidden sm:block">{firstName}</span>
            </Link>
          </div>
        </header>

        {/* Feed zone */}
        <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-5">

          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { id: 'parvis', label: 'Le Parvis', sub: 'Flux interactif' },
              { id: 'announcement', label: 'Fil Officiel', sub: 'Direction' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-3 px-4 rounded-xl border text-left transition-all ${
                  tab === t.id
                    ? 'bg-secondary/10 border-secondary/30 text-secondary'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-surface'
                }`}
              >
                <p className="text-sm font-semibold">{t.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t.sub}</p>
              </button>
            ))}
          </div>

          {/* Nouveau post */}
          {(tab === 'parvis' || canPostAnnouncement) && (
            <NewPostForm
              currentUser={user}
              type={tab}
              canPostAnnouncement={canPostAnnouncement}
              onPost={handleNewPost}
            />
          )}

          {/* Posts */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-sm">
                {tab === 'parvis'
                  ? 'Sois le premier à partager quelque chose !'
                  : 'Aucune annonce officielle pour l\'instant.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={user}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}