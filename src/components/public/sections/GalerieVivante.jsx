import PublicImage from '@/components/public/PublicImage';
import { PublicText } from '@/components/public/PublicCopy';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import RevealOnScroll from '../RevealOnScroll';

export default function GalerieVivante({ media }) {
  const [lightbox, setLightbox] = useState(null);
  const [limit, setLimit] = useState(9);
  const visible = (media || []).filter(item => item.is_active !== false);
  const items = visible.slice(0, limit);

  if (!items || items.length === 0) return null;

  // Masonry-like layout using CSS columns
  return (
    <section id="galerie" className="py-20 md:py-28 px-5 md:px-8 bg-[#FBFAF7]">
      <div className="max-w-6xl mx-auto">
        <RevealOnScroll className="text-center mb-12">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#D8B76A] font-semibold"><PublicText value={"Galerie"} /></span>
          <h2 className="font-display text-3xl md:text-5xl text-[#101827] mt-3 mb-4 font-medium leading-tight"><PublicText value={"Une maison vivante"} /></h2>
          <p className="text-[#4B5563] text-base max-w-xl mx-auto leading-relaxed"><PublicText value={"Quelques instants de vie à l'EJP Nantes."} /></p>
        </RevealOnScroll>

        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {items.map((item, i) => (
            <RevealOnScroll key={item.id} delay={(i % 3) * 80}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setLightbox(item)}
                aria-label={`${item.type === 'video' ? 'Lire' : 'Ouvrir'} ${item.title || 'le média'}`}
                className="block w-full overflow-hidden rounded-[20px] border border-[#E8E2D5] break-inside-avoid mb-4 group relative"
              >
                {item.type === 'video' ? (
                  <>
                    {item.thumbnail_url ? <PublicImage src={item.thumbnail_url} alt={item.alt_text || item.title || ''} className="w-full object-cover" /> : <div className="w-full min-h-40 aspect-video bg-[#101827] text-white/70 flex items-center justify-center text-xs">Vidéo · lecture à la demande</div> }
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                        <span className="text-[#101827] text-xl"><PublicText value={"▶"} /></span>
                      </div>
                    </div>
                  </>
                ) : (
                  <PublicImage
                    src={item.file_url}
                    alt={item.alt_text || item.title || ''}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                {item.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-medium"><PublicText field="entity" value={item.title} /></p>
                  </div>
                )}
              </motion.button>
            </RevealOnScroll>
          ))}
        </div>
        {visible.length > limit && <button onClick={() => setLimit(current => current + 9)} className="mt-8 mx-auto block border border-[#101827] text-[#101827] px-6 py-3 rounded-full text-sm font-semibold"><PublicText value={"Voir plus de photos et vidéos ("} /><PublicText value={visible.length - limit} /><PublicText value={")"} /></button>}
      </div>

      {/* Lightbox */}
      <Dialog open={!!lightbox} onOpenChange={open => { if (!open) setLightbox(null); }}>
        <DialogContent className="max-w-5xl bg-[#101827] text-white border-0 p-6" aria-describedby={undefined}>
          <DialogTitle className="text-white"><PublicText field={lightbox?.title ? "entity" : undefined} value={lightbox?.title || 'Galerie EJP Nantes'} /></DialogTitle>
          {lightbox?.type === 'video' ? <video src={lightbox.file_url} controls autoPlay className="w-full max-h-[75vh]" /> : lightbox && <PublicImage src={lightbox.file_url} alt={lightbox.alt_text || lightbox.title || ''} className="w-full max-h-[75vh] object-contain" />}
        </DialogContent>
      </Dialog>
    </section>
  );
}
