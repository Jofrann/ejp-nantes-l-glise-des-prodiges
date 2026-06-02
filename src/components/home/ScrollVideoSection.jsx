import React, { useRef, useEffect, useState } from 'react';
import { useScroll, useMotionValueEvent, motion } from 'framer-motion';

const SCROLL_TEXTS = [
  { at: 0.0, text: 'Bienvenue à l\'EJP Nantes' },
  { at: 0.2, text: 'Une jeunesse qui cherche Dieu' },
  { at: 0.4, text: 'Une église vivante et fraternelle' },
  { at: 0.6, text: 'Des jeunes qui servent avec leurs dons' },
  { at: 0.8, text: 'Culte chaque dimanche à 15h' },
];

export default function ScrollVideoSection({ videoUrl }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const [progress, setProgress] = React.useState(0);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    setProgress(latest);
    const video = videoRef.current;
    if (!video || !video.duration) return;
    video.currentTime = latest * video.duration;
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  }, [videoUrl]);

  // Trouver le texte actif en fonction du scroll
  const activeText = [...SCROLL_TEXTS].reverse().find(t => progress >= t.at)?.text || SCROLL_TEXTS[0].text;

  return (
    <div ref={containerRef} className="relative" style={{ height: '400vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
          preload="auto"
        />
        <div className="absolute inset-0 bg-black/50" />

        {/* Texte animé */}
        <div className="relative z-10 h-full flex items-center justify-center px-6">
          <motion.p
            key={activeText}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="text-2xl md:text-4xl lg:text-5xl font-bold text-white text-center max-w-2xl leading-tight"
          >
            {activeText}
          </motion.p>
        </div>

        {/* Barre de progression */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
          <motion.div
            className="h-full bg-amber-400"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}