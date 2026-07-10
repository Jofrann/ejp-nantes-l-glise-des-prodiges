import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Calendar, Clock, MapPin, Users, CheckCircle } from 'lucide-react';

const EVENT_TYPES = [
  { value: 'culte', label: 'Culte' },
  { value: 'ejp', label: 'Programme EJP' },
  { value: 'formation', label: 'Formation' },
  { value: 'reunion', label: 'Réunion' },
  { value: 'service', label: 'Service' },
  { value: 'special', label: 'Événement spécial' },
  { value: 'autre', label: 'Autre' },
];

const AUDIENCES = [
  { value: 'all_servants', label: 'Tous les serviteurs' },
  { value: 'all_members', label: 'Tous les membres' },
  { value: 'fij_pilots', label: 'Pilotes FIJ' },
  { value: 'leaders', label: 'Leaders' },
];

const PRESENCE_MODES = [
  { value: 'optional', label: 'Facultative' },
  { value: 'mandatory', label: 'Obligatoire' },
  { value: 'informative', label: 'Informative' },
];

const inputCls = "w-full bg-white border border-border text-foreground placeholder-muted-foreground/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-secondary/50";

export default function AdminProgramsTab() {
  const [events, setEvents] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', event_type: 'ejp', event_date: '',
    event_time: '', end_time: '', location: '',
    audience: 'all_servants', presence_mode: 'optional',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [evs, resp] = await Promise.all([
        base44.entities.Event.list('-event_date', 50),
        base44.entities.AttendanceResponse.list('-created_date', 100),
      ]);
      setEvents(evs || []);
      setResponses(resp || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const create = async () => {
    if (!form.title.trim() || !form.event_date) return;
    await base44.entities.Event.create({ ...form, is_active: true });
    setForm({ title: '', description: '', event_type: 'ejp', event_date: '', event_time: '', end_time: '', location: '', audience: 'all_servants', presence_mode: 'optional' });
    setShowForm(false);
    loadData();
  };

  const remove = async (id) => {
    await base44.entities.Event.delete(id);
    loadData();
  };

  const toggleActive = async (ev) => {
    await base44.entities.Event.update(ev.id, { is_active: !ev.is_active });
    loadData();
  };

  const responseCount = (eventId) => {
    const eventResponses = responses.filter(r => r.event_id === eventId);
    return {
      present: eventResponses.filter(r => r.status === 'present').length,
      absent: eventResponses.filter(r => r.status === 'absent').length,
      late: eventResponses.filter(r => r.status === 'late').length,
      total: eventResponses.length,
    };
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-border border-t-secondary rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-heading font-bold text-foreground">Programmes EJP officiel</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-secondary text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-secondary/90 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Créer un programme
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-5 mb-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Titre</label>
              <input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Commande au matin" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Type</label>
              <select className={inputCls} value={form.event_type} onChange={e => setForm(f => ({ ...f, event_type: e.target.value }))}>
                {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Date</label>
              <input type="date" className={inputCls} value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Heure début</label>
              <input type="time" className={inputCls} value={form.event_time} onChange={e => setForm(f => ({ ...f, event_time: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Heure fin</label>
              <input type="time" className={inputCls} value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Lieu</label>
              <input className={inputCls} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Ex: Église EJP Nantes" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Audience</label>
              <select className={inputCls} value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}>
                {AUDIENCES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Présence</label>
              <select className={inputCls} value={form.presence_mode} onChange={e => setForm(f => ({ ...f, presence_mode: e.target.value }))}>
                {PRESENCE_MODES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Description</label>
              <textarea className={inputCls} rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-xs font-medium bg-surface border border-border text-muted-foreground hover:bg-muted transition-all">Annuler</button>
            <button onClick={create} className="px-4 py-2 rounded-xl text-xs font-semibold bg-secondary text-white hover:bg-secondary/90 transition-all">Créer</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Aucun programme pour le moment.</p>
        ) : events.map(ev => {
          const stats = responseCount(ev.id);
          return (
            <div key={ev.id} className={`bg-card border rounded-2xl p-4 ${ev.is_active ? 'border-border' : 'border-border opacity-60'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-medium text-secondary bg-secondary/10 px-2 py-0.5 rounded-full uppercase">{ev.event_type || 'ejp'}</span>
                    {ev.presence_mode === 'mandatory' && <span className="text-[10px] text-danger bg-danger/10 px-2 py-0.5 rounded-full">Obligatoire</span>}
                  </div>
                  <p className="text-sm font-semibold text-foreground">{ev.title}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="w-3 h-3" /> {new Date(ev.event_date).toLocaleDateString('fr-FR')}</span>
                    {ev.event_time && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" /> {ev.event_time}{ev.end_time ? `–${ev.end_time}` : ''}</span>}
                    {ev.location && <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" /> {ev.location}</span>}
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="w-3 h-3" /> {ev.audience || 'all_servants'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => toggleActive(ev)} className={`p-1.5 rounded-lg ${ev.is_active ? 'text-success bg-success/10' : 'text-muted-foreground bg-surface'}`} title={ev.is_active ? 'Actif' : 'Inactif'}>
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(ev.id)} className="p-1.5 rounded-lg text-danger bg-danger/10 hover:bg-danger/20 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {stats.total > 0 && (
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                  <span className="text-xs text-success flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {stats.present} présent{stats.present > 1 ? 's' : ''}</span>
                  <span className="text-xs text-danger flex items-center gap-1"><Users className="w-3 h-3" /> {stats.absent} absent{stats.absent > 1 ? 's' : ''}</span>
                  <span className="text-xs text-warning flex items-center gap-1"><Clock className="w-3 h-3" /> {stats.late} retard</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}