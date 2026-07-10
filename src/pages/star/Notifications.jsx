import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle, Calendar, GraduationCap, CalendarClock, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/star/PageHeader';

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

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.StarNotification.list('-created_date', 100).then(notifs => {
      setNotifications(notifs || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-secondary animate-spin" />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <PageHeader
        title="Notifications"
        intention={`${unreadCount} non lue(s) sur ${notifications.length} notification(s)`}
        breadcrumbs={[{ label: 'Accueil', to: '/app' }, { label: 'Notifications' }]}
      />

      {unreadCount > 0 && (
        <button
          onClick={markAllAsRead}
          className="text-xs text-secondary hover:text-secondary/80 mb-4"
        >
          Tout marquer comme lu
        </button>
      )}

      {notifications.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <Bell className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucune notification.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => {
            const Icon = ICON_MAP[n.notification_type] || Bell;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => { markAsRead(n.id); if (n.link) window.location.href = n.link; }}
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  n.is_read ? 'bg-card border-border' : 'bg-secondary/5 border-secondary/20'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  n.is_read ? 'bg-surface text-muted-foreground' : 'bg-secondary/10 text-secondary'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.is_read ? 'font-medium text-foreground/70' : 'font-semibold text-foreground'}`}>{n.title}</p>
                  {n.message && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(n.created_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!n.is_read && <span className="w-2 h-2 rounded-full bg-secondary flex-shrink-0 mt-3" />}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}