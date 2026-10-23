import PublicImage from '@/components/public/PublicImage';
import { PublicText } from '@/components/public/PublicCopy';
import React from 'react';
import RevealOnScroll from '../RevealOnScroll';
import { AUTHORITY_PHOTOS as PORTRAITS } from '@/lib/publicMedia';
function Portrait({ src, name, initials, className = '' }) {
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => setFailed(false), [src]);
  return <div className={`ejp-authority-portrait ${className}`}>{src && !failed ? <PublicImage src={src} alt={name} loading="lazy" onError={() => setFailed(true)} /> : <span aria-hidden="true"><PublicText value={initials} /></span>}</div>;
}
export default function Authorities({ config, leaders = [] }) {
  const local = leaders.find(person => person.is_main_shepherd);
  const apostle = { name: config?.apostle_name || 'Apôtre Yvan CASTANOU', bio: config?.apostle_bio || "Nous honorons l’Apôtre Yvan CASTANOU et la vision dont l’Église des Jeunes Prodiges est issue. Cette vision appelle notre génération à connaître Dieu, à grandir comme disciples et à servir avec excellence.", photo: config?.apostle_photo_url || PORTRAITS.apostle };
  const people = [
    { name: [config?.world_shepherd_first_name, config?.world_shepherd_last_name].filter(Boolean).join(' ') || 'Pasteur Samuel EBOUMBOU', role: config?.world_shepherd_role || 'Berger principal EJP Monde', bio: config?.world_shepherd_bio || "Nous honorons le Pasteur Samuel EBOUMBOU, qui porte la responsabilité pastorale de l’EJP Monde et accompagne cette vision. La maison de Nantes s’inscrit dans cette transmission et cet accompagnement.", photo: config?.world_shepherd_photo_url || PORTRAITS.samuel, initials: 'SE' },
    { name: config?.shepherd_name || [local?.first_name, local?.last_name].filter(Boolean).join(' ') || 'La Bergère EJP Nantes', role: 'Notre Bergère à Nantes', bio: config?.shepherd_bio || local?.bio || "La Bergère accompagne la maison de Nantes, veille sur sa croissance et conduit les jeunes dans la foi et le service. Elle porte cette vision auprès de notre communauté et de notre génération.", photo: config?.shepherd_image_url || local?.photo_url, initials: 'EJP' },
  ];
  return <section id="autorites" className="ejp-authorities ejp-authorities-editorial" aria-label="Nos autorités spirituelles">
    <div className="max-w-6xl mx-auto">
      <div className="ejp-apostle-feature">
        <RevealOnScroll className="ejp-apostle-text"><p className="ejp-eyebrow"><PublicText value={"Notre père spirituel · Une vision reçue"} /></p><h2><span className="ejp-gold-wave"><PublicText value={apostle.name} /></span></h2><div className="ejp-authority-rule" /><p><PublicText value={apostle.bio} /></p><p className="ejp-authority-honor"><PublicText value={"Reconnaissance, fidélité et transmission."} /></p></RevealOnScroll>
        <RevealOnScroll delay={150}><Portrait src={apostle.photo} name={apostle.name} initials="YC" className="ejp-apostle-portrait" /></RevealOnScroll>
      </div>
      <div className="ejp-shepherds-editorial">{people.map((person, index) => <RevealOnScroll key={person.role} delay={index * 100}><article><p className="ejp-eyebrow"><PublicText value={person.role} /></p><h3><PublicText value={"Une même vision."} /><br /><em className="ejp-gold-wave"><PublicText value={"Une génération accompagnée."} /></em></h3><p className="ejp-shepherd-bio"><PublicText value={person.bio} /></p><div className="ejp-authority-signature"><Portrait src={person.photo} name={person.name} initials={person.initials} /><div><h4><PublicText value={person.name} /></h4><p><PublicText value={person.role} /></p></div></div></article></RevealOnScroll>)}</div>
    </div>
  </section>;
}
