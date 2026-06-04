import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MapPin, Clock, Star } from 'lucide-react';

export default function CalendarSection({ events = [] }) {
  const [filter, setFilter] = useState('all');

  const upcoming = events
    .filter(e => e.is_active && new Date(e.event_date) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

  const featured = upcoming.filter(e => e.is_featured);
  const regular = upcoming.filter(e => !e.is_featured);

  const displayed = filter === 'featured' ? featured : filter === 'regular' ? regular : upcoming;

  if (upcoming.length === 0) return null;

  return (
    <section id="agenda" className="py-36 px-6 bg-zinc-950/70 backdrop-blur-md border-y border-white/5">
      <div className="max-w-screen-lg mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#C8A96A] font-medium block mb-4">
              Agenda
            </span>
            <h2 className="font-display text-4xl md:text-6xl text-[#F7F4EF] font-light leading-tight">
              Prochains événements
            </h2>
          </div>

          {/* Filtres */}
          {featured.length > 0 && (
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'Tous' },
                { id: 'featured', label: 'À la une' },
                { id: 'regular', label: 'Réguliers' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`text-[10px] uppercase tracking-[0.2em] px-4 py-2 border transition-colors duration-200 ${
                    filter === f.id
                      ? 'border-[#C8A96A] text-[#C8A96A]'
                      : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white/60'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Événements à la une — grands */}
        {filter !== 'regular' && featured.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {featured.slice(0, 2).map((event, i) => (
              <FeaturedCard key={event.id} event={event} index={i} />
            ))}
          </div>
        )}

        {/* Liste des événements réguliers */}
        <div className="space-y-0 border-t border-white/5">
          {(filter === 'all' ? regular : filter === 'regular' ? regular : filter === 'featured' ? featured.slice(2) : []).map((event, i) => (
            <EventRow key={event.id} event={event} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedCard({ event, index }) {
  const dateObj = parseISO(event.event_date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative group overflow-hidden bg-[#141414]"
    >
      {/* Image */}
      {event.image_url ? (
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        </div>
      ) : (
        <div className="aspect-[4/3] bg-[#1A1A1A] flex items-center justify-center">
          <span className="font-display text-[#C8A96A]/20 text-6xl font-light">
            {format(dateObj, 'd', { locale: fr })}
          </span>
        </div>
      )}

      {/* Badge à la une */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-[#C8A96A] text-[#0B0B0C] text-[9px] font-semibold uppercase tracking-[0.2em] px-2.5 py-1">
        <Star className="w-2.5 h-2.5" />
        À la une
      </div>

      {/* Contenu */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[#C8A96A] font-display text-2xl font-light">
            {format(dateObj, 'd', { locale: fr })}
          </span>
          <span className="text-white/50 text-xs uppercase tracking-[0.2em]">
            {format(dateObj, 'MMMM yyyy', { locale: fr })}
          </span>
        </div>
        <h3 className="font-display text-xl text-white font-light mb-2">{event.title}</h3>
        {event.description && (
          <p className="text-white/50 text-xs leading-relaxed line-clamp-2">{event.description}</p>
        )}
        <div className="flex items-center gap-4 mt-3">
          {event.event_time && (
            <span className="flex items-center gap-1.5 text-[10px] text-white/40 uppercase tracking-[0.1em]">
              <Clock className="w-3 h-3" /> {event.event_time}
            </span>
          )}
          {event.location && (
            <span className="flex items-center gap-1.5 text-[10px] text-white/40 uppercase tracking-[0.1em]">
              <MapPin className="w-3 h-3" /> {event.location}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function EventRow({ event, index }) {
  const dateObj = parseISO(event.event_date);

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="flex items-center gap-6 py-6 border-b border-white/5 group hover:bg-white/[0.02] transition-colors px-2"
    >
      {/* Date */}
      <div className="w-14 shrink-0 text-center">
        <p className="font-display text-2xl text-[#C8A96A] font-light leading-none">
          {format(dateObj, 'd', { locale: fr })}
        </p>
        <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 mt-1">
          {format(dateObj, 'MMM', { locale: fr })}
        </p>
      </div>

      {/* Séparateur */}
      <div className="w-px h-10 bg-white/10 shrink-0" />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-lg text-[#F7F4EF] font-light truncate">{event.title}</h3>
        <div className="flex items-center gap-4 mt-1">
          {event.event_time && (
            <span className="flex items-center gap-1 text-[10px] text-white/30 uppercase tracking-[0.1em]">
              <Clock className="w-2.5 h-2.5" /> {event.event_time}
            </span>
          )}
          {event.location && (
            <span className="flex items-center gap-1 text-[10px] text-white/30 uppercase tracking-[0.1em]">
              <MapPin className="w-2.5 h-2.5" /> {event.location}
            </span>
          )}
        </div>
      </div>

      {/* Image miniature */}
      {event.image_url && (
        <div className="w-14 h-14 shrink-0 overflow-hidden opacity-50 group-hover:opacity-80 transition-opacity">
          <img src={event.image_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}
    </motion.div>
  );
}