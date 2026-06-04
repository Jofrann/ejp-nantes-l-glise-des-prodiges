import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=900&q=80";

export default function AuthLayout({ children, footer }) {
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE);

  useEffect(() => {
    base44.entities.ChurchConfig.list().then((configs) => {
      const cfg = configs?.[0];
      if (cfg?.auth_page_image_url) setImageUrl(cfg.auth_page_image_url);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Colonne gauche — formulaire */}
      <div className="flex flex-col items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-sm">
          {children}
          {footer && (
            <p className="text-center text-sm text-zinc-500 mt-6">{footer}</p>
          )}
        </div>
      </div>

      {/* Colonne droite — illustration (masquée sur mobile) */}
      <div className="hidden lg:block relative h-screen">
        <img
          src={imageUrl}
          alt="Illustration"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Léger overlay pour lisibilité */}
        <div className="absolute inset-0 bg-zinc-900/10" />
      </div>
    </div>
  );
}