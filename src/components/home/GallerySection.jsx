import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';

export default function GallerySection({ media = [] }) {
  const active = media.filter(m => m.is_active).slice(0, 9);
  const [lightbox, setLightbox] = useState(null);
  if (active.length === 0) return null;

  return (
    <section className="py-36 px-6 bg-[#F7F4EF]">
      <div className="max-w-screen-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#C8A96A] font-medium block mb-4">La vie de l'EJP</span>
          <h2 className="font-display text-4xl md:text-6xl text-[#0B0B0C] font-light leading-tight">Galerie</h2>
        </motion.div>

        <div className="columns-2 md:columns-3 gap-2 space-y-2">
          {active.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              onClick={() => setLightbox(item)}
              className="break-inside-avoid cursor-pointer group relative overflow-hidden"
            >
              <img
                src={item.thumbnail_url || item.file_url}
                alt={item.alt_text || ''}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0B0B0C]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-10 h-10 border border-white/60 flex items-center justify-center">
                    <Play className="w-4 h-4 text-white ml-0.5" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-50 bg-[#0B0B0C]/95 flex items-center justify-center p-4"
          >
            <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            {lightbox.type === 'video' ? (
              <video src={lightbox.file_url} controls autoPlay className="max-h-[88vh] max-w-[88vw]" onClick={e => e.stopPropagation()} />
            ) : (
              <img src={lightbox.file_url} alt="" className="max-h-[88vh] max-w-[88vw] object-contain" onClick={e => e.stopPropagation()} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}