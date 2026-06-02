import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import IntroOverlay from '@/components/home/IntroOverlay';
import HeroSection from '@/components/home/HeroSection';
import ScrollVideoSection from '@/components/home/ScrollVideoSection';
import VisionSection from '@/components/home/VisionSection';
import CulteSection from '@/components/home/CulteSection';
import EventsSection from '@/components/home/EventsSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
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
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [introDone, setIntroD] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.ChurchConfig.list(),
      base44.entities.Leader.list('display_order', 20),
      base44.entities.Event.filter({ is_active: true }, 'event_date', 10),
      base44.entities.Ministry.list('display_order', 20),
      base44.entities.GalleryMedia.filter({ is_active: true }, '-created_date', 12),
      base44.entities.Testimonial.filter({ is_published: true }, 'display_order', 20),
    ]).then(([c, l, e, m, g, t]) => {
      setConfig(c?.[0] || null);
      setLeaders(l || []);
      setEvents(e || []);
      setMinistries(m || []);
      setGallery(g || []);
      setTestimonials(t || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <div className="w-6 h-6 border border-[#C8A96A]/30 border-t-[#C8A96A] rounded-full animate-spin" />
      </div>
    );
  }

  const shepherd = leaders.find(l => l.is_main_shepherd);

  return (
    <div className="bg-[#0B0B0C] overflow-x-hidden">
      {/* Intro cinématique */}
      {!introDone && <IntroOverlay onDone={() => setIntroD(true)} />}

      {/* Bannière annonce */}
      {config?.announcement_active && config?.announcement_text && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-[#C8A96A] text-[#0B0B0C] text-[10px] font-medium text-center py-2 px-4 tracking-[0.2em] uppercase">
          {config.announcement_text}
        </div>
      )}

      {/* 1. Hero */}
      <HeroSection config={config} visible={introDone} />

      {/* 2. Vidéo scroll */}
      {config?.hero_video_url && <ScrollVideoSection videoUrl={config.hero_video_url} />}

      {/* 3. Vision */}
      <VisionSection title={config?.vision_title} text={config?.vision_text} />

      {/* 4. Prochain culte */}
      <CulteSection config={config} />

      {/* 5. Événements */}
      <EventsSection events={events} />

      {/* 6. Témoignages */}
      <TestimonialsSection testimonials={testimonials} />

      {/* 7. Bergère */}
      <ShepherdSection shepherd={shepherd} />

      {/* 8. Leaders */}
      <LeadersSection leaders={leaders} />

      {/* 9. Ministères */}
      <MinistriesSection ministries={ministries} />

      {/* 10. Galerie */}
      <GallerySection media={gallery} />

      {/* 11. Nantes */}
      <NantesSection />

      {/* 12. Adresse */}
      <AddressSection config={config} />

      {/* 13. Contact */}
      <ContactSection config={config} />

      {/* Footer */}
      <HomeFooter config={config} />
    </div>
  );
}