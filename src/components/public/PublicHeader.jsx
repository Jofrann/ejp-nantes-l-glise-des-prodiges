import { PublicText, usePublicText } from '@/components/public/PublicCopy';
import useChromeInset from '@/hooks/useChromeInset';
import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
const links = [['/', 'Accueil'], ['/a-propos', 'La maison'], ['/fij', 'Familles d’impact'], ['/programmes', 'Nos rendez-vous'], ['/venir', 'Nous rejoindre']];
export default function PublicHeader() {
  const text = usePublicText();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggle = useRef(null);
  const headerRef = useRef(null);
  useChromeInset(headerRef, '--app-header-height');
  const { pathname, hash } = useLocation();
  useEffect(() => {
    setOpen(false);
    if (!hash) { window.scrollTo(0, 0); return; }
    const frame = requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' }));
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 24);
    scroll(); window.addEventListener('scroll', scroll, { passive: true });
    return () => window.removeEventListener('scroll', scroll);
  }, []);
  useEffect(() => {
    if (!open) return;
    const escape = e => { if (e.key === 'Escape') { setOpen(false); toggle.current?.focus(); } };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [open]);
  return <header className={`ejp-header ${pathname === '/' && !scrolled && !open ? 'ejp-header-light' : ''}`}>
    <div className="ejp-scroll-progress" aria-hidden="true" />
    <div ref={headerRef} className="ejp-header-inner">
      <Link to="/" className="ejp-brand" aria-label={text("EJP Nantes, accueil")}><img className="ejp-logo" src="/brand/ejp-logo.png" width="289" height="203" alt="Église des Jeunes Prodiges" /><span><PublicText value={"NANTES"} /><br /><small><PublicText value={"Une génération qui rayonne"} /></small></span></Link>
      <nav className="ejp-desktop-nav" aria-label={text("Navigation principale")}>{links.map(([url, label]) => <NavLink key={url} to={url} end={url === '/'}><PublicText value={label} /></NavLink>)}</nav>
      <Link to="/venir" className="ejp-header-cta"><PublicText value={"Je viens dimanche "} /><ArrowUpRight size={16} /></Link>
      <button ref={toggle} className="ejp-menu-toggle" aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open} aria-controls="ejp-mobile-nav" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </div>
    {open && <nav id="ejp-mobile-nav" className="ejp-mobile-nav" aria-label={text("Navigation mobile")}>{links.map(([url, label]) => <NavLink key={url} to={url} end={url === '/'} onClick={() => setOpen(false)}><PublicText value={label} /><ArrowUpRight size={20} /></NavLink>)}<Link to="/espace-serviteur" onClick={() => setOpen(false)}><PublicText value={"Espace serviteur "} /><ArrowUpRight size={20} /></Link></nav>}
  </header>;
}
