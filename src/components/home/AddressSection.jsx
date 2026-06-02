import React from 'react';
import { MapPin, ExternalLink, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AddressSection({ address, mapsLink, serviceDay, serviceTime }) {
  return (
    <section className="py-20 px-6 bg-gray-950 border-t border-white/5">
      <div className="max-w-screen-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
        >
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-medium">Nous trouver</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mt-2 mb-6">Rejoignez-nous</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{serviceDay || 'Dimanche'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Culte à {serviceTime || '15:00'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{address || 'Nantes, France'}</p>
                  {mapsLink && (
                    <a
                      href={mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-amber-400/70 hover:text-amber-400 mt-1 flex items-center gap-1 transition-colors"
                    >
                      Ouvrir dans Maps
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Carte/Visuel */}
          <div className="rounded-2xl overflow-hidden border border-white/5 bg-gray-900 h-48 flex items-center justify-center">
            {mapsLink ? (
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors"
              >
                <MapPin className="w-8 h-8" />
                <span className="text-xs font-medium">Voir sur Google Maps</span>
              </a>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-600">
                <MapPin className="w-8 h-8" />
                <span className="text-xs">Adresse à configurer</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}