import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Navigation } from 'lucide-react';

export default function AddressSection({ config }) {
  const address = config?.address_label || 'Nantes, Loire-Atlantique, France';
  const mapsLink = config?.maps_link || 'https://maps.google.com/?q=Nantes,France';
  const serviceDay = config?.service_day || 'Dimanche';
  const serviceTime = config?.service_time || '15:00';

  return (
    <section id="adresse" className="py-28 px-6 bg-gray-950">
      <div className="max-w-screen-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-amber-400/80 font-medium">Viens nous voir</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mt-3">Nous rejoindre</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-5"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Horaire du culte</p>
                <p className="text-white font-semibold">{serviceDay} à {serviceTime}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Adresse</p>
                <p className="text-white font-semibold">{address}</p>
              </div>
            </div>
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 mt-4 bg-amber-400 text-black font-semibold px-6 py-3 rounded-xl text-sm hover:bg-amber-300 transition-all w-full"
            >
              <Navigation className="w-4 h-4" />
              Ouvrir dans Google Maps
            </a>
          </motion.div>

          {/* Carte statique Google Maps */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="rounded-2xl overflow-hidden border border-white/10 min-h-[240px] bg-white/5 flex items-center justify-center"
          >
            <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="w-full h-full flex items-center justify-center text-gray-600 hover:text-amber-400 transition-colors p-8 text-center">
              <div>
                <MapPin className="w-10 h-10 mx-auto mb-3" />
                <p className="text-sm">Cliquer pour voir sur Google Maps</p>
                <p className="text-xs mt-1 text-gray-700">{address}</p>
              </div>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}