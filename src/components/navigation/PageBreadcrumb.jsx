import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';

/**
 * PageBreadcrumb — fil d'Ariane et bouton retour, design blanc premium.
 */
export default function PageBreadcrumb({ items = [], backTo, backLabel, rightAction }) {
  if (!items.length) return null;

  const parentBack = items.length >= 2 ? items[items.length - 2] : items[0];
  const backDestination = backTo || parentBack.to;
  const backText = backLabel || `← ${parentBack.label}`;

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="flex items-center gap-2 min-w-0">
        {/* Bouton retour */}
        <Link
          to={backDestination}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-secondary transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-3 h-3" />
          {backLabel || parentBack.label}
        </Link>

        {/* Fil d'Ariane discret */}
        {items.length > 1 && (
          <div className="hidden sm:flex items-center gap-1 min-w-0">
            {items.slice(0, -1).map((item, i) => (
              <React.Fragment key={i}>
                <ChevronRight className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
                <Link
                  to={item.to}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors truncate"
                >
                  {item.label}
                </Link>
              </React.Fragment>
            ))}
            <ChevronRight className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
            <span className="text-xs text-foreground font-medium truncate">
              {items[items.length - 1].label}
            </span>
          </div>
        )}
      </div>

      {rightAction && (
        <div className="flex-shrink-0">{rightAction}</div>
      )}
    </div>
  );
}