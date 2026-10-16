import { PUBLIC_PHOTOS } from "@/components/public/publicPhotos";

export const AUTHORITY_PHOTOS = {
  apostle: "https://www.ejp-portonovo.com/assets/pp-WWxmMHpa.jpeg",
  samuel: "https://www.ejp-portonovo.com/assets/ejp_berger_samuel-B0krmCtv.png",
};

export const PUBLIC_IMAGE_SLOTS = [
  {
    key: "hero_image_url",
    title: "Grande image d’accueil",
    location: "Accueil · tout en haut, derrière le titre",
    href: "/",
    fallback: PUBLIC_PHOTOS.worship.url,
  },
  {
    key: "community_image_url",
    title: "La vie de la communauté",
    location: "Accueil · « Une place pour toi » ; pages La maison et FIJ",
    href: "/#vie-de-la-maison",
    fallback: PUBLIC_PHOTOS.community.url,
  },
  {
    key: "nantes_image_url",
    title: "Nantes, notre ville",
    location: "Accueil · « À Nantes, pour Nantes » ; page Nous rejoindre",
    href: "/venir",
    fallback: PUBLIC_PHOTOS.nantes.url,
  },
  {
    key: "apostle_photo_url",
    title: "Portrait de l’Apôtre",
    location: "Accueil · Nos autorités spirituelles",
    href: "/#autorites",
    fallback: AUTHORITY_PHOTOS.apostle,
    portrait: true,
  },
  {
    key: "world_shepherd_photo_url",
    title: "Portrait du Berger EJP Monde",
    location: "Accueil · présentation du Pasteur Samuel EBOUMBOU",
    href: "/#autorites",
    fallback: AUTHORITY_PHOTOS.samuel,
    portrait: true,
  },
  {
    key: "shepherd_image_url",
    title: "Portrait de la Bergère de Nantes",
    location: "Accueil · présentation de la Bergère",
    href: "/#autorites",
    portrait: true,
  },
];

export function resolvePublicImage(slot, config, gallery = [], leaders = []) {
  if (config?.[slot.key]) return config[slot.key];
  const images = gallery
    .filter((item) => item.type === "image" && item.is_active !== false)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  if (slot.key === "community_image_url")
    return images[0]?.file_url || slot.fallback;
  if (slot.key === "nantes_image_url")
    return images[1]?.file_url || slot.fallback;
  if (slot.key === "shepherd_image_url")
    return leaders.find((person) => person.is_main_shepherd)?.photo_url || "";
  return slot.fallback || "";
}
