import PublicImage from '@/components/public/PublicImage';
import { PublicText } from '@/components/public/PublicCopy';
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { PUBLIC_PHOTOS } from '../publicPhotos';

export function PhotoCredit({ photo, custom }) {
  if (custom) return null;
  return <a className="ejp-photo-credit" href={photo.source} target="_blank" rel="noreferrer"><PublicText value={"Photo d’illustration · "} /><PublicText value={photo.author} /><PublicText value={" / Unsplash"} /></a>;
}
export function EditorialPhoto({ src, photo, className = '' }) {
  return <figure className={`ejp-photo-frame ejp-editorial-photo ${className}`}>
    <PublicImage className="ejp-photo-depth" src={src || photo.url} alt={src ? 'La vie de notre communauté' : photo.alt} loading="lazy" decoding="async" />
    <PhotoCredit photo={photo} custom={Boolean(src)} />
  </figure>;
}
export default function PhotoStory({ config, media = [] }) {
  const images = media.filter(item => item.type === 'image' && item.is_active !== false);
  const community = config?.community_image_url || images[0]?.file_url;
  const city = config?.nantes_image_url || images[1]?.file_url;
  return <section id="vie-de-la-maison" className="ejp-photo-story" aria-labelledby="ejp-story-title">
    <div className="ejp-scroll-ribbon" aria-hidden="true"><div className="ejp-scroll-ribbon-track"><PublicText value={"Croire. "} /><i><PublicText value={"Grandir."} /></i><PublicText value={" Servir. "} /><i><PublicText value={"Ensemble."} /></i><PublicText value={" Croire. "} /><i><PublicText value={"Grandir."} /></i><PublicText value={" Servir."} /></div></div>
    <div className="ejp-story-intro" data-motion-reveal><p className="ejp-eyebrow"><PublicText value={"La vie de la maison"} /></p><h2 id="ejp-story-title"><PublicText value={"La foi se vit."} /><br /><em><PublicText value={"Ensemble."} /></em></h2><p><PublicText value={"Des rencontres qui deviennent des liens. Une foi qui prend sa place dans la vie de tous les jours."} /></p></div>
    <div className="ejp-story-grid">
      <div className="ejp-story-card" data-tilt>
        <EditorialPhoto src={community} photo={PUBLIC_PHOTOS.community} />
        <Link to="/a-propos" className="ejp-story-card-caption"><div><span><PublicText value={"Une famille à découvrir"} /></span><h3><PublicText value={"Une place pour toi."} /></h3></div><ArrowUpRight /></Link>
      </div>
      <div className="ejp-story-card ejp-story-card-offset" data-tilt>
        <EditorialPhoto src={city} photo={PUBLIC_PHOTOS.nantes} />
        <Link to="/venir" className="ejp-story-card-caption"><div><span><PublicText value={"Au cœur de la ville"} /></span><h3><PublicText value={"À Nantes, pour Nantes."} /></h3></div><ArrowUpRight /></Link>
      </div>
    </div>
  </section>;
}
