import React, { useRef, useEffect } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

export default function ScrollVideoHero({ videoUrl, children }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    video.currentTime = latest * video.duration;
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Préchargement et gel de la vidéo
    video.pause();
    video.currentTime = 0;
  }, [videoUrl]);

  return (
    <div ref={containerRef} className="relative" style={{ height: '300vh' }}>
      {/* Sticky zone qui colle à l'écran pendant le scroll */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
            preload="auto"
          />
        ) : (
          // Fallback : dégradé animé si pas de vidéo
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950" />
        )}
        {/* Overlay sombre */}
        <div className="absolute inset-0 bg-black/50" />
        {/* Contenu centré */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}