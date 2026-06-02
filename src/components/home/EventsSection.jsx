import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function EventsSection({ events = [] }) {
  const activeEvents = events.filter(e => e.is_active).slice(0, 6);
  if (activeEvents.length === 0) return null;

  return (
    <section id="evenements" className="py-28 px-6 bg-gray-950">
      <div className="max-w-screen-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-amber-400/80 font-medium">Agenda</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mt-3">Nos événements</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeEvents.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`group relative bg-white/5 border rounded-2xl overflow-hidden hover:border-amber-400/30 transition-all duration-300 ${event.is_featured ? 'border-amber-400/40' : 'border-white/10'}`}
            >
              {event.image_url && (
                <div className="h-44 overflow-hidden">
                  <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              {!event.image_url && (
                <div className="h-32 bg-gradient-to-br from-amber-500/10 to-purple-500/10 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-amber-400/30" />
                </div>
              )}
              {event.is_featured && (
                <div className="absolute top-3 right-3 bg-amber-400 text-black text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  À la une
                </div>
              )}
              <div className="p-5">
                <h3 className="font-bold text-white text-base mb-2">{event.title}</h3>
                {event.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{event.description}</p>
                )}
                <div className="flex flex-col gap-1.5 text-xs text-gray-500">
                  {event.event_date && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400/60" />
                      {format(new Date(event.event_date), 'EEEE d MMMM yyyy', { locale: fr })}
                    </span>
                  )}
                  {event.event_time && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400/60" />
                      {event.event_time}
                    </span>
                  )}
                  {event.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400/60" />
                      {event.location}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}