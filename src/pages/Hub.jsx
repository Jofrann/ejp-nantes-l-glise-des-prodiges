import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Megaphone, Users, Settings, LogOut,
  Bell, Menu, X, Users2, Briefcase
} from 'lucide-react';
import PostCard from '@/components/hub/PostCard';
import NewPostForm from '@/components/hub/NewPostForm';

const NAV = [
  { id: 'feed', label: 'Hub', icon: LayoutDashboard, to: '/hub' },
  { id: 'departements', label: 'Départements', icon: Users2, to: '/departements' },
  { id: 'workspace', label: 'Mon Espace', icon: Briefcase, to: '/espace-serviteur' },
  { id: 'profil', label: 'Mon Profil', icon: Settings, to: '/profil' },
];

const baseLinkClass = "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 font-medium";

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
      base44.entities.Department.filter({ is_active: true }, 'display_order', 10),
    ]).then(([u, p, d]) => {
      setUser(u);
      setPosts(p || []);
      setDepartments(d || []);
      setLoading(false);
    });
  }, []);

  const filteredPosts = posts.filter(p => p.type === tab);
  const canPostAnnouncement = ['admin', 'bureau'].includes(user?.role);

  const handleNewPost = (post) => {
    setPosts(prev => [post, ...prev]);
  };

  const firstName = user?.full_name?.split(' ')[0] || 'Serviteur';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Salut' : 'Bonsoir';

  if (loading) {
    return (
      <div className="min-h-screen bg-ejp-void flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-ejp-greyTech border-t-ejp-orangeRS rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ejp-void text-ejp-textLight flex">

      {/* ── Sidebar Desktop ── */}
      <aside className="hidden md:flex flex-col w-60 border-r border-ejp-greyTech sticky top-0 h-screen bg-ejp-panel/80 backdrop-blur-xl z-30">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-ejp-greyTech/40">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-ejp-orangeRS/15 border border-ejp-orangeRS/30 flex items-center justify-center">
              <span className="text-ejp-orangeRS text-[9px] font-bold tracking-widest">EJP</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-ejp-textLight text-sm font-semibold">EJP Hub</span>
              <span className="text-ejp-orangeRS text-[9px] uppercase tracking-widest font-bold">Communauté</span>
            </div>
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-ejp-orangeRS shadow-[0_0_6px_#ff5500] animate-pulse" />
          </div>
        </div>

        {/* User badge */}
        <div className="px-4 py-4 border-b border-ejp-greyTech/20">
          <div className="flex items-center gap-3 bg-white/5 border border-ejp-greyTech/30 rounded-xl p-3">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-ejp-orangeRS/15 border border-ejp-orangeRS/20 flex items-center justify-center flex-shrink-0">
              {user?.photo_url ? (
                <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-ejp-orangeRS">{firstName[0]}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ejp-textLight truncate">{user?.full_name}</p>
              <p className="text-[10px] text-ejp-textMuted capitalize">{user?.role || 'Membre'}</p>
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
                className={`${baseLinkClass} ${
                  active
                    ? 'bg-ejp-orangeRS/10 text-white border-l-2 border-l-ejp-orangeRS border border-ejp-orangeRS/20'
                    : 'text-ejp-textMuted hover:text-ejp-textLight hover:bg-white/5'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}

          {departments.length > 0 && (
            <div className="pt-4 border-t border-ejp-greyTech/20 mt-2">
              <p className="text-[10px] uppercase tracking-widest text-ejp-textMuted px-3 mb-2 font-bold">Mes Départements</p>
              {departments.slice(0, 4).map(d => (
                <Link
                  key={d.id}
                  to={`/departement/${d.id}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-ejp-textMuted hover:text-ejp-textLight hover:bg-white/5 transition-all truncate"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-ejp-blueTAF/60 flex-shrink-0" />
                  {d.name}
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Footer sidebar */}
        <div className="px-3 py-4 border-t border-ejp-greyTech/30">
          <button
            onClick={() => base44.auth.logout()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all w-full font-medium"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-ejp-panel border-r border-ejp-greyTech flex flex-col p-4">
            <div className="flex items-center justify-between mb-6">
              <span className="text-ejp-orangeRS font-bold tracking-wide">EJP HUB</span>
              <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5 text-ejp-textMuted" /></button>
            </div>
            {NAV.map(item => (
              <Link key={item.id} to={item.to} onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-ejp-textMuted hover:text-ejp-textLight hover:bg-white/5 transition-all mb-1">
                <item.icon className="w-4 h-4" /> {item.label}
              </Link>
            ))}
            <button onClick={() => base44.auth.logout()}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-red-400/60 hover:text-red-400 mt-auto hover:bg-red-500/10 transition-all">
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </aside>
        </div>
      )}

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="sticky top-0 z-20 bg-ejp-panel/70 backdrop-blur-xl border-b border-ejp-greyTech px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-ejp-textMuted hover:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-semibold text-ejp-textLight">
                {greeting}, {firstName} 👋
              </h1>
              <p className="text-xs text-ejp-textMuted hidden md:block">Une jeunesse. Une foi. Une maison.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-xl bg-white/5 border border-ejp-greyTech flex items-center justify-center text-ejp-textMuted hover:text-white transition-colors relative">
              <Bell className="w-4 h-4" />
            </button>
            <Link to="/profil" className="flex items-center gap-2 bg-ejp-orangeRS/10 border border-ejp-orangeRS/25 rounded-xl px-3 py-1.5 hover:bg-ejp-orangeRS/15 transition-all">
              <div className="w-5 h-5 rounded-full overflow-hidden bg-ejp-orangeRS/20 flex items-center justify-center">
                {user?.photo_url ? (
                  <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[9px] font-bold text-ejp-orangeRS">{firstName[0]}</span>
                )}
              </div>
              <span className="text-xs text-ejp-orangeRS font-medium hidden sm:block">{firstName}</span>
            </Link>
          </div>
        </header>

        {/* Feed zone */}
        <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-5">

          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { id: 'parvis', label: '🏠 Le Parvis', sub: 'Flux interactif', accent: 'ejp-orangeRS' },
              { id: 'announcement', label: '📢 Fil Officiel', sub: 'Direction', accent: 'ejp-blueTAF' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-3 px-4 rounded-xl border text-left transition-all duration-200 ${
                  tab === t.id
                    ? t.id === 'parvis'
                      ? 'bg-ejp-orangeRS/10 border-ejp-orangeRS/30 text-white'
                      : 'bg-ejp-blueTAF/10 border-ejp-blueTAF/30 text-white'
                    : 'bg-white/3 border-ejp-greyTech/40 text-ejp-textMuted hover:text-ejp-textLight hover:bg-white/5'
                }`}
              >
                <p className="text-sm font-semibold">{t.label}</p>
                <p className={`text-[10px] mt-0.5 ${tab === t.id ? (t.id === 'parvis' ? 'text-ejp-orangeRS' : 'text-ejp-blueTAF') : 'text-ejp-textMuted'}`}>{t.sub}</p>
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
              <p className="text-4xl mb-3">{tab === 'parvis' ? '✨' : '📢'}</p>
              <p className="text-ejp-textMuted text-sm">
                {tab === 'parvis'
                  ? 'Sois le premier à partager quelque chose !'
                  : "Aucune annonce officielle pour l'instant."}
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