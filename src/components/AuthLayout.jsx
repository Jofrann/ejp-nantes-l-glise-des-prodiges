import React from "react";
import { useAuthImage } from "@/lib/useAuthImage";

export default function AuthLayout({ children, footer }) {
  const imageUrl = useAuthImage();

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
          loading="eager"
        />
        <div className="absolute inset-0 bg-zinc-900/10" />
      </div>
    </div>
  );
}