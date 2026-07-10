import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, Calendar, GraduationCap, CalendarClock, BookOpen, AlertCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const ICON_MAP = {
  presence: CheckCircle,
  program: Calendar,
  formation: GraduationCap,
  appointment: CalendarClock,
  resource: BookOpen,
  conflict: AlertCircle,
  fij: AlertCircle,
  system: Bell,
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const notifs = await base44.entities.StarNotification.list('-created_date', 20);
      setNotifications(notifs || []);
    } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id) => {
    await base44.entities.StarNotification.update(id, { is_read: true });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    for (const n of unread) {
      await base44.entities.StarNotification.update(n.id, { is_read: true });
    }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  // Group by time
  const now = new Date();
  const today = notifications.filter(n => {
    const d = new Date(n.created_date);
    return d.toDateString() === now.toDateString();
  });
  const thisWeek = notifications.filter(n => {
    const d = new Date(n.created_date);
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    return diff < 7 && d.toDateString() !== now.toDateString();
  });
  const older = notifications.filter(n => {
    const d = new Date(n.created_date);
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    return diff >= 7;
  });

  const renderNotif = (n) => {
    const Icon = ICON_MAP[n.notification_type] || Bell;
    return (
      <div
        key={n.id}
        onClick={() => { markAsRead(n.id); if (n.link) window.location.href = n.link; }}
        className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
          n.is_read ? 'hover:bg-surface' : 'bg-secondary/5 hover:bg-secondary/10'
        }`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          n.is_read ? 'bg-surface text-muted-foreground' : 'bg-secondary/10 text-secondary'
        }`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs ${n.is_read ? 'font-medium text-foreground/70' : 'font-semibold text-foreground'}`}>{n.title}</p>
          {n.message && <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>}
        </div>
        {!n.is_read && <span className="w-2 h-2 rounded-full bg-secondary flex-shrink-0 mt-2" />}
      </div>
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        className="relative w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface transition-all"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-danger text-white text-[8px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[55]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute right-0 top-10 z-[56] glass-panel rounded-2xl p-3 w-[320px] max-w-[calc(100vw-2rem)] max-h-[480px] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-heading font-bold text-foreground">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-[10px] text-secondary hover:text-secondary/80">
                    Tout marquer lu
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Aucune notification</p>
                </div>
              ) : (
                <>
                  {today.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest px-1 mb-1">Aujourd'hui</p>
                      {today.map(renderNotif)}
                    </div>
                  )}
                  {thisWeek.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest px-1 mb-1">Cette semaine</p>
                      {thisWeek.map(renderNotif)}
                    </div>
                  )}
                  {older.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest px-1 mb-1">Anciennes</p>
                      {older.map(renderNotif)}
                    </div>
                  )}
                </>
              )}

              <Link
                to="/app/notifications"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1 mt-2 pt-2 border-t border-border text-xs text-secondary hover:text-secondary/80"
              >
                Voir tout <ChevronRight className="w-3 h-3" />
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}