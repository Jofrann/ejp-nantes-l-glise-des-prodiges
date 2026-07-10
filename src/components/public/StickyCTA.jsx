import React from 'react';
import { Link } from 'react-router-dom';

export default function StickyCTA() {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white/90 backdrop-blur-lg border-t border-[#E8E2D5] px-4 py-3">
      <Link
        to="/venir"
        className="flex items-center justify-center w-full bg-[#101827] text-white text-sm font-semibold py-3 rounded-full"
      >
        Je viens dimanche
      </Link>
    </div>
  );
}