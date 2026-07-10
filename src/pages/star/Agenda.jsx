import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, MapPin, ChevronLeft, ChevronRight,
  Plus, Filter, AlertCircle, CalendarDays
} from 'lucide-react';
import {
  startOfWeek, endOfWeek, eachDayOfInterval, isSameDay,
  addDays, addWeeks, addMonths, startOfMonth, endOfMonth,
  format, isToday as isDateToday
} from 'date-fns';
import PageHeader from '@/components/star/PageHeader';
import TimeBlockForm from '@/components/star/TimeBlockForm';
import EventDetailPanel from '@/components/star/EventDetailPanel';

const VIEWS = [
  { key: 'day', label: 'Jour' },
  { key: 'week', label: 'Semaine' },
  { key: 'month', label: 'Mois' },
  { key: 'list', label: 'Liste' },
];

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6h - 22h
const HOUR_HEIGHT = 72;

const FILTERS = [
  { key: 'all', label: 'Tout' },
  { key: 'ejp', label: 'Programmes EJP' },
  { key: 'personal', label: 'Personnel' },
  { key: 'formation', label: 'Formation' },
  { key: 'appointment', label: 'Rendez-vous' },
  { key: 'absence', label: 'Absences/Retards' },
];

const BLOCK_COLORS = {
  etudes: 'bg-blue-100 border-blue-300 text-blue-800',
  travail: 'bg-blue-100 border-blue-300 text-blue-800',
  priere: 'bg-purple-100 border-purple-300 text-purple-800',
  repos: 'bg-green-100 border-green-300 text-green-800',
  deplacement: 'bg-amber-100 border-amber-300 text-amber-800',
  service: 'bg-amber-100 border-amber-300 text-amber-800',
  formation: 'bg-violet-100 border-violet-300 text-violet-800',
  personnel: 'bg-cyan-100 border-cyan-300 text-cyan-800',
  autre: 'bg-gray-100 border-gray-300 text-gray-800',
};

const EVENT_COLORS = {
  ejp: 'bg-amber-100 border-amber-300 text-amber-800',
  culte: 'bg-amber-100 border-amber-300 text-amber-800',
  formation: 'bg-violet-100 border-violet-300 text-violet-800',
  appointment: 'bg-green-100 border-green-300 text-green-800',
  default: 'bg-secondary/10 border-secondary/20 text-secondary',
};

function getEventColor(ev) {
  if (ev.event_type === 'culte' || ev.event_type === 'ejp') return EVENT_COLORS.ejp;
  if (ev.event_type === 'formation') return EVENT_COLORS.formation;
  if (ev.event_type === 'rendez_vous') return EVENT_COLORS.appointment;
  return EVENT_COLORS.default;
}

function getBlockColor(block) {
  return BLOCK_COLORS[block.block_type] || BLOCK_COLORS.autre;
}

