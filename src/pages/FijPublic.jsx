import { PublicText } from '@/components/public/PublicCopy';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/sections/PublicFooter';
import RevealOnScroll from '@/components/public/RevealOnScroll';
import usePublicMotion from '@/components/public/motion/usePublicMotion';
import { EditorialPhoto } from '@/components/public/sections/PhotoStory';
import { PUBLIC_PHOTOS } from '@/components/public/publicPhotos';
export default function FijPublic() {
  const [config, setConfig] = useState(null);
  const root = usePublicMotion(config);
  useEffect(() => { base44.entities.ChurchConfig.list().then(records => setConfig(records[0] || null)).catch(() => {}); }, []);
  return <div ref={root} className="ejp-public bg-[#FBFAF7] overflow-x-hidden"><PublicHeader />
    <section className="ejp-page-intro"><RevealOnScroll><p className="ejp-eyebrow"><PublicText value={"EJP Nantes · FIJ"} /></p><h1 className="font-display text-5xl md:text-7xl"><PublicText field="fij_title" value={config?.fij_title || 'Familles d’Impact Jeunes'} /></h1><p className="ejp-section-lead"><PublicText value={"La foi se vit aussi en famille, au plus près de notre quotidien."} /></p></RevealOnScroll></section>
    <EditorialPhoto className="ejp-page-photo" src={config?.community_image_url} photo={PUBLIC_PHOTOS.community} />
    <section className="ejp-fij-detail max-w-5xl mx-auto"><RevealOnScroll><p className="ejp-eyebrow"><PublicText value={"Une famille dans la maison"} /></p><h2><PublicText value={"Se retrouver. Grandir."} /><br /><em><PublicText value={"Rayonner ensemble."} /></em></h2><p><PublicText field="fij_text" value={config?.fij_text || "Les Familles d’Impact Jeunes sont des petits groupes de jeunes rattachés à l’EJP. On y partage la Parole de Dieu, la prière et la fraternité. Chacun peut être écouté, encouragé et accompagné dans sa marche avec Dieu."} /></p></RevealOnScroll>
    <div className="ejp-fij-values">{[['Partager la Parole', 'Comprendre la foi et la mettre en pratique dans la vie de tous les jours.'], ['Vivre la fraternité', 'Créer des liens, se soutenir et accueillir ceux qui découvrent la maison.'], ['Porter un impact', 'Grandir comme disciple de Jésus-Christ et rayonner dans son entourage.']].map(([title, text]) => <RevealOnScroll key={title}><article><h3><PublicText value={title} /></h3><p><PublicText value={text} /></p></article></RevealOnScroll>)}</div>
    <RevealOnScroll><div className="ejp-fij-join"><h2><PublicText value={"Trouver ma famille à Nantes."} /></h2><p><PublicText field="fij_join_text" value={config?.fij_join_text || "Contacte l’équipe EJP Nantes pour connaître les FIJ, leurs lieux et leurs horaires, et être orienté vers une famille."} /></p>{config?.contact_email ? <a className="ejp-pill" href={`mailto:${config.contact_email}?subject=Rejoindre%20une%20FIJ`}><PublicText value={"Contacter l’équipe FIJ"} /></a> : <Link className="ejp-pill" to="/venir"><PublicText value={"Rencontrer l’équipe à Nantes"} /></Link>}</div></RevealOnScroll></section>
    <PublicFooter config={config} /></div>;
}
