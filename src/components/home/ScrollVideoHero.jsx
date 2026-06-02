import React, { useRef, useEffect, useCallback } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

export default function ScrollVideoHero({ videoUrl, children }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const lastScrollY = useRef(0);
  const scrollVelocity = useRef(0);
  const rafId = useRef(null);
  const basePlaybackRate = 1;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Démarrage automatique dès que la vidéo est prête
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const startPlay = () => {
      video.play().catch(() => {});
    };

    video.addEventListener('canplay', startPlay, { once: true });
    // Tentative immédiate si déjà chargée
    if (video.readyState >= 3) startPlay();

    return () => video.removeEventListener('canplay', startPlay);
  }, [videoUrl]);

  // Ajuste la vitesse de lecture selon la vélocité du scroll
  // La vidéo joue toujours — le scroll l'accélère ou la ralentit
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const video = videoRef.current;
    if (!video) return;

    const delta = Math.abs(latest - lastScrollY.current);
    lastScrollY.current = latest;
    scrollVelocity.current = delta;

    // Vitesse = base + boost proportionnel au delta de scroll
    const boost = Math.min(delta * 80, 4); // max 5x
    video.playbackRate = basePlaybackRate + boost;

    // Revenir progressivement à la vitesse normale après arrêt du scroll
    if (rafId.current) cancelAnimationFrame(rafId.current);
    const decay = () => {
      if (!videoRef.current) return;
      const current = videoRef.current.playbackRate;
      if (current > basePlaybackRate + 0.05) {
        videoRef.current.playbackRate = Math.max(basePlaybackRate, current - 0.15);
        rafId.current = requestAnimationFrame(decay);
      } else {
        videoRef.current.playbackRate = basePlaybackRate;
      }
    };
    rafId.current = requestAnimationFrame(decay);
  });

  useEffect(() => () => { if (rafId.current) cancelAnimationFrame(rafId.current); }, []);

  return (
    <div ref={containerRef} className="relative" style={{ height: '300vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
            loop
            preload="auto"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950" />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}