import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PendingAccount({ userName }) {
  const handleLogout = () => {
    base44.auth.logout('/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mb-6">
        <Clock className="w-7 h-7 text-secondary" />
      </div>
      <h1 className="font-display text-3xl text-foreground font-light mb-3">Compte en attente de validation</h1>
      <p className="text-sm text-muted-foreground max-w-md mb-2">
        {userName ? `Bienvenue ${userName}. ` : ''}Ton compte a bien été créé. Un responsable va valider ton inscription avant que tu puisses accéder à l'espace serviteur.
      </p>
      <p className="text-xs text-muted-foreground/70 max-w-sm mb-8">
        Tu recevras une confirmation dès que ton accès sera activé. Merci pour ta patience.
      </p>
      <button
        onClick={handleLogout}
        className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-secondary border border-secondary/30 px-6 py-3 hover:bg-secondary/10 transition-colors"
      >
        <LogOut className="w-3.5 h-3.5" /> Se déconnecter
      </button>
    </div>
  );
}