import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Heart, ChevronDown } from 'lucide-react';
import ScrollVideoHero from '@/components/home/ScrollVideoHero';
import CountdownTimer from '@/components/home/CountdownTimer';
import VisionSection from '@/components/home/VisionSection';
import LeadersSection from '@/components/home/LeadersSection';
import AddressSection from '@/components/home/AddressSection';

export default function Home() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.ChurchConfig.list().then((list) => {
      if (list && list.length > 0) setConfig(list[0]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  const heroTitle = config?.hero_title || 'EJP Nantes';
  const heroSubtitle = config?.hero_subtitle || 'Une communauté vivante, rassemblée autour de la Parole';
  const serviceTime = config?.service_time || '15:00';

  return (
    <div className="bg-gray-950">
      {/* Annonce */}
      {config?.announcement_active && config?.announcement_text && (
        <div className="fixed top-14 left-0 right-0 z-40 bg-amber-500 text-black text-xs font-medium text-center py-2 px-4">
          {config.announcement_text}
        </div>
      )}

      {/* Hero Scroll-Driven Video */}
      <ScrollVideoHero videoUrl={config?.hero_video_url}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-center px-6"
        >
          {/* Logo / Icone */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
              <Heart className="w-7 h-7 text-amber-400" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
            {heroTitle}
          </h1>
          <p className="text-base md:text-lg text-white/70 max-w-xl mx-auto mb-12 leading-relaxed">
            {heroSubtitle}
          </p>

          {/* Décompte */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs uppercase tracking-widest text-white/40 mb-2">Prochain culte dimanche</p>
            <CountdownTimer serviceTime={serviceTime} />
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 flex flex-col items-center gap-2 text-white/40"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-[10px] uppercase tracking-widest">Scrollez pour explorer</span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </ScrollVideoHero>

      {/* Vision */}
      <VisionSection
        title={config?.vision_title}
        text={config?.vision_text}
      />

      {/* Leaders */}
      <LeadersSection
        pastor={config}
        leaders={config?.leaders || []}
      />

      {/* Adresse & Infos pratiques */}
      <AddressSection
        address={config?.address_label}
        mapsLink={config?.maps_link}
        serviceDay={config?.service_day}
        serviceTime={serviceTime}
      />

      {/* Footer minimal */}
      <footer className="py-8 px-6 border-t border-white/5 text-center">
        <p className="text-xs text-gray-600">
          © {new Date().getFullYear()} EJP Nantes — Tous droits réservés
        </p>
      </footer>
    </div>
  );
}