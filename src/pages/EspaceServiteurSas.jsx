import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, LogIn, UserPlus, ArrowLeft, Shield, Users, Calendar, MessageCircle } from 'lucide-react';

export default function EspaceServiteurSas() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Glow ambiant */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      {/* Retour accueil */}
      <div className="relative z-10 max-w-2xl mx-auto w-full px-5 pt-6">
        <Link to="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Retour à l'accueil
        </Link>
      </div>

      {/* Contenu central */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-5 py-12">
        <div className="max-w-lg w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/20 mb-6">
              <Heart className="w-7 h-7 text-secondary" />
            </div>

            <p className="text-xs text-secondary uppercase tracking-widest mb-3">Espace Serviteur</p>
            <h1 className="font-display text-3xl font-light text-foreground mb-4">
              Bienvenue dans l'espace serviteur
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              Cet espace est réservé aux personnes engagées au service de l'EJP Nantes.
              Connecte-toi pour accéder à ton tableau de bord, tes départements et tes missions.
            </p>
          </motion.div>

          {/* Boutons d'action */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full bg-secondary hover:bg-secondary/90 text-white text-sm font-semibold py-3.5 rounded-xl transition-all"
            >
              <LogIn className="w-4 h-4" />
              Se connecter
            </Link>
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 w-full bg-card hover:bg-surface border border-border text-foreground text-sm font-medium py-3.5 rounded-xl transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Créer mon compte serviteur
            </Link>
          </motion.div>

          {/* Ce qu'on trouve dans l'espace */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-12">
            <p className="text-xs text-muted-foreground/60 uppercase tracking-widest text-center mb-5">Ce que tu trouveras dans l'espace</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Users, label: 'Mes départements', desc: 'Équipes & missions' },
                { icon: Calendar, label: 'Agenda', desc: 'Cultes & événements' },
                { icon: MessageCircle, label: 'Communication', desc: 'Groupes & annonces' },
                { icon: Shield, label: 'Mon profil', desc: 'Rôle & informations' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="bg-card border border-border rounded-xl p-4 text-center shadow-sm">
                  <Icon className="w-5 h-5 text-secondary mx-auto mb-2" />
                  <p className="text-xs font-semibold text-foreground">{label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Note validation */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center text-xs text-muted-foreground mt-8">
            Les nouveaux comptes sont soumis à validation par l'équipe d'encadrement.
          </motion.p>
        </div>
      </div>
    </div>
  );
}