import React from 'react';
import { MOBILE_BOTTOM_NAV } from '@/lib/starMegaMenu';
import { privateSection } from '@/lib/privateNavigation';
import { Link, useLocation } from 'react-router-dom';
import { Briefcase, GraduationCap, BookOpen, Grid2X2, Settings, Users, Shield } from 'lucide-react';
const MAIN = MOBILE_BOTTOM_NAV.map(({path,label,icon}) => [path,label,icon]);
export default function PrivateSidebar({showAdmin,showSupervision,extraModules,onOpenTools}) {
 const {pathname}=useLocation();
 const active=path=>MAIN.some(row=>row[0]===path) ? privateSection(pathname)===privateSection(path) : pathname===path || pathname.startsWith(path+'/');
 const item=([path,label,Icon])=><Link key={path} to={path} className={`private-nav-item ${active(path)?'is-active':''}`} aria-current={active(path)?'page':undefined}><Icon aria-hidden="true"/><span>{label}</span></Link>;
 return <aside className="private-sidebar" aria-label="Espace serviteur"><Link to="/app" className="private-brand"><img src="/brand/ejp-logo.png" alt="Église des Jeunes Prodiges"/><span><b>EJP Nantes</b><small>ESPACE SERVITEUR</small></span></Link><nav aria-label="Navigation principale">{MAIN.map(item)}<button className="private-nav-item" onClick={onOpenTools}><Grid2X2 aria-hidden="true"/><span>Explorer mon espace</span></button></nav><p className="private-nav-label">GESTION ET ACCÈS</p><nav aria-label="Mes responsabilités">{item(['/app/ressources','Ressources',BookOpen])}{extraModules.includes('etudiant')&&item(['/app/etudiant','Espace étudiant',GraduationCap])}{extraModules.includes('equipe')&&item(['/app/equipe','Mon équipe',Users])}{showSupervision&&item(['/app/pilotage','Pilotage',Shield])}{showAdmin&&<>{item(['/app/annuaire','Annuaire',Users])}{item(['/app/departements','Ministères',Briefcase])}{item(['/app/admin','Administration',Settings])}</>}</nav><div className="private-sidebar-footer"><div className="private-community"><b>Une maison. Une famille.</b><span>Église des Jeunes Prodiges</span></div>{item(['/app/profil','Mon profil & préférences',Settings])}</div></aside>;
}
