import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, AlertCircle, ChevronRight, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Presences() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Event.list('-event_date', 20).then(evs => {
      const today = new Date().toISOString().split('T')[0];
      setEvents((evs || []).filter(e => e.is_active && e.event_date >= today));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-border border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl font-heading font-bold text-foreground mb-1">Mes présences</h1>
        <p className="text-sm text-muted-foreground">Confirme ta présence, signale une absence ou un retard.</p>
      </motion.div>

      {events.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-surface border border-border mb-4">
            <CheckCircle className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">Aucune présence à confirmer</p>
          <p className="text-xs text-muted-foreground">Tu es à jour. Tu peux consulter ton agenda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">À confirmer</h2>
          {events.map((ev, i) => {
            const date = new Date(ev.event_date);
            const isToday = ev.event_date === new Date().toISOString().split('T')[0];
            return (
              <motion.div key={ev.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-shrink-0 w-11 text-center bg-secondary/10 border border-secondary/20 rounded-xl py-1.5">
                      <p className="text-[10px] text-secondary font-medium uppercase">
                        {date.toLocaleDateString('fr-FR', { month: 'short' })}
                      </p>
                      <p className="text-sm font-bold text-secondary leading-none">{date.getDate()}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{ev.title}</p>
                      {ev.event_time && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Clock className="w-3 h-3" /> {ev.event_time}
                        </span>
                      )}
                    </div>
                    {isToday && <span className="text-[10px] text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">Aujourd'hui</span>}
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1.5 bg-success/10 hover:bg-success/20 text-success text-xs font-semibold py-2 rounded-lg transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" /> Présent
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 bg-danger/10 hover:bg-danger/20 text-danger text-xs font-semibold py-2 rounded-lg transition-colors">
                      <AlertCircle className="w-3.5 h-3.5" /> Absent
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 bg-warning/10 hover:bg-warning/20 text-warning text-xs font-semibold py-2 rounded-lg transition-colors">
                      <Clock className="w-3.5 h-3.5" /> Retard
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-border">
        <Link to="/app/agenda" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Calendar className="w-4 h-4" />
          Voir tous les événements
          <ChevronRight className="w-4 h-4 ml-auto" />
        </Link>
      </div>
    </div>
  );
}