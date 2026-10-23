import { uniqueDestinations } from '@/lib/privateNavigation';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, NotebookPen, BellRing, Compass, ShoppingBag, Shield, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MEGA_MENU, MEGA_MENU_RESTRICTED, CONDITIONAL_MODULES } from '@/lib/starMegaMenu';

export default function MegaMenu({ showSupervision, showAdmin, extraModules = [], onNavigate }) {
  const [activeMenu, setActiveMenu] = useState(null);
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const { pathname } = useLocation();
  useEffect(() => () => clearTimeout(timeoutRef.current), []);
  useEffect(() => { setActiveMenu(null); }, [pathname]);

  const allMenus = [...MEGA_MENU];
  // Modules conditionnels (badges: étudiant, équipe)
  extraModules.forEach(modKey => {
    if (CONDITIONAL_MODULES[modKey]) allMenus.push(CONDITIONAL_MODULES[modKey]);
  });
  if (showSupervision) allMenus.push(MEGA_MENU_RESTRICTED[0]);
  if (showAdmin) allMenus.push(MEGA_MENU_RESTRICTED[1]);

  const handleEnter = (id) => {
    clearTimeout(timeoutRef.current);
    setActiveMenu(id);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 150);
  };

  const handleClick = (to) => {
    navigate(to);
    setActiveMenu(null);
    onNavigate?.();
  };

  return (
    <nav
      className="hidden xl:flex items-center gap-0.5"
      onMouseLeave={handleLeave}
    >
      {allMenus.map((menu) => {
        const isActive = activeMenu === menu.id;
        const routeActive = menu.route === '/app' ? pathname === '/app' : menu.items.some(item => pathname === item.to || pathname.startsWith(item.to + '/'));

        return (
          <div
            key={menu.id}
            className="relative"
            onMouseEnter={() => handleEnter(menu.id)}
          >
            <button
              data-route-active={routeActive}
              aria-current={routeActive ? "page" : undefined}
              onKeyDown={event => { if (event.key === "Escape") { setActiveMenu(null); } }}
              onClick={() => handleClick(menu.route)}
              onFocus={() => handleEnter(menu.id)}
              className={`serviteur-nav-trigger flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-secondary/10 text-secondary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface'
              }`}
            >
              <menu.icon className="w-3.5 h-3.5" />
              {menu.label}
            </button>

            {/* Per-item anchored dropdown — appears directly under the trigger */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 z-[55] glass-panel rounded-2xl p-4 w-[380px] shadow-xl"
                  onMouseEnter={() => clearTimeout(timeoutRef.current)}
                  onMouseLeave={handleLeave}
                >
                  <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-border/50">
                    <menu.icon className="w-4 h-4 text-secondary" />
                    <span className="text-sm font-heading font-semibold text-foreground">{menu.label}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {menu.items.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => handleClick(item.to)}
                        className="flex items-start gap-3 p-2.5 rounded-xl text-left hover:bg-surface transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-secondary/8 border border-secondary/15 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/15 transition-colors">
                          <item.icon className="w-3.5 h-3.5 text-secondary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground leading-tight">{item.label}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}

export function MobilePlanStar({open,onClose,showSupervision,showAdmin,extraModules=[]}) {
 const navigate=useNavigate();
 const [query,setQuery]=useState('');
 useEffect(()=>{if(!open)setQuery('');},[open]);
 const menus=[...MEGA_MENU,...extraModules.filter(key=>CONDITIONAL_MODULES[key]).map(key=>CONDITIONAL_MODULES[key])];
 if(showSupervision)menus.push(MEGA_MENU_RESTRICTED[0]);
 if(showAdmin)menus.push(MEGA_MENU_RESTRICTED[1]);
 const personal=[{label:'Mon parcours',desc:'Parcours du serviteur',icon:Compass,to:'/app/parcours'},{label:'Notes et occupations',desc:'Mon espace personnel',icon:NotebookPen,to:'/app/espace-personnel'},{label:'Confidentialité',desc:'Consentements et demandes',icon:Shield,to:'/app/espace-personnel/confidentialite'},{label:'Notifications',desc:'Informations et rappels',icon:BellRing,to:'/app/notifications'},{label:'Boutique EJP',desc:'Produits et informations',icon:ShoppingBag,to:'/app/ressources/boutique'}];
 if(showSupervision)personal.push({label:'Direction',desc:'Vue de direction',icon:Users,to:'/app/direction'});
 const groups=uniqueDestinations([...menus,{id:'personnel',label:'Mon espace personnel',items:personal}]).map(group=>({...group,items:group.items.filter(item=>`${item.label} ${item.desc} ${item.searchTerms || ""} ${group.label}`.toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr')))})).filter(group=>group.items.length);
 return <Dialog open={open} onOpenChange={value=>{if(!value)onClose();}}><DialogContent className="private-tools-dialog" onCloseAutoFocus={event=>{event.preventDefault();[...document.querySelectorAll('button[aria-label="Explorer mon espace"], .private-sidebar button')].find(element=>element.getClientRects().length)?.focus();}}><DialogTitle>Explorer mon espace</DialogTitle><DialogDescription>Ton espace, tes responsabilités et tes accès.</DialogDescription><div className="private-tool-search"><Search aria-hidden="true"/><label className="sr-only" htmlFor="private-tool-query">Rechercher une page</label><input id="private-tool-query" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Rechercher une page…"/>{query&&<button onClick={()=>{setQuery('');document.getElementById('private-tool-query')?.focus();}} aria-label="Effacer la recherche"><X/></button>}</div><div className="private-tool-results">{groups.length?groups.map(group=><section key={group.id}><h3>{group.label}</h3><div>{group.items.map(item=><button key={`${item.to}-${item.label}`} onClick={()=>{navigate(item.to);onClose();}}><item.icon aria-hidden="true"/><span><b>{item.label}</b><small>{item.desc}</small></span></button>)}</div></section>):<p className="private-tool-empty">Aucune page trouvée. Essaie un autre nom ou efface ta recherche.</p>}</div></DialogContent></Dialog>;
}
