import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Plus, ChevronRight, Clock } from 'lucide-react';

function formatDateGroup(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr + 'T00:00:00');
  const diff = Math.round((date - today) / (1000 * 60 * 60 * 24));

  if (diff === 0) return 'Aujourd\'hui';
  if (diff === 1) return 'Demain';
  if (diff > 1 && diff <= 7) {
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' });
  }
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function BureauAgendaCourt({ events = [] }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const weekFromNow = new Date();
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  const weekStr = weekFromNow.toISOString().split('T')[0];

  const upcoming = events
    .filter(e => e.event_date >= todayStr && e.event_date <= weekStr)
    .slice(0, 5);

  const grouped = {};
  upcoming.forEach(e => {
    const group = formatDateGroup(e.event_date);
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(e);
  });

  const groupKeys = Object.keys(grouped).slice(0, 3);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs text-muted-foreground uppercase tracking-widest">Mon agenda court</h2>
        <Link to="/app/agenda" className="text-xs text-secondary flex items-center gap-1 hover:text-secondary/80">
          Ouvrir l'agenda complet <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
        {groupKeys.length === 0 ? (
          <div className="text-center py-3">
            <Clock className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Rien de prévu cette semaine.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groupKeys.map(group => (
              <div key={group}>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1.5">{group}</p>
                {grouped[group].map((e, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-1">
                    <span className="text-xs font-bold text-secondary w-12 flex-shrink-0">
                      {e.event_time || '--:--'}
                    </span>
                    <span className="text-sm text-foreground truncate">{e.title}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <Link
          to="/app/agenda"
          className="mt-3 flex items-center justify-center gap-1.5 w-full bg-surface border border-border text-foreground text-xs font-medium py-2 rounded-xl hover:border-secondary/30 transition-colors"
        >
          <Plus className="w-3 h-3" /> Ajouter une occupation
        </Link>
      </div>
    </motion.div>
  );
}