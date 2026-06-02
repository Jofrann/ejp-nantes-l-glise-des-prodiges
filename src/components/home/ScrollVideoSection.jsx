import React, { useRef, useState } from 'react';
import { useScroll, useMotionValueEvent, motion, AnimatePresence } from 'framer-motion';

const CHAPTERS = [
  { at: 0.00, text: 'Au cœur de Nantes…' },
  { at: 0.18, text: 'Une jeunesse se rassemble…' },
  { at: 0.36, text: 'Pour chercher Dieu ensemble…' },
  { at: 0.54, text: 'Grandir dans la foi et l\'unité…' },
  { at: 0.72, text: 'Découvrir sa place et servir…' },
  { at: 0.90, text: 'Chaque dimanche à 15h.' },
];

export default function ScrollVideoSection({ videoUrl }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setProgress(v);
    const video = videoRef.current;
    if (!video || !video.duration) return;
    video.currentTime = v * video.duration;
  });

  const activeChapter = [...CHAPTERS].reverse().find(c => progress >= c.at) || CHAPTERS[0];

  return (
    <div ref={containerRef} style={{ height: '400vh' }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Vidéo ou fond dégradé */}
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline muted preload="auto"
          />
        ) : (
          <div className="absolute inset-0 bg-[#111318]">
            <div className="absolute inset-0 opacity-40" style={{
              backgroundImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #1B2A41, transparent)'
            }} />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0C]/60 via-[#0B0B0C]/30 to-[#0B0B0C]/70" />

        {/* Texte animé */}
        <div className="relative z-10 h-full flex items-center justify-center px-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={activeChapter.text}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="font-display text-3xl md:text-5xl lg:text-6xl text-[#F7F4EF] text-center max-w-3xl leading-tight font-light italic"
            >
              {activeChapter.text}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Barre de progression fine */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5">
          <motion.div className="h-full bg-[#C8A96A]/60" style={{ width: `${progress * 100}%` }} />
        </div>

        {/* Numéro de chapitre */}
        <div className="absolute bottom-8 right-8 text-[10px] text-[#B8B8B8]/30 tracking-[0.3em] uppercase">
          {CHAPTERS.findIndex(c => c.text === activeChapter.text) + 1} / {CHAPTERS.length}
        </div>
      </div>
    </div>
  );
}