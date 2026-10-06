import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, AlertTriangle, Info, X, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { ALERT_LEVEL_META, ALERT_LEVEL_ORDER } from '@/lib/pilotageConstants';

const LEVEL_ICON = {
  INFO: Info,
  ATTENTION: AlertCircle,
  IMPORTANT: AlertTriangle,
  CRITIQUE: AlertTriangle,
};

export default function PilotageAlertsTab({ data, onRefresh }) {
  const [dismissing, setDismissing] = useState(null);
  const alerts = (data?.alerts || []).slice().sort((a, b) =>
    (ALERT_LEVEL_ORDER[a.level] ?? 99) - (ALERT_LEVEL_ORDER[b.level] ?? 99)
  );

  const dismissAlert = async (alert) => {
    setDismissing(alert.key);
    try {
      await base44.functions.invoke('managePilotageItem', {
        operation: 'dismiss_alert',
        alert_key: alert.key,
        alert_title: alert.title,
        source_type: alert.source_type,
        source_id: alert.source_id,
      });
      onRefresh?.();
    } catch (e) {
      // Silencieux
    } finally {
      setDismissing(null);
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-success" />
        </div>
        <p className="text-sm font-semibold text-foreground mb-1">Aucune alerte active</p>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">Le ministère fonctionne sans point d'attention critique en ce moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {alerts.length} alerte{alerts.length > 1 ? 's' : ''} active{alerts.length > 1 ? 's' : ''}. Chaque alerte propose une action concrète.
      </p>
      {alerts.map((alert) => {
        const meta = ALERT_LEVEL_META[alert.level] || ALERT_LEVEL_META.ATTENTION;
        const Icon = LEVEL_ICON[alert.level] || AlertCircle;
        return (
          <div key={alert.key} className={`glass-card border ${meta.border} rounded-2xl p-4`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                <Icon className={`w-5 h-5 ${meta.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color} ${meta.border} border`}>
                    {meta.label}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground">{alert.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Link
                    to={alert.action_url}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    {alert.action_label} <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
              <button
                onClick={() => dismissAlert(alert)}
                disabled={dismissing === alert.key}
                className="w-7 h-7 rounded-lg hover:bg-surface flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                title="Masquer cette alerte"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}