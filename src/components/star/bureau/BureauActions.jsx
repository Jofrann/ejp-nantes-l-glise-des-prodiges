import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ChevronRight, Calendar, Clock } from 'lucide-react';

const URGENCY_STYLES = {
  high: { border: 'border-warning/30', icon: 'bg-warning/10 text-warning', badge: 'bg-warning/10 text-warning' },
  normal: { border: 'border-border', icon: 'bg-secondary/10 text-secondary', badge: 'bg-secondary/10 text-secondary' },
};

const ACTION_EMPTY = {
  title: 'Aucune action urgente',
  description: 'Tu peux préparer ta semaine ou continuer ta formation.',
};

const BureauActions = forwardRef(({ actions = [] }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="scroll-mt-24"
    >
      <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">À traiter maintenant</h2>

      {actions.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-5 text-center">
          <CheckCircle className="w-8 h-8 text-success/60 mx-auto mb-2" />
          <p className="text-sm font-semibold text-foreground">{ACTION_EMPTY.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{ACTION_EMPTY.description}</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Link to="/app/agenda" className="text-xs font-medium text-secondary bg-secondary/10 border border-secondary/20 rounded-lg px-3 py-1.5 hover:bg-secondary/15 transition-colors">
              Ouvrir mon agenda
            </Link>
            <Link to="/app/formations" className="text-xs font-medium text-foreground bg-card border border-border rounded-lg px-3 py-1.5 hover:border-secondary/30 transition-colors">
              Voir mes formations
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {actions.map((action, i) => {
            const style = URGENCY_STYLES[action.urgency] || URGENCY_STYLES.normal;
            const Icon = action.icon || Clock;
            return (
              <div
                key={action.id || i}
                className={`bg-card border ${style.border} rounded-xl p-4`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${style.icon}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{action.title}</p>
                    {action.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{action.description}</p>
                    )}
                    {action.reason && (
                      <p className="text-[11px] text-muted-foreground/70 mt-1 italic">{action.reason}</p>
                    )}
                    {action.dueLabel && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <Calendar className="w-3 h-3 text-warning" />
                        <span className="text-[11px] text-warning font-medium">{action.dueLabel}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 ml-12">
                  <Link
                    to={action.primaryTo}
                    className="flex items-center gap-1 text-xs font-semibold text-white bg-secondary rounded-lg px-3 py-1.5 hover:bg-secondary/90 transition-colors"
                  >
                    {action.primaryLabel} <ChevronRight className="w-3 h-3" />
                  </Link>
                  {action.secondaryActions?.map((sec, j) => (
                    <Link
                      key={j}
                      to={sec.to}
                      className="text-xs font-medium text-foreground bg-card border border-border rounded-lg px-3 py-1.5 hover:border-secondary/30 transition-colors"
                    >
                      {sec.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
});

BureauActions.displayName = 'BureauActions';
export default BureauActions;