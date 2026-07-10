import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

export default function HeroLumineux({ config }) {
  const videoUrl = config?.hero_video_url;
  const title = config?.hero_title || 'Église des Jeunes Prodiges — Nantes';
  const subtitle = config?.hero_subtitle || 'Une maison pour rencontrer Dieu, grandir dans la foi et marcher avec une génération qui sert avec excellence.';

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#FBFAF7]">
      {/* Background: video or gradient */}
      {videoUrl ? (
        <video
          src={videoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
      ) : (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FBFAF7] via-white to-[#F5F0E8]" />
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage: `
                radial-gradient(ellipse 70% 50% at 30% 20%, rgba(216,183,106,0.12), transparent 60%),
                radial-gradient(ellipse 60% 40% at 80% 70%, rgba(234,240,248,0.6), transparent 60%)
              `,
            }}
          />
        </div>
      )}
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-[#FBFAF7]/80 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto pt-20">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-block text-[11px] uppercase tracking-[0.35em] text-[#D8B76A] font-semibold mb-6"
        >
          Nantes, France
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="font-display text-4xl md:text-6xl lg:text-7xl text-[#101827] leading-[1.1] font-medium mb-6"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.7 }}
          className="text-[#4B5563] text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            to="/venir"
            className="group flex items-center justify-center gap-2 bg-[#101827] text-white text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-[#1a2740] transition-all hover:scale-[1.02] shadow-[0_8px_30px_rgba(216,183,106,0.2)]"
          >
            Je viens dimanche
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#immersion"
            className="flex items-center justify-center gap-2 bg-white/70 backdrop-blur-md border border-[#D8B76A]/30 text-[#101827] text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-white hover:border-[#D8B76A]/50 transition-all"
          >
            <Play className="w-3.5 h-3.5 text-[#D8B76A]" />
            Découvrir l'ambiance
          </a>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-[#D8B76A]/40 flex items-start justify-center p-1.5"
        >
          <div className="w-1 h-2 rounded-full bg-[#D8B76A]/60" />
        </motion.div>
      </motion.div>
    </section>
  );
}