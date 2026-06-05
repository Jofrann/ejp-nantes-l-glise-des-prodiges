import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=900&q=80";

// Cache module-level : chargé une seule fois pour toute la session
let cachedUrl = null;
let fetchPromise = null;

export function useAuthImage() {
  const [imageUrl, setImageUrl] = useState(cachedUrl || DEFAULT_IMAGE);

  useEffect(() => {
    if (cachedUrl) {
      setImageUrl(cachedUrl);
      return;
    }
    if (!fetchPromise) {
      fetchPromise = base44.entities.ChurchConfig.list().then((configs) => {
        const url = configs?.[0]?.auth_page_image_url;
        cachedUrl = url || DEFAULT_IMAGE;
        return cachedUrl;
      }).catch(() => {
        cachedUrl = DEFAULT_IMAGE;
        return DEFAULT_IMAGE;
      });
    }
    fetchPromise.then(setImageUrl);
  }, []);

  return imageUrl;
}