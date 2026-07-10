import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, DoorOpen, Music, BookOpen, Heart, Sparkles } from 'lucide-react';

const CHAPTERS = [
  { icon: MapPin, title: 'Nantes', text: "Une ville vibrante, une jeunesse qui cherche.", image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80' },
  { icon: DoorOpen, title: 'Arrivée', text: "Tu franchis la porte. Quelqu'un t'accueille avec le sourire.", image: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800&q=80' },
  { icon: Sparkles, title: 'Accueil', text: "Une maison chaleureuse où tu as ta place dès le premier instant.", image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c75a?w=800&q=80' },
  { icon: Music, title: 'Louange', text: "Les voix s'élèvent. Une atmosphère de présence et de liberté.", image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&q=80' },
  { icon: BookOpen, title: 'Parole', text: "Dieu parle. Sa vérité édifie, transforme et guide.", image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&q=80' },
  { icon: Heart, title: 'Fraternité', text: "On partage, on prie, on grandit ensemble.", image: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=800&q=80' },
  { icon: Sparkles, title: 'Invitation', text: "Une porte s'ouvre. Et si c'était pour toi ?", image: 'https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=800&q=80' },
];

export default function ImmersionScroll() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      if (rect.top < windowHeight && rect.bottom > 0) {
        const totalScroll = el.offsetHeight - windowHeight;
        const scrolled = Math.max(0, -rect.top);
        const progress = Math.min(1, scrolled / totalScroll);
        const index = Math.min(CHAPTERS.length - 1, Math.floor(progress * CHAPTERS.length));
        setActiveIndex(index);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const activeChapter = CHAPTERS[activeIndex];

  return (
    <section id="immersion" ref={sectionRef} className="relative bg-[#101827] overflow-hidden" style={{ minHeight: `${CHAPTERS.length * 60}vh` }}>
      {/* Sticky container */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.4, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img src={activeChapter.image} alt={activeChapter.title} className="w-full h-full object-cover" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-[#101827]/80 via-[#101827]/60 to-[#101827]/90" />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-14 h-14 rounded-2xl bg-[#D8B76A]/20 backdrop-blur-md border border-[#D8B76A]/30 flex items-center justify-center mx-auto mb-6">
                <activeChapter.icon className="w-6 h-6 text-[#D8B76A]" />
              </div>
              <h2 className="font-display text-4xl md:text-6xl text-white font-medium mb-4">{activeChapter.title}</h2>
              <p className="text-white/70 text-lg leading-relaxed max-w-lg mx-auto">{activeChapter.text}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
          {CHAPTERS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'bg-[#D8B76A] scale-125' : 'bg-white/20'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}