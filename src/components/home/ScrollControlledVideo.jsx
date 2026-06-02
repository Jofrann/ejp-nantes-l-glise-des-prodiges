import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CHAPTERS = [
  { progress: 0,    text: "Au cœur de Nantes…" },
  { progress: 0.20, text: "Une jeunesse se rassemble…" },
  { progress: 0.40, text: "Pour chercher Dieu ensemble…" },
  { progress: 0.60, text: "Grandir dans la foi et l'unité…" },
  { progress: 0.80, text: "Découvrir sa place et servir…" },
  { progress: 0.95, text: "Chaque dimanche à 15h." },
];

export default function ScrollControlledVideo({ videoUrl }) {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    // Pause immédiatement — on ne laisse jamais la vidéo jouer seule
    video.pause();
    video.muted = true;
    video.playsInline = true;

    let st;

    const init = () => {
      st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=400%",
        scrub: 0.5,
        pin: true,
        onUpdate: (self) => {
          const p = self.progress;
          if (video.duration) {
            video.currentTime = p * video.duration;
          }
          setScrollProgress(p);

          // Chapitre actif
          let chap = 0;
          for (let i = 0; i < CHAPTERS.length; i++) {
            if (p >= CHAPTERS[i].progress) chap = i;
          }
          setCurrentChapter(chap);
        },
      });
    };

    if (video.readyState >= 1) {
      init();
    } else {
      video.addEventListener("loadedmetadata", init, { once: true });
    }

    return () => {
      st?.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [videoUrl]);

  return (
    <div ref={sectionRef} className="relative h-screen overflow-hidden bg-black">
      {/* Vidéo — contrôlée par le scroll uniquement */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        playsInline
        preload="auto"
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70 pointer-events-none" />

      {/* Texte de chapitre */}
      <div className="absolute inset-0 flex items-center justify-center px-6 z-10 pointer-events-none">
        <div className="text-center max-w-2xl">
          {CHAPTERS.map((ch, i) => (
            <p
              key={i}
              className="font-display text-white transition-all duration-700 absolute left-1/2 -translate-x-1/2 w-full px-6"
              style={{
                opacity: currentChapter === i ? 1 : 0,
                transform: `translateX(-50%) translateY(${currentChapter === i ? 0 : 20}px)`,
                fontSize: i === CHAPTERS.length - 1 ? 'clamp(1.5rem, 4vw, 2.5rem)' : 'clamp(2rem, 5vw, 4rem)',
                fontWeight: i === CHAPTERS.length - 1 ? 600 : 300,
                color: i === CHAPTERS.length - 1 ? '#C8A96A' : 'white',
                letterSpacing: '0.02em',
                lineHeight: 1.2,
              }}
            >
              {ch.text}
            </p>
          ))}
        </div>
      </div>

      {/* Barre de progression */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
        <div className="w-32 h-px bg-white/20">
          <div
            className="h-full bg-[#C8A96A] transition-all duration-100"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
        <span className="text-[10px] text-white/40 uppercase tracking-[0.3em]">
          {Math.round(scrollProgress * 100)}%
        </span>
      </div>

      {/* Indicateur scroll */}
      {scrollProgress < 0.02 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
          <p className="text-[9px] uppercase tracking-[0.4em] text-white/40">Défilez</p>
          <div className="w-px h-8 bg-white/20" />
        </div>
      )}
    </div>
  );
}