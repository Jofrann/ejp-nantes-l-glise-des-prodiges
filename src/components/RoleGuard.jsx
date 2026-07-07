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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mb-6">
        <ShieldCheck className="w-7 h-7 text-secondary" />
      </div>
      <h1 className="font-display text-3xl text-foreground font-light mb-3">Accès réservé</h1>
      <p className="text-sm text-muted-foreground max-w-sm mb-8">
        Cet espace est réservé aux responsables autorisés. Si tu penses qu'il s'agit d'une erreur, contacte le bureau.
      </p>
      <Link
        to="/espace-serviteur"
        className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-secondary border border-secondary/30 px-6 py-3 hover:bg-secondary/10 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Retour à mon espace
      </Link>
    </div>
  );
}