function timeToMinutes(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function dateStr(d) {
  return d.toISOString().split('T')[0];
}

export default function Agenda() {
  const [events, setEvents] = useState([]);
  const [timeBlocks, setTimeBlocks] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return 'day';
    return 'week';
  });
  const [refDate, setRefDate] = useState(new Date());
  const [filter, setFilter] = useState('all');
  const [miniCalMonth, setMiniCalMonth] = useState(new Date());
  const [blockForm, setBlockForm] = useState({ open: false, date: null, startTime: null, endTime: null, existing: null });
  const [eventPanel, setEventPanel] = useState({ open: false, event: null });

  const loadData = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [evs, blocks, resp] = await Promise.all([
        base44.entities.Event.list('-event_date', 60),
        base44.entities.PersonalTimeBlock.list('-start_date', 60),
        base44.entities.AttendanceResponse.list('-created_date', 60),
      ]);
      setEvents((evs || []).filter(e => e.is_active && e.event_date >= today));
      setTimeBlocks(blocks || []);
      setResponses(resp || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Merge events + personal time blocks into unified calendar items
  const calendarItems = useMemo(() => {
    const items = [];
    events.forEach(ev => {
      items.push({
        ...ev,
        _type: 'event',
        _date: ev.event_date,
        _time: ev.event_time,
        _color: getEventColor(ev),
      });
    });
    timeBlocks.forEach(block => {
      items.push({
        ...block,
        _type: 'block',
        _date: block.start_date,
        _time: block.start_time,
        _endTime: block.end_time,
        _color: getBlockColor(block),
      });
    });
    return items;
  }, [events, timeBlocks]);

  const filteredItems = useMemo(() => {
    if (filter === 'all') return calendarItems;
    if (filter === 'personal') return calendarItems.filter(i => i._type === 'block');
    if (filter === 'ejp') return calendarItems.filter(i => i._type === 'event' && (i.event_type === 'culte' || i.event_type === 'ejp' || !i.event_type));
    if (filter === 'formation') return calendarItems.filter(i => i._type === 'event' && i.event_type === 'formation');
    if (filter === 'appointment') return calendarItems.filter(i => i._type === 'event' && i.event_type === 'rendez_vous');
    if (filter === 'absence') return calendarItems.filter(i => i._type === 'response' && i.status !== 'present');
    return calendarItems;
  }, [calendarItems, filter]);

  const grouped = useMemo(() => {
    const g = {};
    filteredItems.forEach(item => {
      if (!g[item._date]) g[item._date] = [];
      g[item._date].push(item);
    });
    return g;
  }, [filteredItems]);

  const dateKeys = Object.keys(grouped).sort();

  // Detect conflicts
  const conflicts = useMemo(() => {
    const result = [];
    Object.entries(grouped).forEach(([d, items]) => {
      const timed = items.filter(i => i._time);
      for (let i = 0; i < timed.length; i++) {
        for (let j = i + 1; j < timed.length; j++) {
          const a = timed[i];
          const b = timed[j];
          const aStart = timeToMinutes(a._time);
          const aEnd = a._endTime ? timeToMinutes(a._endTime) : aStart + 60;
          const bStart = timeToMinutes(b._time);
          const bEnd = b._endTime ? timeToMinutes(b._endTime) : bStart + 60;
          if (aStart < bEnd && bStart < aEnd) {
            result.push({ date: d, a, b });
          }
        }
      }
    });
    return result;
  }, [grouped]);

  const responsesByEventId = useMemo(() => {
    const m = {};
    responses.forEach(r => { m[r.event_id] = r; });
    return m;
  }, [responses]);

  const pendingConfirmations = useMemo(() => {
    return events.filter(ev => {
      const resp = responsesByEventId[ev.id];
      return !resp || resp.status === 'no_response';
    });
  }, [events, responsesByEventId]);

  const navigate = (dir) => {
    if (view === 'week') setRefDate(addWeeks(refDate, dir));
    else if (view === 'month') setRefDate(addMonths(refDate, dir));
    else setRefDate(addDays(refDate, dir));
  };

  const handleSlotClick = (day, hour) => {
    const startTime = `${String(hour).padStart(2, '0')}:00`;
    const endTime = `${String(hour + 1).padStart(2, '0')}:00`;
    setBlockForm({ open: true, date: dateStr(day), startTime, endTime, existing: null });
  };

  const handleBlockClick = (block) => {
    setBlockForm({ open: true, date: block.start_date, startTime: block.start_time, endTime: block.end_time, existing: block });
  };

  const handleEventClick = (ev) => {
    setEventPanel({ open: true, event: ev });
  };

  const handleBlockSaved = (result) => {
    if (result._deleted) {
      setTimeBlocks(prev => prev.filter(b => b.id !== result.id));
    } else if (result.id && timeBlocks.find(b => b.id === result.id)) {
      setTimeBlocks(prev => prev.map(b => b.id === result.id ? result : b));
    } else {
      setTimeBlocks(prev => [...prev, result]);
    }
  };

  const handleResponded = (result) => {
    setResponses(prev => {
      if (prev.find(r => r.id === result.id)) {
        return prev.map(r => r.id === result.id ? result : r);
      }
      return [...prev, result];
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-border border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  const headerActions = (
    <button
      onClick={() => setBlockForm({ open: true, date: dateStr(new Date()), startTime: '09:00', endTime: '10:00', existing: null })}
      className="flex items-center gap-1.5 bg-secondary text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-secondary/90 transition-all"
    >
      <Plus className="w-3.5 h-3.5" /> Ajouter
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <PageHeader
        title="Mon agenda"
        intention="Mon calendrier personnel : programmes EJP, occupations, rendez-vous et responsabilités."
        breadcrumbs={[{ label: 'Accueil', to: '/app' }, { label: 'Mon temps' }, { label: 'Agenda' }]}
        actions={headerActions}
      />

      <div className="flex gap-6">
        {/* Zone principale */}
        <div className="flex-1 min-w-0">
          {/* Barre de contrôles */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex gap-1 bg-surface border border-border rounded-xl p-1">
                {VIEWS.map(v => (
                  <button key={v.key} onClick={() => setView(v.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === v.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                    {v.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setRefDate(new Date())}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-card border border-border text-foreground hover:bg-surface transition-all"
              >
                Aujourd'hui
              </button>
            </div>

            {view !== 'list' && (
              <div className="flex items-center gap-2">
                <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-surface text-muted-foreground border border-border">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-medium text-foreground min-w-[140px] text-center capitalize">
                  {view === 'day' ? format(refDate, 'EEEE d MMMM') :
                   view === 'week' ? `Semaine du ${format(startOfWeek(refDate, { weekStartsOn: 1 }), 'd MMM')}` :
                   format(refDate, 'MMMM yyyy')}
                </span>
                <button onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-surface text-muted-foreground border border-border">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Filtres */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="bg-card border border-border rounded-xl px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-secondary/40"
              >
                {FILTERS.map(f => (
                  <option key={f.key} value={f.key}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Vues */}
          {view === 'week' && (
            <WeekGridView
              grouped={grouped}
              refDate={refDate}
              onSlotClick={handleSlotClick}
              onBlockClick={handleBlockClick}
              onEventClick={handleEventClick}
              responsesByEventId={responsesByEventId}
            />
          )}
          {view === 'day' && (
            <DayGridView
              grouped={grouped}
              refDate={refDate}
              onSlotClick={handleSlotClick}
              onBlockClick={handleBlockClick}
              onEventClick={handleEventClick}
              responsesByEventId={responsesByEventId}
            />
          )}
          {view === 'month' && (
            <MonthView grouped={grouped} refDate={refDate} onEventClick={handleEventClick} onBlockClick={handleBlockClick} />
          )}
          {view === 'list' && (
            dateKeys.length === 0 ? <EmptyState /> : <ListView grouped={grouped} dateKeys={dateKeys} onEventClick={handleEventClick} onBlockClick={handleBlockClick} />
          )}
        </div>

        {/* Colonne contextuelle droite (desktop) */}
        <aside className="hidden xl:block w-64 flex-shrink-0 space-y-4">
          {/* Mini calendrier */}
          <MiniCalendar
            month={miniCalMonth}
            onMonthChange={setMiniCalMonth}
            selectedDate={refDate}
            onDateSelect={setRefDate}
            grouped={grouped}
          />

          {/* Présences à confirmer */}
          {pendingConfirmations.length > 0 && (
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-warning" />
                <p className="text-xs font-heading font-semibold text-foreground">Présences à confirmer</p>
              </div>
              <div className="space-y-2">
                {pendingConfirmations.slice(0, 4).map(ev => (
                  <button
                    key={ev.id}
                    onClick={() => handleEventClick(ev)}
                    className="w-full text-left p-2.5 rounded-xl bg-warning/5 border border-warning/15 hover:bg-warning/10 transition-all"
                  >
                    <p className="text-xs font-medium text-foreground truncate">{ev.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {format(new Date(ev.event_date), 'd MMM')}
                      {ev.event_time && ` · ${ev.event_time}`}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conflits */}
          {conflicts.length > 0 && (
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-danger" />
                <p className="text-xs font-heading font-semibold text-foreground">Conflits horaires</p>
              </div>
              <div className="space-y-2">
                {conflicts.map((c, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-danger/5 border border-danger/15">
                    <p className="text-[10px] text-muted-foreground mb-1">{format(new Date(c.date), 'EEEE d MMM')}</p>
                    <p className="text-xs text-foreground">{c.a.title || c.a.title}</p>
                    <p className="text-xs text-foreground">↔ {c.b.title || c.b.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Légende */}
          <div className="glass-card rounded-2xl p-4">
            <p className="text-xs font-heading font-semibold text-foreground mb-3">Légende</p>
            <div className="space-y-1.5">
              <LegendItem color="bg-amber-200" label="Programme EJP" />
              <LegendItem color="bg-cyan-200" label="Personnel" />
              <LegendItem color="bg-violet-200" label="Formation" />
              <LegendItem color="bg-green-200" label="Rendez-vous" />
            </div>
          </div>
        </aside>
      </div>

      {/* Floating add button (mobile) */}
      <button
        onClick={() => setBlockForm({ open: true, date: dateStr(new Date()), startTime: '09:00', endTime: '10:00', existing: null })}
        className="fixed bottom-20 right-4 xl:hidden w-12 h-12 rounded-full bg-secondary text-white shadow-lg flex items-center justify-center z-40 active:scale-95 transition-transform"
      >
        <Plus className="w-5 h-5" />
      </button>

      <TimeBlockForm
        open={blockForm.open}
        onClose={() => setBlockForm({ ...blockForm, open: false })}
        date={blockForm.date}
        startTime={blockForm.startTime}
        endTime={blockForm.endTime}
        existing={blockForm.existing}
        onSaved={handleBlockSaved}
      />

      <EventDetailPanel
        event={eventPanel.event}
        open={eventPanel.open}
        onClose={() => setEventPanel({ ...eventPanel, open: false })}
        existingResponse={eventPanel.event ? responsesByEventId[eventPanel.event.id] : null}
        onResponded={handleResponded}
      />
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded ${color}`} />
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

function MiniCalendar({ month, onMonthChange, selectedDate, onDateSelect, grouped }) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });
  const today = new Date();
  const weekdays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-heading font-semibold text-foreground capitalize">{format(month, 'MMMM yyyy')}</p>
        <div className="flex gap-1">
          <button onClick={() => onMonthChange(addMonths(month, -1))} className="p-1 rounded hover:bg-surface text-muted-foreground">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onMonthChange(addMonths(month, 1))} className="p-1 rounded hover:bg-surface text-muted-foreground">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {weekdays.map((d, i) => (
          <div key={i} className="text-center text-[9px] text-muted-foreground font-medium">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map(day => {
          const inMonth = day.getMonth() === month.getMonth();
          const isToday = isDateToday(day);
          const isSelected = isSameDay(day, selectedDate);
          const hasItems = (grouped[dateStr(day)] || []).length > 0;
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              className={`aspect-square rounded-lg text-[10px] font-medium flex items-center justify-center transition-all ${
                isSelected ? 'bg-secondary text-white' :
                isToday ? 'bg-secondary/15 text-secondary' :
                inMonth ? 'text-foreground hover:bg-surface' :
                'text-muted-foreground/40'
              }`}
            >
              {day.getDate()}
              {hasItems && !isSelected && <div className="w-1 h-1 rounded-full bg-secondary absolute mt-3" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeekGridView({ grouped, refDate, onSlotClick, onBlockClick, onEventClick, responsesByEventId }) {
  const weekStart = startOfWeek(refDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(refDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const today = new Date();

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* En-tête jours */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border">
        <div className="border-r border-border" />
        {days.map(day => {
          const isToday = isSameDay(day, today);
          return (
            <div key={day.toISOString()} className={`text-center py-2 border-r border-border last:border-r-0 ${isToday ? 'bg-secondary/5' : ''}`}>
              <p className="text-[9px] uppercase text-muted-foreground">{format(day, 'EEE')}</p>
              <p className={`text-xs font-bold ${isToday ? 'text-secondary' : 'text-foreground'}`}>{day.getDate()}</p>
            </div>
          );
        })}
      </div>

      {/* Grille horaire */}
      <div className="overflow-y-auto max-h-[70vh] scrollbar-none">
        {HOURS.map(hour => (
          <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border last:border-b-0">
            <div className="border-r border-border py-1 pr-2 text-right">
              <span className="text-[9px] text-muted-foreground">{String(hour).padStart(2, '0')}:00</span>
            </div>
            {days.map(day => {
              const dStr = dateStr(day);
              const dayItems = (grouped[dStr] || []).filter(item => {
                if (!item._time) return false;
                const itemHour = parseInt(item._time.split(':')[0]);
                return itemHour === hour;
              });
              return (
                <div
                  key={day.toISOString()}
                  className="border-r border-border last:border-r-0 relative hover:bg-surface/30 cursor-pointer min-h-[72px] p-0.5"
                  onClick={() => onSlotClick(day, hour)}
                >
                  {dayItems.map(item => {
                    const startMin = timeToMinutes(item._time) || hour * 60;
                    const endMin = item._endTime ? timeToMinutes(item._endTime) : startMin + 60;
                    const topOffset = ((startMin - hour * 60) / 60) * HOUR_HEIGHT;
                    const height = Math.max(20, ((endMin - startMin) / 60) * HOUR_HEIGHT - 2);
                    const resp = item._type === 'event' ? responsesByEventId[item.id] : null;
                    return (
                      <div
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          item._type === 'block' ? onBlockClick(item) : onEventClick(item);
                        }}
                        className={`absolute left-0.5 right-0.5 rounded-lg border px-1.5 py-1 text-[10px] cursor-pointer overflow-hidden ${item._color}`}
                        style={{ top: `${topOffset}px`, height: `${height}px` }}
                      >
                        <p className="font-semibold truncate">{item._type === 'block' ? item.title : item.title}</p>
                        <p className="opacity-70 truncate">{item._time}{item._endTime ? `–${item._endTime}` : ''}</p>
                        {resp && resp.status !== 'no_response' && (
                          <p className="opacity-60 truncate">{resp.status === 'present' ? '✓ Présent' : resp.status === 'absent' ? '✗ Absent' : '⏱ Retard'}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function DayGridView({ grouped, refDate, onSlotClick, onBlockClick, onEventClick, responsesByEventId }) {
  const dStr = dateStr(refDate);
  const dayItems = (grouped[dStr] || []).filter(i => i._time);
  const noTimeItems = (grouped[dStr] || []).filter(i => !i._time);
  const today = new Date();
  const isToday = isSameDay(refDate, today);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <p className="text-sm font-semibold text-foreground capitalize">{format(refDate, 'EEEE d MMMM')}</p>
        {isToday && <span className="text-[10px] text-secondary bg-secondary/10 px-2 py-0.5 rounded-full ml-2">Aujourd'hui</span>}
      </div>
      {noTimeItems.length > 0 && (
        <div className="px-4 py-2 border-b border-border space-y-1">
          {noTimeItems.map(item => (
            <div
              key={item.id}
              onClick={() => item._type === 'block' ? onBlockClick(item) : onEventClick(item)}
              className={`rounded-lg border px-2 py-1.5 cursor-pointer ${item._color}`}
            >
              <p className="text-xs font-semibold truncate">{item.title}</p>
            </div>
          ))}
        </div>
      )}
      <div className="overflow-y-auto max-h-[60vh] scrollbar-none">
        {HOURS.map(hour => (
          <div key={hour} className="flex border-b border-border last:border-b-0 min-h-[72px]">
            <div className="w-14 flex-shrink-0 py-1 pr-2 text-right border-r border-border">
              <span className="text-[9px] text-muted-foreground">{String(hour).padStart(2, '0')}:00</span>
            </div>
            <div
              className="flex-1 relative p-0.5 hover:bg-surface/30 cursor-pointer"
              onClick={() => onSlotClick(refDate, hour)}
            >
              {dayItems
                .filter(item => parseInt(item._time.split(':')[0]) === hour)
                .map(item => {
                  const startMin = timeToMinutes(item._time);
                  const endMin = item._endTime ? timeToMinutes(item._endTime) : startMin + 60;
                  const topOffset = ((startMin - hour * 60) / 60) * HOUR_HEIGHT;
                  const height = Math.max(20, ((endMin - startMin) / 60) * HOUR_HEIGHT - 2);
                  const resp = item._type === 'event' ? responsesByEventId[item.id] : null;
                  return (
                    <div
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        item._type === 'block' ? onBlockClick(item) : onEventClick(item);
                      }}
                      className={`absolute left-1 right-1 rounded-lg border px-2 py-1 text-xs cursor-pointer overflow-hidden ${item._color}`}
                      style={{ top: `${topOffset}px`, height: `${height}px` }}
                    >
                      <p className="font-semibold truncate">{item.title}</p>
                      <p className="opacity-70 truncate">{item._time}{item._endTime ? `–${item._endTime}` : ''}</p>
                      {resp && resp.status !== 'no_response' && (
                        <p className="opacity-60 truncate">{resp.status === 'present' ? '✓ Présent' : resp.status === 'absent' ? '✗ Absent' : '⏱ Retard'}</p>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthView({ grouped, refDate, onEventClick, onBlockClick }) {
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
          const dStr = dateStr(day);
          const dayItems = grouped[dStr] || [];
          return (
            <div key={day.toISOString()} className={`border-r border-b border-border min-h-[70px] p-1 ${!inMonth ? 'bg-surface/50' : ''}`}>
              <p className={`text-[10px] font-medium ${isToday ? 'text-secondary font-bold' : inMonth ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                {day.getDate()}
              </p>
              {dayItems.slice(0, 3).map(item => (
                <div
                  key={item.id}
                  onClick={() => item._type === 'block' ? onBlockClick(item) : onEventClick(item)}
                  className={`rounded px-1 py-0.5 mt-0.5 cursor-pointer text-[8px] truncate ${item._color}`}
                >
                  {item.title}
                </div>
              ))}
              {dayItems.length > 3 && <p className="text-[8px] text-muted-foreground text-center">+{dayItems.length - 3}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ListView({ grouped, dateKeys, onEventClick, onBlockClick }) {
  return (
    <div className="space-y-6">
      {dateKeys.map((dateKey, gi) => {
        const date = new Date(dateKey);
        const isToday = dateKey === dateStr(new Date());
        return (
          <motion.div key={dateKey} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.04 }}>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider capitalize">
                {isToday ? "Aujourd'hui" : format(date, 'EEEE d MMMM')}
              </h3>
              {isToday && <span className="text-[10px] text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">Aujourd'hui</span>}
            </div>
            <div className="space-y-2">
              {grouped[dateKey].map(item => (
                <div
                  key={item.id}
                  onClick={() => item._type === 'block' ? onBlockClick(item) : onEventClick(item)}
                  className={`bg-card border rounded-xl p-3 flex items-center gap-3 shadow-sm cursor-pointer hover:shadow-md transition-all ${item._color}`}
                >
                  <div className="flex-shrink-0 w-10 text-center">
                    <p className="text-[9px] opacity-70 uppercase">{format(date, 'MMM')}</p>
                    <p className="text-sm font-bold leading-none">{date.getDate()}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item._time && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="w-2.5 h-2.5" /> {item._time}{item._endTime ? `–${item._endTime}` : ''}</span>}
                      {item.location && <span className="flex items-center gap-1 text-[10px] text-muted-foreground truncate"><MapPin className="w-2.5 h-2.5" /> {item.location}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface border border-border mb-4">
        <CalendarDays className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">Aucun événement prévu</p>
      <p className="text-xs text-muted-foreground">Cliquez sur + pour ajouter une occupation personnelle.</p>
    </div>
  );
}