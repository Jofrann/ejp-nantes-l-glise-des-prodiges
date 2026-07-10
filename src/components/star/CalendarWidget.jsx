import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default function CalendarWidget({ events = [], onDayClick }) {
  const [cursor, setCursor] = useState(new Date());

  const todayStr = new Date().toISOString().split('T')[0];

  const eventMap = useMemo(() => {
    const map = {};
    events.forEach(ev => {
      if (!ev.event_date) return;
      if (!map[ev.event_date]) map[ev.event_date] = [];
      map[ev.event_date].push(ev);
    });
    return map;
  }, [events]);

  const days = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    // Monday = 0
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const cells = [];
    // Previous month padding
    for (let i = startOffset; i > 0; i--) {
      const d = new Date(year, month, 1 - i);
      cells.push({ date: d, inMonth: false });
    }
    // Current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      cells.push({ date: new Date(year, month, d), inMonth: true });
    }
    // Next month padding to fill 6 rows (42 cells)
    while (cells.length < 42) {
      const last = cells[cells.length - 1].date;
      cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false });
    }
    return cells;
  }, [cursor]);

  const prevMonth = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const nextMonth = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  const goToday = () => setCursor(new Date());

  // Upcoming events list (sorted, future only, max 4)
  const upcoming = useMemo(() => {
    return events
      .filter(e => e.event_date && e.event_date >= todayStr)
      .sort((a, b) => a.event_date.localeCompare(b.event_date))
      .slice(0, 4);
  }, [events, todayStr]);

  const colorForType = (type) => {
    const map = {
      culte: 'bg-primary',
      ejp: 'bg-secondary',
      formation: 'bg-indigo-500',
      reunion: 'bg-blue-500',
      service: 'bg-emerald-500',
      special: 'bg-rose-500',
      autre: 'bg-muted-foreground',
    };
    return map[type] || 'bg-secondary';
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalIcon className="w-4 h-4 text-secondary" />
          <span className="text-sm font-semibold text-foreground">{MONTHS[cursor.getMonth()]} {cursor.getFullYear()}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-surface text-muted-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={goToday} className="text-xs font-medium text-secondary px-2 py-1 rounded-lg hover:bg-surface transition-colors">
            Aujourd'hui
          </button>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-surface text-muted-foreground transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-muted-foreground/70 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((cell, i) => {
          const dateStr = cell.date.toISOString().split('T')[0];
          const cellEvents = eventMap[dateStr] || [];
          const isToday = dateStr === todayStr;
          const hasEvents = cellEvents.length > 0;

          return (
            <button
              key={i}
              onClick={() => onDayClick && onDayClick(dateStr, cellEvents)}
              className={`
                relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-all
                ${cell.inMonth ? 'text-foreground' : 'text-muted-foreground/40'}
                ${isToday ? 'bg-secondary/15 border border-secondary/30 font-bold text-secondary' : hasEvents ? 'hover:bg-surface border border-border' : 'hover:bg-surface border border-transparent'}
              `}
            >
              <span className={isToday ? 'font-bold' : ''}>{cell.date.getDate()}</span>
              {hasEvents && (
                <div className="flex gap-0.5 mt-0.5">
                  {cellEvents.slice(0, 3).map((ev, idx) => (
                    <span key={idx} className={`w-1 h-1 rounded-full ${colorForType(ev.event_type)}`} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border flex-wrap">
        {[
          { type: 'culte', label: 'Culte' },
          { type: 'ejp', label: 'EJP' },
          { type: 'formation', label: 'Formation' },
          { type: 'reunion', label: 'Réunion' },
          { type: 'service', label: 'Service' },
        ].map(({ type, label }) => (
          <span key={type} className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className={`w-1.5 h-1.5 rounded-full ${colorForType(type)}`} /> {label}
          </span>
        ))}
      </div>

      {/* Upcoming list */}
      {upcoming.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border space-y-1.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">À venir</p>
          {upcoming.map(ev => (
            <div key={ev.id} className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${colorForType(ev.event_type)}`} />
              <span className="text-xs text-muted-foreground font-medium w-12">
                {new Date(ev.event_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
              </span>
              <span className="text-xs text-foreground truncate">{ev.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}