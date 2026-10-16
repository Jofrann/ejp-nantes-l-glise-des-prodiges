// Stable technical slugs preserve the existing specialized modules and links.
export const OFFICIAL_STRUCTURES = [
  { slug: 'leaders', name: 'Leaders' },
  { slug: 'fij', name: "Famille d'Impact Jeune (FIJ)" },
  { slug: 'prodiges-musique', name: 'Prodiges Musique', aliases: ['louange-adoration', 'louange-et-adoration'] },
  { slug: 'sono', name: 'Sonorisation', aliases: ['sonorisation'] },
  { slug: 'accueil', name: 'Accueil', aliases: ['accueil-integration', 'accueil-et-integration'] },
  { slug: 'communication', name: 'Communication' },
  { slug: 'moderation', name: 'Modération' },
  { slug: 'coordination', name: 'Coordination générale', aliases: ['coordination-generale'] },
  { slug: 'coordination-fij', name: 'Coordination FIJ' },
  { slug: 'pilote-fij', name: 'Pilote FIJ', kind: 'responsibility', route: '/app/responsabilites/fij-pilote' },
  { slug: 'mpi', name: "Ministère de la Prière et de l'Intercession (MPI)" },
  { slug: 'vie-academique', name: 'Vie Académique', kind: 'specialized', route: '/app/etudiant' },
];
export const structureKey = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const findOfficialStructure = department => OFFICIAL_STRUCTURES.find(s =>
  [s.slug, structureKey(s.name), ...(s.aliases || [])].some(key => key === structureKey(department.slug) || key === structureKey(department.name)));
export const isRetiredStructure = department => ['intendance', 'intendance-logistique', 'intendance-et-logistique', 'accompagnement-pastoral'].some(key => key === structureKey(department.slug) || key === structureKey(department.name));
