import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Wrench, ChevronLeft } from 'lucide-react';

export default function ResponsabilitePlaceholder({ title, description, icon: Icon = Wrench, items = [] }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/app/responsabilites" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-secondary transition-colors mb-4">
          <ChevronLeft className="w-3 h-3" /> Mes responsabilités
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center">
            <Icon className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-secondary/5 to-transparent border border-secondary/10 rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-surface border border-border mb-4">
            <Wrench className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">Outil en préparation</p>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-4">
            Cet outil de responsabilité est en cours de développement. Les fonctionnalités suivantes seront bientôt disponibles :
          </p>
          {items.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center max-w-sm mx-auto">
              {items.map((item, i) => (
                <span key={i} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-surface border border-border text-muted-foreground">
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}