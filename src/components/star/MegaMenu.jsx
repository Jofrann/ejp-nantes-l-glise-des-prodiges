import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { MEGA_MENU, MEGA_MENU_RESTRICTED } from '@/lib/starMegaMenu';

export default function MegaMenu({ showSupervision, showAdmin, onNavigate }) {
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobilePlanOpen, setMobilePlanOpen] = useState(false);
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  const allMenus = [...MEGA_MENU];
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

  const activeMenuData = allMenus.find(m => m.id === activeMenu);

  return (
    <>
      {/* Desktop mega-menu bar */}
      <nav
        className="hidden lg:flex items-center gap-0.5 relative"
        onMouseLeave={handleLeave}
      >
        {allMenus.map((menu) => (
          <div
            key={menu.id}
            className="relative"
            onMouseEnter={() => handleEnter(menu.id)}
          >
            <button
              onClick={() => handleClick(menu.route)}
              onFocus={() => handleEnter(menu.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeMenu === menu.id
                  ? 'bg-secondary/10 text-secondary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface'
              }`}
            >
              <menu.icon className="w-3.5 h-3.5" />
              {menu.label}
            </button>
          </div>
        ))}

        {/* Mega-menu panel */}
        <AnimatePresence>
          {activeMenuData && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="fixed left-1/2 -translate-x-1/2 top-[64px] z-[55] glass-panel rounded-2xl p-5 w-[640px] shadow-xl"
              onMouseEnter={() => clearTimeout(timeoutRef.current)}
              onMouseLeave={handleLeave}
            >
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
                <activeMenuData.icon className="w-4 h-4 text-secondary" />
                <span className="text-sm font-heading font-semibold text-foreground">{activeMenuData.label}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {activeMenuData.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleClick(item.to)}
                    className="flex items-start gap-3 p-3 rounded-xl text-left hover:bg-surface transition-all group"
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
      </nav>

      {/* Mobile "Plan STAR" trigger — hidden, controlled by parent */}
    </>
  );
}

export function MobilePlanStar({ open, onClose, showSupervision, showAdmin }) {
  const navigate = useNavigate();
  const allMenus = [...MEGA_MENU];
  if (showSupervision) allMenus.push(MEGA_MENU_RESTRICTED[0]);
  if (showAdmin) allMenus.push(MEGA_MENU_RESTRICTED[1]);

  const handleNav = (to) => {
    navigate(to);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] glass-panel rounded-t-3xl p-6 pb-8 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-heading font-bold text-foreground">Plan STAR</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Navigation complète STAR OS</p>
              </div>
              <button onClick={onClose} className="text-muted-foreground p-1.5 rounded-lg hover:bg-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {allMenus.map((menu) => (
                <div key={menu.id}>
                  <button
                    onClick={() => handleNav(menu.route)}
                    className="flex items-center gap-2 mb-2 text-xs font-heading font-semibold text-secondary uppercase tracking-wider"
                  >
                    <menu.icon className="w-3.5 h-3.5" />
                    {menu.label}
                  </button>
                  <div className="grid grid-cols-2 gap-2 pl-5">
                    {menu.items.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => handleNav(item.to)}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-surface/50 border border-border/50 hover:border-secondary/20 hover:bg-surface transition-all text-left"
                      >
                        <item.icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-[11px] font-medium text-foreground leading-tight">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}