import React from 'react';
import RevealOnScroll from '../RevealOnScroll';
const PORTRAITS = {
  apostle: 'https://www.ejp-portonovo.com/assets/pp-WWxmMHpa.jpeg',
  samuel: 'https://www.ejp-portonovo.com/assets/ejp_berger_samuel-B0krmCtv.png',
};
function Portrait({ src, name, initials, className = '' }) {
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => setFailed(false), [src]);
  return <div className={`ejp-authority-portrait ${className}`}>{src && !failed ? <img src={src} alt={name} loading="lazy" onError={() => setFailed(true)} /> : <span aria-hidden="true">{initials}</span>}</div>;
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
        <RevealOnScroll className="ejp-apostle-text"><p className="ejp-eyebrow">Notre père spirituel · Une vision reçue</p><h2><span className="ejp-gold-wave">{apostle.name}</span></h2><div className="ejp-authority-rule" /><p>{apostle.bio}</p><p className="ejp-authority-honor">Reconnaissance, fidélité et transmission.</p></RevealOnScroll>
        <RevealOnScroll delay={150}><Portrait src={apostle.photo} name={apostle.name} initials="YC" className="ejp-apostle-portrait" /></RevealOnScroll>
      </div>
      <div className="ejp-shepherds-editorial">{people.map((person, index) => <RevealOnScroll key={person.role} delay={index * 100}><article><p className="ejp-eyebrow">{person.role}</p><h3>Une même vision.<br /><em className="ejp-gold-wave">Une génération accompagnée.</em></h3><p className="ejp-shepherd-bio">{person.bio}</p><div className="ejp-authority-signature"><Portrait src={person.photo} name={person.name} initials={person.initials} /><div><h4>{person.name}</h4><p>{person.role}</p></div></div></article></RevealOnScroll>)}</div>
    </div>
  </section>;
}
