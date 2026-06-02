import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TestimonialsSection({ testimonials = [] }) {
  const published = testimonials.filter(t => t.is_published);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (published.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % published.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [published.length]);

  if (published.length === 0) return null;

  const t = published[current];
  const displayName = t.is_anonymous ? 'Anonyme' : t.author_name;

  return (
    <section id="temoignages" className="py-36 px-6 bg-[#111318]">
      <div className="max-w-screen-md mx-auto">
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

        <div className="relative min-h-[280px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.7 }}
              className="w-full text-center"
            >
              {t.photo_url && (
                <img src={t.photo_url} alt={displayName} className="w-14 h-14 rounded-full object-cover mx-auto mb-6 border border-white/10" />
              )}
              {!t.photo_url && (
                <div className="w-12 h-12 rounded-full bg-[#C8A96A]/10 border border-[#C8A96A]/20 flex items-center justify-center mx-auto mb-6">
                  <span className="font-display text-[#C8A96A] text-lg">{displayName?.[0] || '?'}</span>
                </div>
              )}
              <p className="font-display text-2xl md:text-3xl text-[#F7F4EF] font-light italic leading-relaxed mb-8 max-w-2xl mx-auto">
                "{t.content}"
              </p>
              <div>
                <p className="text-[#F7F4EF]/70 text-sm font-light">{displayName}</p>
                {t.author_role && (
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#C8A96A]/50 mt-1">{t.author_role}</p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        {published.length > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {published.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); clearInterval(timerRef.current); }}
                className={`h-px transition-all duration-300 ${i === current ? 'w-8 bg-[#C8A96A]' : 'w-4 bg-white/20'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}