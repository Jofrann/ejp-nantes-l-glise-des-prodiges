import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';

export default function GallerySection({ media = [] }) {
  const active = media.filter(m => m.is_active).slice(0, 9);
  const [lightbox, setLightbox] = useState(null);
  if (active.length === 0) return null;

  return (
    <section className="py-28 px-6 bg-gray-950">
      <div className="max-w-screen-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-amber-400/80 font-medium">La vie de l'EJP</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mt-3">Galerie</h2>
        </motion.div>

        <div className="columns-2 md:columns-3 gap-3 space-y-3">
          {active.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              onClick={() => setLightbox(item)}
              className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-xl"
            >
              <img
                src={item.thumbnail_url || item.file_url}
                alt={item.alt_text || item.title || ''}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <Play className="w-5 h-5 text-white ml-1" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          >
            <button onClick={() => setLightbox(null)} className="absolute top-5 right-5 text-white/60 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            {lightbox.type === 'video' ? (
              <video src={lightbox.file_url} controls autoPlay className="max-h-[85vh] max-w-[85vw] rounded-xl" onClick={e => e.stopPropagation()} />
            ) : (
              <img src={lightbox.file_url} alt={lightbox.alt_text || ''} className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain" onClick={e => e.stopPropagation()} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}