import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import HeroSection from '@/components/home/HeroSection';
import ScrollVideoSection from '@/components/home/ScrollVideoSection';
import VisionSection from '@/components/home/VisionSection';
import CulteSection from '@/components/home/CulteSection';
import EventsSection from '@/components/home/EventsSection';
import ShepherdSection from '@/components/home/ShepherdSection';
import LeadersSection from '@/components/home/LeadersSection';
import MinistriesSection from '@/components/home/MinistriesSection';
import GallerySection from '@/components/home/GallerySection';
import NantesSection from '@/components/home/NantesSection';
import AddressSection from '@/components/home/AddressSection';
import ContactSection from '@/components/home/ContactSection';
import HomeFooter from '@/components/home/HomeFooter';

export default function Home() {
  const [config, setConfig] = useState(null);
  const [leaders, setLeaders] = useState([]);
  const [events, setEvents] = useState([]);
  const [ministries, setMinistries] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.ChurchConfig.list(),
      base44.entities.Leader.list('display_order', 20),
      base44.entities.Event.filter({ is_active: true }, 'event_date', 10),
      base44.entities.Ministry.list('display_order', 20),
      base44.entities.GalleryMedia.filter({ is_active: true }, '-created_date', 12),
    ]).then(([configs, ldr, evts, min, gal]) => {
      setConfig(configs?.[0] || null);
      setLeaders(ldr || []);
      setEvents(evts || []);
      setMinistries(min || []);
      setGallery(gal || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  const shepherd = leaders.find(l => l.is_main_shepherd);

  return (
    <div className="bg-gray-950">
      {/* Bannière d'annonce */}
      {config?.announcement_active && config?.announcement_text && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-black text-xs font-medium text-center py-2 px-4">
          {config.announcement_text}
        </div>
      )}

      {/* 1. Hero immersif */}
      <div className={config?.announcement_active ? 'pt-8' : ''}>
        <HeroSection config={config} />
      </div>

      {/* 2. Vidéo scroll (si vidéo configurée) */}
      {config?.hero_video_url && <ScrollVideoSection videoUrl={config.hero_video_url} />}

      {/* 3. Vision */}
      <VisionSection title={config?.vision_title} text={config?.vision_text} />

      {/* 4. Compte à rebours culte */}
      <CulteSection config={config} />

      {/* 5. Événements */}
      <EventsSection events={events} />

      {/* 6. Bergère principale */}
      <ShepherdSection shepherd={shepherd} />

      {/* 7. Leaders */}
      <LeadersSection leaders={leaders} />

      {/* 8. Ministères */}
      <MinistriesSection ministries={ministries} />

      {/* 9. Galerie */}
      <GallerySection media={gallery} />

      {/* 10. Nantes */}
      <NantesSection />

      {/* 11. Adresse */}
      <AddressSection config={config} />

      {/* 12. Contact */}
      <ContactSection config={config} />

      {/* Footer */}
      <HomeFooter config={config} />
    </div>
  );
}