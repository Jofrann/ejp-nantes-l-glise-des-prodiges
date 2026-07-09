import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ChevronRight, CalendarDays } from 'lucide-react';

export default function Agenda() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');

  useEffect(() => {
    base44.entities.Event.list('-event_date', 30).then(evs => {
      const today = new Date().toISOString().split('T')[0];
      setEvents((evs || []).filter(e => e.is_active && e.event_date >= today));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const grouped = {};
  events.forEach(ev => {
    const dateKey = ev.event_date;
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(ev);
  });

  const dateKeys = Object.keys(grouped).sort();

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
        <h1 className="text-xl font-heading font-bold text-foreground mb-1">Mon agenda</h1>
        <p className="text-sm text-muted-foreground">Cultes, programmes, réunions et rendez-vous.</p>
      </motion.div>

      {/* Sélecteur de vue */}
      <div className="flex gap-1 mb-6 bg-surface border border-border rounded-xl p-1">
        {['list', 'week', 'month'].map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              view === v ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            {v === 'list' ? 'Liste' : v === 'week' ? 'Semaine' : 'Mois'}
          </button>
        ))}
      </div>

      {dateKeys.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-surface border border-border mb-4">
            <CalendarDays className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">Aucun événement prévu</p>
          <p className="text-xs text-muted-foreground">Ton agenda est à jour pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {dateKeys.map((dateKey, gi) => {
            const date = new Date(dateKey);
            const isToday = dateKey === new Date().toISOString().split('T')[0];
            const dayEvents = grouped[dateKey];

            return (
              <motion.div key={dateKey} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.05 }}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    {isToday ? "Aujourd'hui" : date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h3>
                  {isToday && <span className="text-[10px] text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">Aujourd'hui</span>}
                </div>
                <div className="space-y-2">
                  {dayEvents.map(ev => (
                    <div key={ev.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm">
                      <div className="flex-shrink-0 w-12 text-center bg-secondary/10 border border-secondary/20 rounded-xl py-2">
                        <p className="text-[10px] text-secondary font-medium uppercase">
                          {date.toLocaleDateString('fr-FR', { month: 'short' })}
                        </p>
                        <p className="text-base font-bold text-secondary leading-none">{date.getDate()}</p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">{ev.title}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          {ev.event_time && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" /> {ev.event_time}
                            </span>
                          )}
                          {ev.location && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                              <MapPin className="w-3 h-3" /> {ev.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}