import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import RevealOnScroll from '../RevealOnScroll';
export default function FijInvitation({ config }) {
  return <section className="ejp-fij-invitation"><RevealOnScroll><div className="max-w-6xl mx-auto"><p className="ejp-eyebrow">Familles d’Impact Jeunes</p><h2>Une grande église.<br /><em className="ejp-gold-wave">Une famille tout près.</em></h2><p>{config?.fij_text || "Les FIJ sont des petits groupes de jeunes où l’on partage la Parole de Dieu, prie ensemble et construit des relations fraternelles. Un lieu pour être connu, accompagné et grandir dans la foi."}</p><Link to="/fij" className="ejp-pill">Découvrir les FIJ <ArrowUpRight size={18} /></Link></div></RevealOnScroll></section>;
}
