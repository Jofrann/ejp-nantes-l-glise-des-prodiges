import React, { useState } from 'react';
import { UserPlus, X, Phone, MessageSquare, Trash2, UserCheck, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { VISITOR_STATUS_LABELS, VISITOR_STATUS_COLORS, VISITOR_STATUS_OPTIONS, formatDate } from '@/lib/welcomeConstants';

export default function WelcomeVisitorsTab({ welcomeData, isResponsable, currentUserId, colors, onRefresh }) {
  const { visitors = [] } = welcomeData;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', first_visit_date: '', consent_to_contact: false, notes: '' });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? visitors : visitors.filter(v => v.status === filter);

  const save = async () => {
    if (!form.first_name) return;
    setSaving(true);
    try {
      await base44.functions.invoke('manageWelcomeItem', {
        department_slug: welcomeData.department.slug,
        operation: 'save_visitor',
        item: form,
      });
      setForm({ first_name: '', last_name: '', phone: '', first_visit_date: '', consent_to_contact: false, notes: '' });
      setShowForm(false);
      onRefresh?.();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await base44.functions.invoke('manageWelcomeItem', {
        department_slug: welcomeData.department.slug,
        operation: 'update_visitor_status',
        item_id: id,
        item: { status },
      });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  const deleteVisitor = async (id) => {
    if (!confirm('Supprimer cette fiche visiteur ?')) return;
    try {
      await base44.functions.invoke('manageWelcomeItem', {
        department_slug: welcomeData.department.slug,
        operation: 'delete_visitor',
        item_id: id,
      });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-4">
      {isResponsable && (
        <>
          <button onClick={() => setShowForm(s => !s)} className={`w-full flex items-center justify-center gap-2 ${colors.bg} border ${colors.border} ${colors.text} py-3 rounded-xl text-sm font-medium hover:brightness-110 transition-all`}>
            <UserPlus className="w-4 h-4" /> Nouveau visiteur
          </button>

          {showForm && (
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Prénom *" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
                <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Nom (facultatif)" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Téléphone (facultatif)" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                <input type="date" className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.first_visit_date} onChange={e => setForm(f => ({ ...f, first_visit_date: e.target.value }))} />
              </div>
              <label className="flex items-center gap-2 text-xs text-foreground">
                <input type="checkbox" checked={form.consent_to_contact} onChange={e => setForm(f => ({ ...f, consent_to_contact: e.target.checked }))} className="w-4 h-4" />
                Accepte d'être recontacté
              </label>
              <textarea className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" rows={2} placeholder="Note courte et opérationnelle (non sensible)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              <div className="flex gap-2">
                <button onClick={save} disabled={saving || !form.first_name} className={`flex-1 ${colors.bg} ${colors.text} border ${colors.border} py-2 rounded-xl text-sm font-medium disabled:opacity-50`}>{saving ? '...' : 'Créer'}</button>
                <button onClick={() => setShowForm(false)} className="px-4 bg-surface border border-border rounded-xl text-sm">Annuler</button>
              </div>
            </div>
          )}

          {/* Filtres */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button onClick={() => setFilter('all')} className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap ${filter === 'all' ? `${colors.bg} ${colors.text} border ${colors.border}` : 'text-muted-foreground'}`}>Tous</button>
            {VISITOR_STATUS_OPTIONS.map(o => (
              <button key={o.value} onClick={() => setFilter(o.value)} className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap ${filter === o.value ? `${colors.bg} ${colors.text} border ${colors.border}` : 'text-muted-foreground'}`}>{o.label}</button>
            ))}
          </div>
        </>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <UserCheck className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun visiteur à suivre.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(v => (
            <div key={v.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{v.first_name} {v.last_name || ''}</p>
                  {v.first_visit_date && <p className="text-xs text-muted-foreground mt-0.5">1ère visite : {formatDate(v.first_visit_date)}</p>}
                  {isResponsable && v.phone && (
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Phone className="w-3 h-3" /> {v.phone}</p>
                  )}
                  {v.assigned_to_name && <p className="text-xs text-muted-foreground mt-0.5">Suivi : {v.assigned_to_name}</p>}
                  {v.notes && <p className="text-xs text-foreground mt-1.5 bg-surface/50 rounded-lg px-2 py-1.5">{v.notes}</p>}
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${VISITOR_STATUS_COLORS[v.status] || ''} ml-2 flex-shrink-0`}>{VISITOR_STATUS_LABELS[v.status] || v.status}</span>
              </div>

              {!v.consent_to_contact && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
                  <AlertCircle className="w-3 h-3" /> Pas de consentement pour recontact
                </div>
              )}

              {isResponsable && (
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <select value={v.status} onChange={e => updateStatus(v.id, e.target.value)} className="text-xs bg-white border border-border rounded-lg px-2 py-1">
                    {VISITOR_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <button onClick={() => deleteVisitor(v.id)} className="text-xs text-red-500/60 hover:text-red-600 flex items-center gap-1"><Trash2 className="w-3 h-3" /> Supprimer</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}