import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown, LogIn } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

export default function HeroSection({ config }) {
  const title = config?.hero_title || 'Église des Jeunes Prodiges — Nantes';
  const subtitle = config?.hero_subtitle || 'Une génération de jeunes appelés à connaître Dieu, grandir ensemble et servir avec puissance.';
  const videoUrl = config?.hero_video_url;
  const serviceTime = config?.service_time || '15:00';

  return (
    <section className="relative h-screen flex flex-col overflow-hidden">
      {/* Fond vidéo ou dégradé */}
      {videoUrl ? (
        <video
          src={videoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay muted loop playsInline
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(ellipse at 30% 50%, #f59e0b 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, #7c3aed 0%, transparent 60%)'
          }} />
        </div>
      )}
      <div className="absolute inset-0 bg-black/60" />

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
            <span className="text-amber-400 font-bold text-sm">EJP</span>
          </div>
          <span className="text-white font-semibold text-sm hidden md:block">EJP Nantes</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
          <a href="#vision" className="hover:text-white transition-colors">Vision</a>
          <a href="#culte" className="hover:text-white transition-colors">Culte</a>
          <a href="#leaders" className="hover:text-white transition-colors">Leaders</a>
          <a href="#ministeres" className="hover:text-white transition-colors">Ministères</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </div>
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-xs text-white/60 hover:text-amber-400 border border-white/20 hover:border-amber-400/50 px-4 py-2 rounded-full transition-all duration-300"
        >
          <LogIn className="w-3.5 h-3.5" />
          Espace serviteur
        </Link>
      </nav>

      {/* Contenu hero */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <span className="text-xs uppercase tracking-[0.3em] text-amber-400/80 font-medium mb-6 block">
            Nantes, France
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight leading-none">
            Église des<br />
            <span className="text-amber-400">Jeunes Prodiges</span>
          </h1>
          <p className="text-base md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#culte" className="bg-amber-400 text-black font-semibold px-8 py-3.5 rounded-full hover:bg-amber-300 transition-all duration-300 text-sm">
              Nous rejoindre dimanche
            </a>
            <a href="#vision" className="border border-white/30 text-white font-medium px-8 py-3.5 rounded-full hover:bg-white/10 transition-all duration-300 text-sm">
              Découvrir l'EJP
            </a>
          </div>
        </motion.div>

        {/* Décompte */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-14 flex flex-col items-center gap-2"
        >
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Prochain culte dimanche à {serviceTime}</p>
          <CountdownTimer serviceTime={serviceTime} />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="relative z-10 pb-8 flex flex-col items-center gap-2 text-white/30"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-[9px] uppercase tracking-widest">Scrollez pour explorer</span>
        <ChevronDown className="w-4 h-4" />
      </motion.div>
    </section>
  );
}