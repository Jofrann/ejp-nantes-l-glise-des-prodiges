import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function EventsSection({ events = [] }) {
  const active = events.filter(e => e.is_active).slice(0, 6);
  if (active.length === 0) return null;

  return (
    <section id="evenements" className="py-36 px-6 bg-[#F7F4EF]">
      <div className="max-w-screen-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex items-end justify-between mb-16 flex-wrap gap-4"
        >
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#C8A96A] font-medium block mb-4">Agenda</span>
            <h2 className="font-display text-4xl md:text-6xl text-[#0B0B0C] font-light leading-tight">Nos événements</h2>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {active.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group bg-white border border-[#E5E0D8] overflow-hidden"
            >
              {event.image_url ? (
                <div className="h-48 overflow-hidden">
                  <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              ) : (
                <div className="h-32 bg-[#F0EDE8]" />
              )}
              {event.is_featured && (
                <div className="px-6 pt-4">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#C8A96A]">À la une</span>
                </div>
              )}
              <div className="p-6">
                <h3 className="font-medium text-[#0B0B0C] text-base mb-2">{event.title}</h3>
                {event.description && (
                  <p className="text-[#6B6B6B] text-sm mb-4 line-clamp-2 font-light leading-relaxed">{event.description}</p>
                )}
                <div className="text-xs text-[#6B6B6B]/70 font-light space-y-1">
                  {event.event_date && (
                    <p>{format(new Date(event.event_date), 'EEEE d MMMM yyyy', { locale: fr })}</p>
                  )}
                  {event.event_time && <p>{event.event_time}{event.location ? ` · ${event.location}` : ''}</p>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}