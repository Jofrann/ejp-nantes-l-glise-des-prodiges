import { PublicText } from '@/components/public/PublicCopy';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Pause, Play } from 'lucide-react';
import { PUBLIC_PHOTOS } from '../publicPhotos';
import { PhotoCredit } from './PhotoStory';

export default function HeroLumineux({ config }) {
  const video = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const videoUrl = config?.hero_video_url;
  const imageUrl = config?.hero_image_url || PUBLIC_PHOTOS.worship.url;
  useEffect(() => {
    setFailed(false);
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      if (preference.matches) video.current?.pause();
      else video.current?.play().catch(() => {});
    };
    sync(); preference.addEventListener('change', sync);
    return () => preference.removeEventListener('change', sync);
  }, [videoUrl]);
  return (
    <section className="ejp-hero" aria-labelledby="public-hero-title">
      <div className="ejp-hero-art" aria-hidden="true"><div className="ejp-light-orbit" /><span className="ejp-art-word"><PublicText value={"EJP"} /></span></div>
      <div className="ejp-hero-visual"><img src={imageUrl} alt="" className="ejp-hero-media" fetchPriority="high" decoding="async" />
      {videoUrl && !failed && <video ref={video} key={videoUrl} src={videoUrl} poster={imageUrl || undefined} className="ejp-hero-media" muted loop playsInline preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setFailed(true)} />}
      </div>
      <div className="ejp-hero-shade" />
      <div className="ejp-hero-content">
        <p className="ejp-eyebrow"><span /><PublicText value={" Église des Jeunes Prodiges · Nantes"} /></p>
        <h1 id="public-hero-title">{config?.hero_title ? config.hero_title.split('\n').map((line, index, lines) => <span className="ejp-title-line" key={index}><span>{index === lines.length - 1 && lines.length > 1 ? <em className="ejp-gold-wave"><PublicText field="hero_title" value={line} /></em> : <PublicText field="hero_title" value={line} />}</span></span>) : <><span className="ejp-title-line"><span><PublicText value={"Une foi vivante."} /></span></span><span className="ejp-title-line"><span><PublicText value={"Une génération"} /></span></span><span className="ejp-title-line"><span><em className="ejp-gold-wave"><PublicText value={"qui rayonne."} /></em></span></span></>}</h1>
        <div className="ejp-hero-bottom">
          <p><PublicText field="hero_subtitle" value={config?.hero_subtitle || 'Une maison pour rencontrer Dieu, grandir dans la foi et marcher avec une génération qui sert avec excellence.'} /></p>
          <Link to="/venir" className="ejp-button ejp-button-gold"><PublicText value={"Je viens dimanche "} /><ArrowUpRight size={20} /></Link>
        </div>
      </div>
      {!config?.hero_image_url && !videoUrl && <PhotoCredit photo={PUBLIC_PHOTOS.worship} />}
      <div className="ejp-hero-caption"><a href="#ce-dimanche"><PublicText value={"Découvrir la maison "} /><ArrowDown size={16} /></a><span><PublicText field="service_day" value={config?.service_day || 'Dimanche'} /><PublicText value={" · "} /><PublicText field="service_time" value={config?.service_time?.replace(':', 'h') || '14h30'} /></span>
        {videoUrl && !failed && <button onClick={() => playing ? video.current?.pause() : video.current?.play().catch(() => {})} aria-label={playing ? 'Mettre la vidéo en pause' : 'Lire la vidéo'}>{playing ? <Pause size={16} /> : <Play size={16} />}<span><PublicText value={playing ? 'Pause' : 'Lire'} /></span></button>}
      </div>
    </section>
  );
}
