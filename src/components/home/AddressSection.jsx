import React from 'react';
import { motion } from 'framer-motion';

export default function AddressSection({ config }) {
  const address = config?.address_label || 'Nantes, Loire-Atlantique, France';
  const mapsLink = config?.maps_link || 'https://maps.google.com/?q=Nantes,France';
  const serviceDay = config?.service_day || 'Dimanche';
  const serviceTime = config?.service_time || '15:00';

  return (
    <section id="adresse" className="py-36 px-6 bg-[#F7F4EF]">
      <div className="max-w-screen-lg mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
          >
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#C8A96A] font-medium block mb-6">Viens nous voir</span>
            <h2 className="font-display text-4xl md:text-5xl text-[#0B0B0C] font-light mb-10 leading-tight">Nous rejoindre</h2>

            <div className="space-y-6 mb-10">
              <div className="border-b border-[#E5E0D8] pb-6">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#6B6B6B]/60 mb-2">Culte</p>
                <p className="text-[#0B0B0C] font-medium">{serviceDay} à {serviceTime}</p>
              </div>
              <div className="border-b border-[#E5E0D8] pb-6">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#6B6B6B]/60 mb-2">Adresse</p>
                <p className="text-[#0B0B0C] font-medium">{address}</p>
              </div>
            </div>

            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-xs tracking-[0.2em] uppercase text-[#0B0B0C] border border-[#0B0B0C] px-8 py-3.5 hover:bg-[#0B0B0C] hover:text-[#F7F4EF] transition-colors duration-300"
            >
              Ouvrir dans Google Maps
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15 }}
          >
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-72 bg-[#E5E0D8] overflow-hidden group"
            >
              <div className="w-full h-full flex flex-col items-center justify-center text-[#6B6B6B] group-hover:text-[#0B0B0C] transition-colors">
                <svg className="w-8 h-8 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-xs tracking-[0.2em] uppercase opacity-50">{address}</p>
              </div>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}