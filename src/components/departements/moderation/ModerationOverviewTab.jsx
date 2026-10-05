import React from 'react';
import { Mic, Clock, ListChecks, AlertCircle, Calendar } from 'lucide-react';
import { formatDate, isUpcoming, MOD_PLAN_STATUS_LABELS, MOD_PLAN_STATUS_COLORS, RUN_ITEM_TYPE_SHORT, formatDuration } from '@/lib/moderationConstants';

export default function ModerationOverviewTab({ moderationData, isResponsable, currentUserId, colors, onNavigateTab }) {
  const { plans = [], run_items_by_plan = {}, announcements = [] } = moderationData;

  const upcoming = (plans || []).filter(p => isUpcoming(p.date) && p.status !== 'cancelled' && p.status !== 'completed');
  const nextPlan = upcoming[0];
  const runItems = nextPlan ? (run_items_by_plan[nextPlan.id] || []) : [];
  const totalDuration = runItems.reduce((sum, r) => sum + (r.duration_minutes || 0), 0);
  const activeAnnouncements = (announcements || []).filter(a => a.status === 'active');

  // Check if current user is moderator or co-moderator
  const isModerator = nextPlan && (nextPlan.moderator_user_id === currentUserId || nextPlan.co_moderator_user_id === currentUserId);

  if (!nextPlan) {
    return (
      <div className="text-center py-12">
        <Mic className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Aucun service à préparer.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Prochain service</p>
        <p className="text-sm font-semibold text-foreground mb-1">{formatDate(nextPlan.date)}</p>
        {nextPlan.call_time && (
          <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Présence : {nextPlan.call_time}
          </p>
        )}

        {isModerator && (
          <div className="bg-surface/50 rounded-xl p-3 mb-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Ton rôle</p>
            <p className="text-sm font-medium text-foreground">
              {nextPlan.moderator_user_id === currentUserId ? 'Modérateur' : 'Co-modérateur'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface/50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">{runItems.length}</p>
            <p className="text-[10px] text-muted-foreground">séquences</p>
          </div>
          <div className="bg-surface/50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">{formatDuration(totalDuration) || '—'}</p>
            <p className="text-[10px] text-muted-foreground">durée estimée</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className={`text-[10px] px-2 py-1 rounded-full border ${MOD_PLAN_STATUS_COLORS[nextPlan.status] || ''}`}>{MOD_PLAN_STATUS_LABELS[nextPlan.status] || nextPlan.status}</span>
          <button onClick={() => onNavigateTab?.('moderation_run')} className={`text-xs ${colors.text}`}>Voir le conducteur →</button>
        </div>
      </div>

      {isResponsable && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Vue responsable</p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Conducteur</span>
              <span className="font-medium text-foreground">{runItems.length} séquences</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Durée estimée</span>
              <span className="font-medium text-foreground">{formatDuration(totalDuration) || 'Non définie'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Annonces actives</span>
              <span className="font-medium text-foreground">{activeAnnouncements.length}</span>
            </div>
            {nextPlan.moderator_name && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Modérateur</span>
                <span className="font-medium text-foreground">{nextPlan.moderator_name}</span>
              </div>
            )}
          </div>
          <button onClick={() => onNavigateTab?.('moderation_planning')} className={`mt-3 w-full text-xs ${colors.bg} ${colors.text} border ${colors.border} py-2 rounded-xl`}>
            Gérer le planning
          </button>
        </div>
      )}

      {/* Aperçu du conducteur */}
      {runItems.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Conducteur</p>
          <div className="space-y-1.5">
            {runItems.slice(0, 6).sort((a, b) => a.order_index - b.order_index).map((item, idx) => (
              <div key={item.id} className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground font-mono w-5">{idx + 1}.</span>
                <span className="font-medium text-foreground flex-1 truncate">{item.title}</span>
                <span className="text-[10px] text-muted-foreground">{RUN_ITEM_TYPE_SHORT[item.type] || item.type}</span>
                {item.duration_minutes && <span className="text-[10px] text-muted-foreground">{item.duration_minutes}min</span>}
              </div>
            ))}
            {runItems.length > 6 && <p className="text-xs text-muted-foreground text-center pt-1">+{runItems.length - 6} autres</p>}
          </div>
        </div>
      )}
    </div>
  );
}