import React, { useState } from 'react';
import { CalendarCheck, Plus, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatDate, isUpcoming, AVAILABILITY_STATUS_LABELS, AVAILABILITY_STATUS_COLORS, AVAILABILITY_STATUS_OPTIONS } from '@/lib/prayerConstants';

export default function PrayerAvailabilityTab({ prayerData, isResponsable, currentUserId, colors, onRefresh }) {
  const { availabilities = [], availability_by_date = {}, members = [] } = prayerData;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', status: 'available', reason: '' });
  const [saving, setSaving] = useState(false);

  const myAvailabilities = (availabilities || []).filter(a => a.user_id === currentUserId);
  const upcomingMine = myAvailabilities.filter(a => isUpcoming(a.date)).sort((a, b) => new Date(a.date) - new Date(b.date));

  const save = async () => {
    if (!form.date) return;
    setSaving(true);
    try {
      await base44.functions.invoke('managePrayerItem', {
        department_slug: prayerData.department.slug,
        operation: 'save_availability',
        item: form,
      });
      setForm({ date: '', status: 'available', reason: '' });
      setShowForm(false);
      onRefresh?.();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowForm(s => !s)}
        className={`w-full flex items-center justify-center gap-2 ${colors.bg} border ${colors.border} ${colors.text} py-3 rounded-xl text-sm font-medium hover:brightness-110 transition-all`}
      >
        <Plus className="w-4 h-4" /> Indiquer ma disponibilité
      </button>

      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <input type="date" className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            {AVAILABILITY_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Motif (optionnel, non sensible)" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
          <div className="flex gap-2">
            <button onClick={save} disabled={saving || !form.date} className={`flex-1 ${colors.bg} ${colors.text} border ${colors.border} py-2 rounded-xl text-sm font-medium disabled:opacity-50`}>{saving ? '...' : 'Enregistrer'}</button>
            <button onClick={() => setShowForm(false)} className="px-4 bg-surface border border-border rounded-xl text-sm">Annuler</button>
          </div>
        </div>
      )}

      {upcomingMine.length === 0 ? (
        <div className="text-center py-12">
          <CalendarCheck className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucune disponibilité renseignée.</p>
        </div>
      ) : (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Mes disponibilités à venir</p>
          <div className="space-y-2">
            {upcomingMine.map(av => (
              <div key={av.id} className="flex items-center justify-between bg-card border border-border rounded-xl p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{formatDate(av.date)}</p>
                  {av.reason && <p className="text-xs text-muted-foreground">{av.reason}</p>}
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full border ${AVAILABILITY_STATUS_COLORS[av.status] || ''}`}>
                  {AVAILABILITY_STATUS_LABELS[av.status] || av.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vue responsable : toutes les disponibilités par date */}
      {isResponsable && (
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Disponibilités de l'équipe</p>
          {Object.keys(availability_by_date).length === 0 ? (
            <p className="text-xs text-muted-foreground">Aucune disponibilité renseignée par l'équipe.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(availability_by_date)
                .filter(([date]) => isUpcoming(date))
                .sort(([a], [b]) => new Date(a) - new Date(b))
                .slice(0, 10)
                .map(([date, avs]) => (
                  <div key={date} className="bg-card border border-border rounded-xl p-3">
                    <p className="text-xs font-medium text-foreground mb-2">{formatDate(date)}</p>
                    <div className="space-y-1">
                      {avs.map(a => (
                        <div key={a.id} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{a.full_name || 'Membre'}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${AVAILABILITY_STATUS_COLORS[a.status] || ''}`}>
                            {AVAILABILITY_STATUS_LABELS[a.status] || a.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}