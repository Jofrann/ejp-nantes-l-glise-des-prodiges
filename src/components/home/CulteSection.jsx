import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

export default function CulteSection({ config }) {
  const serviceDay = config?.service_day || 'Dimanche';
  const serviceTime = config?.service_time || '15:00';
  const address = config?.address_label || 'Nantes, Loire-Atlantique';
  const mapsLink = config?.maps_link || 'https://maps.google.com/?q=Nantes,France';

  const calendarLink = (() => {
    // Génère un lien Google Calendar pour le prochain dimanche
    const now = new Date();
    const day = now.getDay();
    const daysUntil = day === 0 ? 7 : 7 - day;
    const next = new Date();
    next.setDate(now.getDate() + daysUntil);
    const [h, m] = serviceTime.split(':').map(Number);
    next.setHours(h, m, 0, 0);
    const end = new Date(next.getTime() + 2 * 60 * 60 * 1000);
    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Culte+EJP+Nantes&dates=${fmt(next)}/${fmt(end)}&location=${encodeURIComponent(address)}`;
  })();

  return (
    <section id="culte" className="py-28 px-6 bg-gradient-to-b from-gray-950 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(ellipse at 50% 100%, #7c3aed, transparent 60%)' }} />

      <div className="max-w-screen-md mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-xs uppercase tracking-[0.3em] text-amber-400/80 font-medium">Chaque semaine</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mt-3 mb-2">Prochain culte EJP</h2>
          <p className="text-gray-500 mb-12 text-sm">{serviceDay} à {serviceTime} — {address}</p>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-10 mb-8">
            <CountdownTimer serviceTime={serviceTime} />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border border-white/20 text-white/80 hover:text-white hover:border-amber-400/50 px-6 py-3 rounded-full text-sm transition-all"
            >
              <MapPin className="w-4 h-4" />
              Voir l'adresse
            </a>
            <a
              href={calendarLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-amber-400 text-black font-semibold px-6 py-3 rounded-full text-sm hover:bg-amber-300 transition-all"
            >
              <Calendar className="w-4 h-4" />
              Ajouter à mon calendrier
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}