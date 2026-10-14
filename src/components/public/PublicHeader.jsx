import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
const links = [['/', 'Accueil'], ['/a-propos', 'La maison'], ['/fij', 'Familles d’impact'], ['/programmes', 'Nos rendez-vous'], ['/venir', 'Nous rejoindre']];
export default function PublicHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggle = useRef(null);
  const { pathname } = useLocation();
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [pathname]);
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
    <div className="ejp-header-inner">
      <Link to="/" className="ejp-brand" aria-label="EJP Nantes, accueil"><img className="ejp-logo" src="/brand/ejp-logo.png" width="289" height="203" alt="Église des Jeunes Prodiges" /><span>NANTES<br /><small>Une génération qui rayonne</small></span></Link>
      <nav className="ejp-desktop-nav" aria-label="Navigation principale">{links.map(([url, label]) => <NavLink key={url} to={url} end={url === '/'}>{label}</NavLink>)}</nav>
      <Link to="/venir" className="ejp-header-cta">Je viens dimanche <ArrowUpRight size={16} /></Link>
      <button ref={toggle} className="ejp-menu-toggle" aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open} aria-controls="ejp-mobile-nav" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </div>
    {open && <nav id="ejp-mobile-nav" className="ejp-mobile-nav" aria-label="Navigation mobile">{links.map(([url, label]) => <NavLink key={url} to={url} end={url === '/'} onClick={() => setOpen(false)}>{label}<ArrowUpRight size={20} /></NavLink>)}<Link to="/espace-serviteur" onClick={() => setOpen(false)}>Espace serviteur <ArrowUpRight size={20} /></Link></nav>}
  </header>;
}
