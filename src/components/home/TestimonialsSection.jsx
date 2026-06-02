import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

export default function TestimonialsSection({ testimonials = [] }) {
  const published = testimonials.filter(t => t.is_published);
  const featured = published.filter(t => t.is_featured);
  // Prioriser les "à la une", sinon afficher tous les publiés
  const items = featured.length > 0 ? featured : published;
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (items.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % items.length);
    }, 6000);
    return () => clearInterval(timerRef.current);
  }, [items.length]);

  if (items.length === 0) return null;

  const t = items[current];
  const displayName = t.is_anonymous ? 'Anonyme' : t.author_name;

  const goTo = (i) => {
    setCurrent(i);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % items.length);
    }, 6000);
  };

  return (
    <section id="temoignages" className="py-36 px-6 bg-[#111318] relative overflow-hidden">
      {/* Décoration de fond */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#C8A96A]/3 blur-[120px]" />
      </div>

      <div className="max-w-screen-md mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#C8A96A]/70 font-light block mb-4">Ils témoignent</span>
          <h2 className="font-display text-4xl md:text-5xl text-[#F7F4EF] font-light">
            Des vies touchées
          </h2>
        </motion.div>

        {/* Card témoignage */}
        <div className="relative min-h-[300px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-full text-center"
            >
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                {t.photo_url ? (
                  <img src={t.photo_url} alt={displayName} className="w-16 h-16 rounded-full object-cover border-2 border-[#C8A96A]/30 shadow-lg" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#C8A96A]/10 border border-[#C8A96A]/20 flex items-center justify-center">
                    <span className="font-display text-[#C8A96A] text-xl">{displayName?.[0] || '?'}</span>
                  </div>
                )}
              </div>

              {/* Icône guillemet */}
              <Quote className="w-6 h-6 text-[#C8A96A]/30 mx-auto mb-4" />

              {/* Texte */}
              <p className="font-display text-2xl md:text-3xl text-[#F7F4EF] font-light italic leading-relaxed mb-8 max-w-2xl mx-auto">
                {t.content}
              </p>

              {/* Auteur */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <p className="text-[#F7F4EF]/80 text-sm font-medium">{displayName}</p>
                  {t.is_featured && (
                    <Star className="w-3 h-3 text-[#C8A96A] fill-current" />
                  )}
                </div>
                {t.author_role && (
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#C8A96A]/50">{t.author_role}</p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation dots */}
        {items.length > 1 && (
          <div className="flex justify-center items-center gap-3 mt-12">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Témoignage ${i + 1}`}
                className={`transition-all duration-400 rounded-full ${
                  i === current
                    ? 'w-8 h-0.5 bg-[#C8A96A]'
                    : 'w-2 h-2 bg-white/15 hover:bg-white/30'
                }`}
              />
            ))}
          </div>
        )}

        {/* Compteur discret */}
        {items.length > 1 && (
          <p className="text-center text-xs text-white/20 mt-4">
            {current + 1} / {items.length}
          </p>
        )}
      </div>
    </section>
  );
}