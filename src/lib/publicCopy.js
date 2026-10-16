import catalog from "./publicCopyCatalog.json";
export { catalog };
export const normalizeCopy = (value) => value.replace(/\s+/g, " ").trim();
export const copyIds = new Map(
  catalog.entries.map((item) => [
    normalizeCopy(item.source || item.value),
    item.id,
  ]),
);
export const PUBLIC_CONFIG_KEYS = [
  "id",
  "public_copy",
  ...catalog.fields.map((f) => f.key),
  "maps_link",
  "contact_email",
  "instagram_url",
  "youtube_url",
  "whatsapp_url",
  "tiktok_url",
  "announcement_active",
  "hero_image_url",
  "hero_video_url",
  "community_image_url",
  "nantes_image_url",
  "apostle_photo_url",
  "world_shepherd_photo_url",
  "shepherd_image_url",
];
export const publicConfigOnly = (config) =>
  Object.fromEntries(
    PUBLIC_CONFIG_KEYS.filter((key) => Object.hasOwn(config, key)).map(
      (key) => [key, config[key]],
    ),
  );
export function expandPublicCopy(value, config = {}) {
  const tokens = {
    jour: (config.service_day || "Dimanche").toLocaleLowerCase("fr"),
    Jour: (config.service_day || "Dimanche").replace(/^./, (value) =>
      value.toLocaleUpperCase("fr"),
    ),
    horaire: (config.service_time || "15:00").replace(":", "h"),
    adresse: config.address_label || "Nantes, France",
  };
  return value.replace(
    /\{\{(jour|Jour|horaire|adresse)\}\}/g,
    (_, key) => tokens[key],
  );
}
export const isPublicPreview = () =>
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).has("ejp_preview") &&
  window.parent !== window;

export const copyDefaults = new Map(
  catalog.entries.map((item) => [item.id, item.value]),
);
export const sharedDefaults = Object.fromEntries(
  catalog.fields
    .filter((field) => !["shepherd_name", "shepherd_bio"].includes(field.key))
    .map((field) => [field.key, field.value]),
);
export const withPublicDefaults = (config) => ({
  ...sharedDefaults,
  ...config,
  ...Object.fromEntries(
    Object.entries(sharedDefaults).filter(
      ([key, value]) => value && !config?.[key],
    ),
  ),
});
