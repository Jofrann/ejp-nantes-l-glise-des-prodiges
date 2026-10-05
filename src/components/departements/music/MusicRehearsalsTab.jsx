import React, { useState } from 'react';
import { Calendar, Plus, X, Clock, MapPin, Music } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { REHEARSAL_STATUS_LABELS, formatDate, isUpcoming } from '@/lib/musicConstants';

export default function MusicRehearsalsTab({ musicData, isResponsable, colors, onRefresh }) {
  const { rehearsals = [], plans = [] } = musicData;
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const sorted = [...(rehearsals || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  const upcoming = sorted.filter(r => isUpcoming(r.date) && r.status !== 'cancelled');
  const past = sorted.filter(r => !isUpcoming(r.date) || r.status === 'cancelled');

  const handleSave = async (data) => {
    try {
      await base44.functions.invoke('manageMusicItem', {
        department_slug: musicData.department.slug,
        operation: 'save_rehearsal',
        item: data,
        item_id: editing?.id || null,
      });
      toast({ title: editing ? 'Répétition modifiée' : 'Répétition créée' });
      setShowForm(false);
      setEditing(null);
      onRefresh();
    } catch (e) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette répétition ?')) return;
    try {
      await base44.functions.invoke('manageMusicItem', {
        department_slug: musicData.department.slug,
        operation: 'delete_rehearsal',
        item_id: id,
      });
      toast({ title: 'Répétition supprimée' });
      onRefresh();
    } catch (e) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      {isResponsable && (
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className={`w-full flex items-center justify-center gap-2 text-sm font-medium ${colors.bg} ${colors.text} border ${colors.border} rounded-xl py-3 hover:brightness-110 transition-all`}
        >
          <Plus className="w-4 h-4" /> Nouvelle répétition
        </button>
      )}

      {showForm && isResponsable && (
        <RehearsalForm
          rehearsal={editing}
          plans={plans}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {upcoming.length === 0 && past.length === 0 && (
        <div className="text-center py-12">
          <Music className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucune répétition à venir.</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">À venir</p>
          <div className="space-y-2">
            {upcoming.map(r => {
              const linkedPlan = plans.find(p => p.id === r.service_plan_id);
              return (
                <div key={r.id} className={`bg-card border ${colors.border} rounded-2xl p-4`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{r.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(r.date)}</span>
                        {r.start_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {r.start_time}{r.end_time && `—${r.end_time}`}</span>}
                      </div>
                      {r.location && <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1"><MapPin className="w-3 h-3" /> {r.location}</p>}
                      {linkedPlan && <p className="text-xs text-muted-foreground mt-1">Lié à : {linkedPlan.title}</p>}
                      {r.notes && <p className="text-xs text-muted-foreground mt-2">{r.notes}</p>}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-lg border bg-surface text-muted-foreground">
                      {REHEARSAL_STATUS_LABELS[r.status] || r.status}
                    </span>
                  </div>
                  {isResponsable && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => { setEditing(r); setShowForm(true); }} className="text-xs text-muted-foreground hover:text-foreground">Modifier</button>
                      <button onClick={() => handleDelete(r.id)} className="text-xs text-red-500 hover:text-red-600">Supprimer</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Passées</p>
          <div className="space-y-2">
            {past.slice(0, 10).map(r => (
              <div key={r.id} className="flex items-center gap-3 bg-card/50 border border-border rounded-xl p-3 opacity-70">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(r.date)}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-lg border bg-surface text-muted-foreground">
                  {REHEARSAL_STATUS_LABELS[r.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RehearsalForm({ rehearsal, plans, onSave, onCancel }) {
  const [title, setTitle] = useState(rehearsal?.title || '');
  const [date, setDate] = useState(rehearsal?.date || '');
  const [startTime, setStartTime] = useState(rehearsal?.start_time || '');
  const [endTime, setEndTime] = useState(rehearsal?.end_time || '');
  const [location, setLocation] = useState(rehearsal?.location || '');
  const [notes, setNotes] = useState(rehearsal?.notes || '');
  const [servicePlanId, setServicePlanId] = useState(rehearsal?.service_plan_id || '');

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">{rehearsal ? 'Modifier la répétition' : 'Nouvelle répétition'}</p>
      <input type="text" placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} className="w-full text-sm border border-border rounded-lg px-3 py-2" />
      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full text-sm border border-border rounded-lg px-3 py-2" />
      <div className="flex gap-2">
        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="flex-1 text-sm border border-border rounded-lg px-3 py-2" />
        <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="flex-1 text-sm border border-border rounded-lg px-3 py-2" />
      </div>
      <input type="text" placeholder="Lieu" value={location} onChange={e => setLocation(e.target.value)} className="w-full text-sm border border-border rounded-lg px-3 py-2" />
      <select value={servicePlanId} onChange={e => setServicePlanId(e.target.value)} className="w-full text-sm border border-border rounded-lg px-3 py-2">
        <option value="">Aucun service associé</option>
        {plans.map(p => <option key={p.id} value={p.id}>{p.title} — {p.date}</option>)}
      </select>
      <textarea placeholder="Notes..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full text-sm border border-border rounded-lg px-3 py-2" />
      <div className="flex gap-2">
        <button onClick={() => onSave({ title, date, start_time: startTime, end_time: endTime, location, notes, service_plan_id: servicePlanId })} disabled={!title || !date} className="flex-1 text-sm font-medium text-white bg-primary rounded-lg py-2 disabled:opacity-40 hover:bg-primary/90 transition-all">
          {rehearsal ? 'Enregistrer' : 'Créer'}
        </button>
        <button onClick={onCancel} className="flex-1 text-sm font-medium text-muted-foreground bg-surface border border-border rounded-lg py-2 hover:text-foreground transition-all">Annuler</button>
      </div>
    </div>
  );
}