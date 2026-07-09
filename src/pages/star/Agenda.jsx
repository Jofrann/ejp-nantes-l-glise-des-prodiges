import React, { useEffect, useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ChevronRight, CalendarDays, ChevronLeft, ChevronRight as ChevR } from 'lucide-react';
import { startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays, addWeeks, addMonths, startOfMonth, endOfMonth } from 'date-fns';

const VIEWS = [
  { key: 'list', label: 'Liste' },
  { key: 'week', label: 'Semaine' },
  { key: 'month', label: 'Mois' },
];

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7h - 20h

export default function Agenda() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [refDate, setRefDate] = useState(new Date());

  useEffect(() => {
    base44.entities.Event.list('-event_date', 60).then(evs => {
      const today = new Date().toISOString().split('T')[0];
      setEvents((evs || []).filter(e => e.is_active && e.event_date >= today));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const g = {};
    events.forEach(ev => {
      if (!g[ev.event_date]) g[ev.event_date] = [];
      g[ev.event_date].push(ev);
    });
    return g;
  }, [events]);

  const dateKeys = Object.keys(grouped).sort();

  const navigate = (dir) => {
    if (view === 'week') setRefDate(addWeeks(refDate, dir));
    else if (view === 'month') setRefDate(addMonths(refDate, dir));
    else setRefDate(addDays(refDate, dir));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-border border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl font-heading font-bold text-foreground mb-1">Mon agenda</h1>
        <p className="text-sm text-muted-foreground">Cultes, programmes, réunions et rendez-vous.</p>
      </motion.div>

      {/* Sélecteur de vue + navigation */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex gap-1 bg-surface border border-border rounded-xl p-1">
          {VIEWS.map(v => (
            <button key={v.key} onClick={() => setView(v.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === v.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
              {v.label}
            </button>
          ))}
        </div>
        {view !== 'list' && (
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-surface text-muted-foreground"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-xs font-medium text-foreground min-w-[120px] text-center">
              {view === 'week' ? refDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : refDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-surface text-muted-foreground"><ChevR className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      {dateKeys.length === 0 && view === 'list' ? (
        <EmptyState />
      ) : view === 'list' ? (
        <ListView grouped={grouped} dateKeys={dateKeys} />
      ) : view === 'week' ? (
        <WeekView grouped={grouped} refDate={refDate} />
      ) : (
        <MonthView grouped={grouped} refDate={refDate} />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-surface border border-border mb-4">
        <CalendarDays className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">Aucun événement prévu</p>
      <p className="text-xs text-muted-foreground">Ton agenda est à jour pour le moment.</p>
    </div>
  );
}

function EventCard({ ev, compact }) {
  const date = new Date(ev.event_date);
  return (
    <div className={`bg-card border border-border rounded-xl p-3 flex items-center gap-3 shadow-sm ${compact ? 'text-[11px]' : ''}`}>
      <div className="flex-shrink-0 w-10 text-center bg-secondary/10 border border-secondary/20 rounded-lg py-1">
        <p className="text-[9px] text-secondary font-medium uppercase">{date.toLocaleDateString('fr-FR', { month: 'short' })}</p>
        <p className="text-sm font-bold text-secondary leading-none">{date.getDate()}</p>
      </div>
      <div className="min-w-0 flex-1">
        <p className={`font-semibold text-foreground truncate ${compact ? 'text-xs' : 'text-sm'}`}>{ev.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {ev.event_time && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="w-2.5 h-2.5" /> {ev.event_time}</span>}
          {ev.location && <span className="flex items-center gap-1 text-[10px] text-muted-foreground truncate"><MapPin className="w-2.5 h-2.5" /> {ev.location}</span>}
        </div>
      </div>
    </div>
  );
}

function ListView({ grouped, dateKeys }) {
  return (
    <div className="space-y-6">
      {dateKeys.map((dateKey, gi) => {
        const date = new Date(dateKey);
        const isToday = dateKey === new Date().toISOString().split('T')[0];
        return (
          <motion.div key={dateKey} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.05 }}>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                {isToday ? "Aujourd'hui" : date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              {isToday && <span className="text-[10px] text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">Aujourd'hui</span>}
            </div>
            <div className="space-y-2">
              {grouped[dateKey].map(ev => <EventCard key={ev.id} ev={ev} />)}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function WeekView({ grouped, refDate }) {
  const weekStart = startOfWeek(refDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(refDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const today = new Date();

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* En-tête jours */}
      <div className="grid grid-cols-7 border-b border-border">
        {days.map(day => {
          const isToday = isSameDay(day, today);
          const dateStr = day.toISOString().split('T')[0];
          const hasEvents = (grouped[dateStr] || []).length > 0;
          return (
            <div key={day.toISOString()} className={`text-center py-2 border-r border-border last:border-r-0 ${isToday ? 'bg-secondary/5' : ''}`}>
              <p className="text-[9px] uppercase text-muted-foreground">{day.toLocaleDateString('fr-FR', { weekday: 'short' })}</p>
              <p className={`text-xs font-bold ${isToday ? 'text-secondary' : 'text-foreground'}`}>{day.getDate()}</p>
              {hasEvents && <div className="w-1 h-1 rounded-full bg-secondary mx-auto mt-0.5" />}
            </div>
          );
        })}
      </div>
      {/* Grille */}
      <div className="grid grid-cols-7">
        {days.map(day => {
          const dateStr = day.toISOString().split('T')[0];
          const dayEvents = grouped[dateStr] || [];
          return (
            <div key={day.toISOString()} className="border-r border-border last:border-r-0 min-h-[120px] p-1 space-y-1">
              {dayEvents.slice(0, 3).map(ev => (
                <div key={ev.id} className="bg-secondary/10 border border-secondary/20 rounded-lg p-1.5">
                  <p className="text-[10px] font-semibold text-secondary truncate">{ev.event_time || ''}</p>
                  <p className="text-[10px] text-foreground truncate">{ev.title}</p>
                </div>
              ))}
              {dayEvents.length > 3 && <p className="text-[9px] text-muted-foreground text-center">+{dayEvents.length - 3}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthView({ grouped, refDate }) {
  const monthStart = startOfMonth(refDate);
  const monthEnd = endOfMonth(refDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });
  const today = new Date();
  const weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="grid grid-cols-7 border-b border-border">
        {weekdays.map(d => (
          <div key={d} className="text-center py-2 text-[9px] uppercase text-muted-foreground border-r border-border last:border-r-0">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map(day => {
          const isToday = isSameDay(day, today);
          const inMonth = day.getMonth() === refDate.getMonth();
          const dateStr = day.toISOString().split('T')[0];
          const dayEvents = grouped[dateStr] || [];
          return (
            <div key={day.toISOString()} className={`border-r border-b border-border min-h-[60px] p-1 ${!inMonth ? 'bg-surface/50' : ''}`}>
              <p className={`text-[10px] font-medium ${isToday ? 'text-secondary font-bold' : inMonth ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                {day.getDate()}
              </p>
              {dayEvents.slice(0, 2).map(ev => (
                <div key={ev.id} className="bg-secondary/10 rounded px-1 py-0.5 mt-0.5">
                  <p className="text-[8px] text-secondary truncate">{ev.title}</p>
                </div>
              ))}
              {dayEvents.length > 2 && <p className="text-[8px] text-muted-foreground text-center">+{dayEvents.length - 2}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}