import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, AlertCircle, Heart } from 'lucide-react';

const DEFAULT_VERSE = {
  text: "Chacun selon le don qu'il a reçu, employez-le à vous servir les uns les autres.",
  reference: "1 Pierre 4:10",
};

export default function BureauHero({ user, firstName, greeting, todayStr, pref, todoCount, onScrollToActions }) {
  const verseText = pref?.personal_verse_text || DEFAULT_VERSE.text;
  const verseRef = pref?.personal_verse_reference || DEFAULT_VERSE.reference;
  const seasonPhrase = pref?.season_phrase;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {/* Greeting + personnaliser */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-heading font-bold text-foreground leading-tight">
            {greeting}, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Voici ton Bureau STAR pour aujourd'hui. {todayStr}.
          </p>
        </div>
        <Link
          to="/app/espace-personnel"
          className="flex items-center gap-1.5 text-xs font-medium text-foreground bg-card border border-border rounded-xl px-3 py-2 hover:border-secondary/30 transition-colors flex-shrink-0"
        >
          <Settings className="w-3.5 h-3.5" /> Personnaliser
        </Link>
      </div>

      {/* Bandeau identité + verset */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-secondary/25 flex-shrink-0">
            {user?.photo_url ? (
              <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-secondary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-secondary">{firstName[0]}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-secondary uppercase tracking-widest mb-0.5">
              Serviteur Travaillant Activement pour le Royaume
            </p>
            {seasonPhrase && (
              <p className="text-sm text-muted-foreground italic mt-1">{seasonPhrase}</p>
            )}
          </div>
        </div>

        {/* Verset */}
        <div className="border-t border-border/50 pt-4">
          <div className="flex items-start gap-2">
            <Heart className="w-3.5 h-3.5 text-secondary/60 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-display text-foreground/80 text-base font-light italic leading-relaxed">
                "{verseText}"
              </p>
              <p className="text-xs text-secondary mt-1.5 text-right">— {verseRef}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Link
              to="/app/espace-personnel?section=verset"
              className="text-[11px] text-secondary hover:text-secondary/80 font-medium"
            >
              Changer mon verset
            </Link>
            <span className="text-muted-foreground/30">·</span>
            <Link
              to="/app/espace-personnel?section=verset"
              className="text-[11px] text-muted-foreground hover:text-foreground font-medium"
            >
              Modifier ma phrase de saison
            </Link>
          </div>
        </div>
      </div>

      {/* Badge actions cliquable */}
      {todoCount > 0 && (
        <button
          onClick={onScrollToActions}
          className="mt-3 flex items-center gap-2 text-xs text-warning bg-warning/10 border border-warning/20 rounded-full px-3 py-1.5 hover:bg-warning/15 transition-colors cursor-pointer"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          {todoCount} action{todoCount > 1 ? 's' : ''} à traiter — cliquer pour voir
        </button>
      )}
    </motion.div>
  );
}