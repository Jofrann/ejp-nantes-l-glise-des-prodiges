import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { hasAnyRole } from '@/lib/permissions';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RoleGuard({ allowedRoles, children }) {
  const { user } = useAuth();

  // Si l'utilisateur n'est pas encore chargé, on laisse passer — ProtectedRoute gère le loading
  if (!user) return children;

  if (hasAnyRole(user, allowedRoles)) return children;

  return (
    <div className="min-h-screen bg-[#0B0B0C] flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-[#C8A96A]/10 border border-[#C8A96A]/20 flex items-center justify-center mb-6">
        <ShieldCheck className="w-7 h-7 text-[#C8A96A]/60" />
      </div>
      <h1 className="font-display text-3xl text-[#F7F4EF] font-light mb-3">Accès réservé</h1>
      <p className="text-sm text-[#B8B8B8] max-w-sm mb-8">
        Cet espace est réservé aux responsables autorisés. Si tu penses qu'il s'agit d'une erreur, contacte le bureau.
      </p>
      <Link
        to="/espace-serviteur"
        className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#C8A96A] border border-[#C8A96A]/30 px-6 py-3 hover:bg-[#C8A96A]/10 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Retour à mon espace
      </Link>
    </div>
  );
}