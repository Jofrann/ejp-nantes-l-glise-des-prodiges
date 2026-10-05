import React, { useState, useMemo } from 'react';
import { CalendarCheck, Check, X, HelpCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { AVAILABILITY_LABELS, AVAILABILITY_COLORS, formatDate, isUpcoming } from '@/lib/musicConstants';

export default function MusicAvailabilityTab({ musicData, isResponsable, currentUserId, colors, onRefresh }) {
  const { plans = [], availability_by_date = {}, members = [] } = musicData;
  const { toast } = useToast();

  const upcomingDates = useMemo(() => {
    const dates = (plans || [])
      .filter(p => isUpcoming(p.date) && p.status !== 'cancelled')
      .map(p => p.date);

    const sundays = [];
    const today = new Date();
    for (let i = 0; i < 56; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      if (d.getDay() === 0) {
        sundays.push(d.toISOString().split('T')[0]);
      }
    }

    const merged = [...dates, ...sundays];
    const unique = [...new Set(merged)];
    return unique.sort().slice(0, 12);
  }, [plans]);

  const myAvailability = (date) => {
    const entries = availability_by_date[date] || [];
    return entries.find(a => a.user_id === currentUserId);
  };

  const handleSet = async (date, status) => {
    try {
      await base44.functions.invoke('manageMusicItem', {
        department_slug: musicData.department.slug,
        operation: 'save_availability',
        item: { date, status, user_id: currentUserId },
      });
      toast({ title: 'Disponibilité enregistrée' });
      onRefresh();
    } catch (e) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
  };

  if (upcomingDates.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarCheck className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Aucune date à venir.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Indique ta disponibilité pour les dates à venir. Le motif est facultatif et doit rester court (ex: Travail, Déplacement).</p>

      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Ma disponibilité</p>
        {upcomingDates.map(date => {
          const myAvail = myAvailability(date);
          return (
            <div key={date} className="bg-card border border-border rounded-xl p-3">
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-sm font-medium text-foreground">{formatDate(date)}</p>
                {myAvail && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-lg border ${AVAILABILITY_COLORS[myAvail.status] || AVAILABILITY_COLORS.unsure}`}>
                    {AVAILABILITY_LABELS[myAvail.status]}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSet(date, 'available')}
                  className={`flex-1 flex items-center justify-center gap-1 text-xs py-2 rounded-lg border transition-all ${
                    myAvail?.status === 'available' ? 'bg-green-500/10 text-green-600 border-green-400/20' : 'bg-surface text-muted-foreground border-border hover:text-foreground'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" /> Disponible
                </button>
                <button
                  onClick={() => handleSet(date, 'unavailable')}
                  className={`flex-1 flex items-center justify-center gap-1 text-xs py-2 rounded-lg border transition-all ${
                    myAvail?.status === 'unavailable' ? 'bg-red-500/10 text-red-600 border-red-400/20' : 'bg-surface text-muted-foreground border-border hover:text-foreground'
                  }`}
                >
                  <X className="w-3.5 h-3.5" /> Indisponible
                </button>
                <button
                  onClick={() => handleSet(date, 'unsure')}
                  className={`flex-1 flex items-center justify-center gap-1 text-xs py-2 rounded-lg border transition-all ${
                    myAvail?.status === 'unsure' ? 'bg-amber-500/10 text-amber-600 border-amber-400/20' : 'bg-surface text-muted-foreground border-border hover:text-foreground'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Incertain
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isResponsable && (
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Disponibilité de l'équipe</p>
          <div className="space-y-2">
            {upcomingDates.slice(0, 6).map(date => {
              const entries = availability_by_date[date] || [];
              const available = entries.filter(a => a.status === 'available');
              const unavailable = entries.filter(a => a.status === 'unavailable');
              const unsure = entries.filter(a => a.status === 'unsure');
              const noResponse = members.filter(m => m.user_id && !entries.find(a => a.user_id === m.user_id));

              return (
                <div key={date} className="bg-card border border-border rounded-xl p-3">
                  <p className="text-sm font-medium text-foreground mb-2">{formatDate(date)}</p>
                  <div className="space-y-1.5">
                    {available.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-green-600 font-medium w-20">Disponible</span>
                        <span className="text-xs text-muted-foreground">{available.map(a => a.full_name).join(', ')}</span>
                      </div>
                    )}
                    {unavailable.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-red-600 font-medium w-20">Indisponible</span>
                        <span className="text-xs text-muted-foreground">{unavailable.map(a => a.full_name).join(', ')}</span>
                      </div>
                    )}
                    {unsure.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-amber-600 font-medium w-20">Incertain</span>
                        <span className="text-xs text-muted-foreground">{unsure.map(a => a.full_name).join(', ')}</span>
                      </div>
                    )}
                    {noResponse.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground font-medium w-20">En attente</span>
                        <span className="text-xs text-muted-foreground">{noResponse.map(m => m.full_name).join(', ')}</span>
                      </div>
                    )}
                    {entries.length === 0 && noResponse.length === members.length && (
                      <p className="text-xs text-muted-foreground">Aucune réponse pour le moment.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}