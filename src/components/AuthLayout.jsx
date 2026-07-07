import React from "react";
import { useAuthImage } from "@/lib/useAuthImage";

export default function AuthLayout({ children, footer }) {
  const imageUrl = useAuthImage();

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#0B0B0C]">
      {/* Colonne gauche — formulaire */}
      <div className="flex flex-col items-center justify-center px-8 py-12 bg-[#0B0B0C]">
        <div className="w-full max-w-sm">
          {children}
          {footer && (
            <p className="text-center text-sm text-[#B8B8B8] mt-6">{footer}</p>
          )}
        </div>
      </div>

      {/* Colonne droite — illustration (masquée sur mobile) */}
      <div className="hidden lg:block relative h-screen">
        <img
          src={imageUrl}
          alt="Illustration"
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="eager"
        />
        <div className="absolute inset-0 bg-[#0B0B0C]/40" />
      </div>
    </div>
  );
}