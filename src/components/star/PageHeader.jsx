import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';

export default function PageHeader({ title, intention, breadcrumbs = [], actions = null }) {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      {/* Breadcrumb + retour */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour
        </button>
        {breadcrumbs.length > 0 && (
          <>
            <span className="text-muted-foreground/30">·</span>
            <div className="flex items-center gap-1 flex-wrap">
              {breadcrumbs.map((bc, i) => (
                <React.Fragment key={i}>
                  {bc.to ? (
                    <Link to={bc.to} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {bc.label}
                    </Link>
                  ) : (
                    <span className="text-xs text-muted-foreground">{bc.label}</span>
                  )}
                  {i < breadcrumbs.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Titre + intention + action */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-heading font-bold text-foreground leading-tight">{title}</h1>
          {intention && (
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{intention}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}