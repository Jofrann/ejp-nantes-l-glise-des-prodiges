import React from 'react';
import { motion } from 'framer-motion';
import CountdownTimer from './CountdownTimer';

export default function CulteSection({ config }) {
  const serviceDay = config?.service_day || 'Dimanche';
  const serviceTime = config?.service_time || '15:00';
  const address = config?.address_label || 'Nantes, Loire-Atlantique';
  const mapsLink = config?.maps_link || 'https://maps.google.com/?q=Nantes,France';

  const calendarLink = (() => {
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
    <section id="culte" className="py-36 px-6 bg-zinc-950/70 backdrop-blur-md border-y border-white/5">
      <div className="max-w-screen-md mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#C8A96A]/70 font-light block mb-6">Chaque semaine</span>
          <h2 className="font-display text-4xl md:text-6xl text-[#F7F4EF] font-light mb-4 leading-tight">
            Prochain culte
          </h2>
          <p className="text-[#B8B8B8]/50 text-sm tracking-wide mb-16 font-light">
            {serviceDay} à {serviceTime} — {address}
          </p>

          <CountdownTimer serviceTime={serviceTime} />

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-14">
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 border border-[#F7F4EF]/15 text-[#F7F4EF]/70 text-xs tracking-[0.2em] uppercase font-light hover:bg-white/5 transition-colors duration-300"
            >
              Voir l'adresse
            </a>
            <a
              href={calendarLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-[#C8A96A] text-[#0B0B0C] text-xs tracking-[0.2em] uppercase font-medium hover:bg-[#D4B87A] transition-colors duration-300"
            >
              Ajouter à mon calendrier
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}