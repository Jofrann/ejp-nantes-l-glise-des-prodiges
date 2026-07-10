import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import RevealOnScroll from '../RevealOnScroll';

export default function GalerieVivante({ media }) {
  const [lightbox, setLightbox] = useState(null);
  const items = (media || []).slice(0, 9);

  if (!items || items.length === 0) return null;

  // Masonry-like layout using CSS columns
  return (
    <section id="galerie" className="py-20 md:py-28 px-5 md:px-8 bg-[#FBFAF7]">
      <div className="max-w-6xl mx-auto">
        <RevealOnScroll className="text-center mb-12">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#D8B76A] font-semibold">Galerie</span>
          <h2 className="font-display text-3xl md:text-5xl text-[#101827] mt-3 mb-4 font-medium leading-tight">
            Une maison vivante
          </h2>
          <p className="text-[#4B5563] text-base max-w-xl mx-auto leading-relaxed">
            Quelques instants de vie à l'EJP Nantes.
          </p>
        </RevealOnScroll>

        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {items.map((item, i) => (
            <RevealOnScroll key={item.id} delay={(i % 3) * 80}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setLightbox(item)}
                className="block w-full overflow-hidden rounded-[20px] border border-[#E8E2D5] break-inside-avoid mb-4 group relative"
              >
                {item.type === 'video' ? (
                  <>
                    <img
                      src={item.thumbnail_url || item.file_url}
                      alt={item.alt_text || item.title || ''}
                      className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                        <span className="text-[#101827] text-xl">▶</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <img
                    src={item.file_url}
                    alt={item.alt_text || item.title || ''}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                {item.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-medium">{item.title}</p>
                  </div>
                )}
              </motion.button>
            </RevealOnScroll>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-md p-6" onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-6 text-white/70 hover:text-white">
            <X className="w-6 h-6" />
          </button>
          {lightbox.type === 'video' ? (
            <video src={lightbox.file_url} controls autoPlay className="max-w-full max-h-[85vh] rounded-2xl" />
          ) : (
            <img src={lightbox.file_url} alt={lightbox.alt_text || ''} className="max-w-full max-h-[85vh] rounded-2xl object-contain" />
          )}
        </div>
      )}
    </section>
  );
}