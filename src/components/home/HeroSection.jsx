import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const NAV_LINKS = [
  { label: 'Vision', href: '#vision' },
  { label: 'Agenda', href: '#agenda' },
  { label: 'Ministères', href: '#ministeres' },
  { label: 'Contact', href: '#contact' },
];

const CHAPTERS = [
  { progress: 0,    text: null }, // texte hero classique au début
  { progress: 0.18, text: "Une jeunesse se rassemble…" },
  { progress: 0.38, text: "Pour chercher Dieu ensemble…" },
  { progress: 0.58, text: "Grandir dans la foi et l'unité…" },
  { progress: 0.78, text: "Découvrir sa place et servir…" },
  { progress: 0.94, text: "Chaque dimanche à 15h." },
];

export default function HeroSection({ config, visible }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const sectionRef = useRef(null);
  const videoRef = useRef(null);

  const title = config?.hero_title || 'Église des Jeunes Prodiges';
  const subtitle = config?.hero_subtitle || 'Une génération appelée à connaître Dieu, grandir ensemble et servir avec excellence.';
  const videoUrl = config?.hero_video_url;

  // GSAP scroll-controlled video
  useEffect(() => {
    if (!videoUrl) return;
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    video.pause();
    video.muted = true;
    video.playsInline = true;

    let st;
    const init = () => {
      st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=400%',
        scrub: 0.5,
        pin: true,
        onUpdate: (self) => {
          const p = self.progress;
          if (video.duration) {
            video.currentTime = p * video.duration;
          }
          setScrollProgress(p);
          let chap = 0;
          for (let i = 0; i < CHAPTERS.length; i++) {
            if (p >= CHAPTERS[i].progress) chap = i;
          }
          setChapterIndex(chap);
        },
      });
    };

    if (video.readyState >= 1) {
      init();
    } else {
      video.addEventListener('loadedmetadata', init, { once: true });
    }

    return () => {
      st?.kill();
    };
  }, [videoUrl]);

  return (
    <section ref={sectionRef} className="relative h-screen flex flex-col overflow-hidden bg-[#0B0B0C]">

      {/* Fond vidéo ou gradient */}
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          playsInline
          preload="auto"
        />
      ) : (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0C] via-[#111318] to-[#0B0B0C]" />
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, #1B2A41 0%, transparent 70%)'
          }} />
        </div>
      )}

      {/* Overlay permanent */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80 pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-[#0B0B0C]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between px-6 md:px-10 py-4">
          <a href="#" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-[#C8A96A]/40 flex items-center justify-center">
              <span className="font-display text-[#C8A96A] text-xs tracking-widest">EJP</span>
            </div>
            <span className="text-[#F7F4EF] text-sm font-light tracking-wide hidden md:block">Nantes</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} className="text-[#B8B8B8] hover:text-[#F7F4EF] text-xs tracking-[0.15em] uppercase transition-colors duration-200">
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="hidden md:flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase border border-[#C8A96A]/30 text-[#C8A96A]/70 px-4 py-2 hover:border-[#C8A96A] hover:text-[#C8A96A] hover:bg-[#C8A96A]/5 transition-all duration-300"
            >
              Member Access
            </Link>
            <button className="md:hidden text-[#B8B8B8]" onClick={() => setMenuOpen(!menuOpen)}>
              <div className="w-5 flex flex-col gap-1">
                <span className={`h-px bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`h-px bg-current transition-all ${menuOpen ? 'opacity-0' : ''}`} />
                <span className={`h-px bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-[#0B0B0C]/95 backdrop-blur-xl border-t border-white/5 px-6 py-6 flex flex-col gap-5">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="text-[#B8B8B8] text-sm tracking-widest uppercase">
                {l.label}
              </a>
            ))}
            <Link to="/login" className="text-[#C8A96A]/70 text-xs tracking-widest uppercase mt-2 border border-[#C8A96A]/30 px-4 py-2">
              Member Access
            </Link>
          </div>
        )}
      </nav>

      {/* Contenu hero (visible au début du scroll) */}
      <div
        className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-20 transition-all duration-700"
        style={{ opacity: scrollProgress < 0.12 ? 1 - (scrollProgress / 0.12) : 0 }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 10 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-[10px] uppercase tracking-[0.4em] text-[#C8A96A]/70 font-light block mb-6"
          >
            Nantes, France
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 24 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl text-[#F7F4EF] mb-6 leading-[1.05] font-light"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 16 }}
            transition={{ duration: 0.9, delay: 0.9 }}
            className="text-[#B8B8B8] text-sm md:text-base max-w-xl mx-auto mb-12 leading-relaxed font-light"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 12 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a href="#culte" className="px-8 py-3.5 bg-[#C8A96A] text-[#0B0B0C] text-xs tracking-[0.2em] uppercase font-medium hover:bg-[#D4B87A] transition-colors duration-300">
              Nous rejoindre dimanche
            </a>
            <a href="#vision" className="px-8 py-3.5 border border-[#F7F4EF]/20 text-[#F7F4EF]/80 text-xs tracking-[0.2em] uppercase font-light hover:bg-white/5 transition-colors duration-300">
              Découvrir l'EJP
            </a>
          </motion.div>

          {/* CTA Serviteur */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 16 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="mt-10 flex flex-col items-center gap-3"
          >
            <div className="w-px h-8 bg-[#C8A96A]/30" />
            <p className="text-[#F7F4EF]/60 text-xs tracking-[0.25em] uppercase font-light">
              Tu veux devenir serviteur ?
            </p>
            <Link
              to="/register"
              className="relative group px-10 py-3.5 border border-[#C8A96A]/50 text-[#C8A96A] text-xs tracking-[0.25em] uppercase font-medium overflow-hidden transition-all duration-300 hover:border-[#C8A96A] hover:text-[#0B0B0C]"
            >
              <span className="absolute inset-0 bg-[#C8A96A] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
              <span className="relative">Inscris-toi</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Textes chapitres scroll (apparaissent après le titre) */}
      {videoUrl && chapterIndex > 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          {CHAPTERS.slice(1).map((ch, i) => (
            <p
              key={i}
              className="font-display text-white absolute text-center px-8 w-full"
              style={{
                opacity: chapterIndex === i + 1 ? 1 : 0,
                transform: `translateY(${chapterIndex === i + 1 ? 0 : 20}px)`,
                transition: 'opacity 0.7s ease, transform 0.7s ease',
                fontSize: 'clamp(2rem, 5vw, 4.5rem)',
                fontWeight: i === CHAPTERS.length - 2 ? 500 : 300,
                color: i === CHAPTERS.length - 2 ? '#C8A96A' : '#F7F4EF',
                lineHeight: 1.2,
                letterSpacing: '0.02em',
              }}
            >
              {ch.text}
            </p>
          ))}
        </div>
      )}

      {/* Barre progression + scroll hint */}
      {videoUrl && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
          {scrollProgress < 0.03 && (
            <div className="flex flex-col items-center gap-2 mb-2 animate-bounce">
              <p className="text-[9px] uppercase tracking-[0.4em] text-white/30">Défilez</p>
              <ChevronDown className="w-4 h-4 text-white/30" />
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="w-24 h-px bg-white/15">
              <div className="h-full bg-[#C8A96A] transition-all duration-75" style={{ width: `${scrollProgress * 100}%` }} />
            </div>
            <span className="text-[9px] text-white/25 uppercase tracking-[0.2em]">
              {Math.round(scrollProgress * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Scroll hint sans vidéo */}
      {!videoUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ delay: 1.8, duration: 1 }}
          className="relative z-10 pb-10 flex flex-col items-center gap-3 text-[#B8B8B8]/40"
        >
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}