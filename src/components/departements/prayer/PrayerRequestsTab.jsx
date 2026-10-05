import React, { useState } from 'react';
import { Plus, X, Lock, Heart, ChevronLeft, Send, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { REQUEST_CATEGORY_LABELS, REQUEST_CATEGORY_OPTIONS, REQUEST_STATUS_LABELS, REQUEST_STATUS_COLORS, REQUEST_STATUS_OPTIONS, CONFIDENTIALITY_LABELS, CONFIDENTIALITY_COLORS, CONFIDENTIALITY_OPTIONS } from '@/lib/prayerConstants';

export default function PrayerRequestsTab({ prayerData, isResponsable, currentUserId, colors, onRefresh }) {
  const { requests = [], members = [] } = prayerData;
  const [showForm, setShowForm] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [form, setForm] = useState({ title: '', request_text: '', category: 'general', confidentiality: 'GENERAL_MPI', is_self: true });
  const [saving, setSaving] = useState(false);

  const visibleRequests = (requests || []).filter(r => r.status !== 'archived');

  const createRequest = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      await base44.functions.invoke('managePrayerItem', {
        department_slug: prayerData.department.slug,
        operation: 'create_request',
        item: form,
      });
      setForm({ title: '', request_text: '', category: 'general', confidentiality: 'GENERAL_MPI', is_self: true });
      setShowForm(false);
      onRefresh?.();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  // === DETAIL VIEW ===
  if (detailId) {
    return (
      <RequestDetail
        requestId={detailId}
        prayerData={prayerData}
        isResponsable={isResponsable}
        currentUserId={currentUserId}
        colors={colors}
        members={members}
        onBack={() => setDetailId(null)}
        onRefresh={onRefresh}
      />
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowForm(s => !s)}
        className={`w-full flex items-center justify-center gap-2 ${colors.bg} border ${colors.border} ${colors.text} py-3 rounded-xl text-sm font-medium hover:brightness-110 transition-all`}
      >
        <Plus className="w-4 h-4" /> Soumettre une demande
      </button>

      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <input className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" placeholder="Titre court (ex: Prière pour un examen)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <textarea className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" rows={3} placeholder="Ta demande (sois concis — inutile de détailler des informations intimes)" value={form.request_text} onChange={e => setForm(f => ({ ...f, request_text: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {REQUEST_CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={form.confidentiality} onChange={e => setForm(f => ({ ...f, confidentiality: e.target.value }))}>
              {CONFIDENTIALITY_OPTIONS.filter(o => {
                if (isResponsable) return true;
                return o.value === 'GENERAL_MPI' || o.value === 'PRIVATE_ASSIGNEES';
              }).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={form.is_self} onChange={e => setForm(f => ({ ...f, is_self: e.target.checked }))} />
            Cette demande me concerne
          </label>
          <div className="flex gap-2">
            <button onClick={createRequest} disabled={saving || !form.title} className={`flex-1 ${colors.bg} ${colors.text} border ${colors.border} py-2 rounded-xl text-sm font-medium disabled:opacity-50`}>{saving ? '...' : 'Soumettre'}</button>
            <button onClick={() => setShowForm(false)} className="px-4 bg-surface border border-border rounded-xl text-sm">Annuler</button>
          </div>
        </div>
      )}

      {visibleRequests.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucune demande accessible actuellement.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleRequests.map(req => {
            const isAssignedToMe = (prayerData.assignees_by_request?.[req.id] || []).some(a => a.user_id === currentUserId);
            const isMyRequest = req.requester_user_id === currentUserId;
            const showTitle = req.confidentiality === 'GENERAL_MPI' || isAssignedToMe || isMyRequest || isResponsable;

            return (
              <button
                key={req.id}
                onClick={() => setDetailId(req.id)}
                className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl p-4 hover:border-blue-400/30 transition-all text-left"
              >
                {req.confidentiality !== 'GENERAL_MPI' && <Lock className="w-4 h-4 flex-shrink-0 text-muted-foreground" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {showTitle ? req.title : 'Demande privée'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {REQUEST_STATUS_LABELS[req.status] || req.status}
                    {isAssignedToMe && !isMyRequest && ' · Assignée à toi'}
                    {isMyRequest && ' · Ta demande'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[10px] text-muted-foreground">{REQUEST_CATEGORY_LABELS[req.category] || req.category}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${CONFIDENTIALITY_COLORS[req.confidentiality] || ''}`}>
                    {CONFIDENTIALITY_LABELS[req.confidentiality] || req.confidentiality}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${REQUEST_STATUS_COLORS[req.status] || ''}`}>
                    {REQUEST_STATUS_LABELS[req.status] || req.status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RequestDetail({ requestId, prayerData, isResponsable, currentUserId, colors, members, onBack, onRefresh }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [updateText, setUpdateText] = useState('');
  const [savingUpdate, setSavingUpdate] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const res = (await base44.functions.invoke('managePrayerItem', {
        department_slug: prayerData.department.slug,
        operation: 'get_request_detail',
        item_id: requestId,
      })).data;
      if (res.access_denied) {
        setAccessDenied(true);
      } else if (res.not_found) {
        setAccessDenied(true);
      } else {
        setDetail(res);
      }
    } catch (e) {
      setAccessDenied(true);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { loadDetail(); }, [requestId]);

  const addUpdate = async () => {
    if (!updateText) return;
    setSavingUpdate(true);
    try {
      await base44.functions.invoke('managePrayerItem', {
        department_slug: prayerData.department.slug,
        operation: 'add_update',
        item: { request_id: requestId, text: updateText },
      });
      setUpdateText('');
      loadDetail();
    } catch (e) { console.error(e); } finally { setSavingUpdate(false); }
  };

  const updateStatus = async (newStatus) => {
    try {
      await base44.functions.invoke('managePrayerItem', {
        department_slug: prayerData.department.slug,
        operation: 'update_request_status',
        item_id: requestId,
        item: { status: newStatus },
      });
      loadDetail();
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-border border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="text-center py-12">
        <Lock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground mb-4">Tu n'as pas accès à cette demande.</p>
        <button onClick={onBack} className={`text-sm ${colors.text}`}>← Retour</button>
      </div>
    );
  }

  const req = detail?.request;
  if (!req) return null;

  const isMyRequest = req.requester_user_id === currentUserId;
  const canManage = isResponsable || isMyRequest;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className={`flex items-center gap-1 text-sm ${colors.text}`}>
        <ChevronLeft className="w-4 h-4" /> Retour
      </button>

      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-foreground">{req.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {REQUEST_CATEGORY_LABELS[req.category] || req.category} · Soumise par {req.submitted_by || '—'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${CONFIDENTIALITY_COLORS[req.confidentiality] || ''}`}>
              {req.confidentiality !== 'GENERAL_MPI' && <Lock className="w-2.5 h-2.5 inline mr-0.5" />}
              {CONFIDENTIALITY_LABELS[req.confidentiality] || req.confidentiality}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${REQUEST_STATUS_COLORS[req.status] || ''}`}>
              {REQUEST_STATUS_LABELS[req.status] || req.status}
            </span>
          </div>
        </div>

        {req.request_text && (
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{req.request_text}</p>
        )}

        {req.closed_at && (
          <p className="text-xs text-muted-foreground mt-3">Clôturée le {new Date(req.closed_at).toLocaleDateString('fr-FR')}</p>
        )}
      </div>

      {/* Actions responsable */}
      {isResponsable && req.status !== 'closed' && req.status !== 'archived' && (
        <div className="flex flex-wrap gap-2">
          <select
            value={req.status}
            onChange={e => updateStatus(e.target.value)}
            className="bg-white border border-border rounded-xl px-3 py-2 text-sm"
          >
            {REQUEST_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => updateStatus('closed')} className="flex items-center gap-1 text-xs bg-surface border border-border text-muted-foreground hover:text-foreground px-3 py-2 rounded-xl">
            <CheckCircle2 className="w-3.5 h-3.5" /> Clôturer
          </button>
          {req.confidentiality === 'PRIVATE_ASSIGNEES' && (
            <button onClick={() => setShowAssignModal(true)} className={`flex items-center gap-1 text-xs ${colors.bg} ${colors.text} border ${colors.border} px-3 py-2 rounded-xl`}>
              <UserPlus className="w-3.5 h-3.5" /> Gérer les assignés
            </button>
          )}
        </div>
      )}

      {/* Mises à jour / suivi */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Suivi</p>
        {(detail?.updates || []).length === 0 ? (
          <p className="text-xs text-muted-foreground">Aucune mise à jour pour le moment.</p>
        ) : (
          <div className="space-y-2">
            {(detail?.updates || []).map(upd => (
              <div key={upd.id} className="bg-card border border-border rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">{upd.created_by_name} · {new Date(upd.created_date).toLocaleDateString('fr-FR')}</p>
                <p className="text-sm text-foreground">{upd.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Ajouter un update */}
        <div className="mt-3 flex gap-2">
          <input
            className="flex-1 bg-white border border-border rounded-xl px-3 py-2 text-sm"
            placeholder="Ajouter une note de suivi..."
            value={updateText}
            onChange={e => setUpdateText(e.target.value)}
          />
          <button
            onClick={addUpdate}
            disabled={savingUpdate || !updateText}
            className={`flex items-center gap-1 ${colors.bg} ${colors.text} border ${colors.border} px-3 py-2 rounded-xl text-sm disabled:opacity-50`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Assignés (PRIVATE_ASSIGNEES uniquement) */}
      {req.confidentiality === 'PRIVATE_ASSIGNEES' && (detail?.assignees || []).length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Personnes autorisées</p>
          <div className="space-y-1.5">
            {(detail?.assignees || []).map(a => (
              <div key={a.id} className="flex items-center justify-between text-xs bg-surface/50 rounded-lg px-3 py-2">
                <span>{a.full_name || 'Membre'}</span>
                {isResponsable && (
                  <button
                    onClick={async () => {
                      try {
                        await base44.functions.invoke('managePrayerItem', {
                          department_slug: prayerData.department.slug,
                          operation: 'remove_assignee',
                          item_id: a.id,
                        });
                        loadDetail();
                      } catch (e) { console.error(e); }
                    }}
                    className="text-red-500/60 hover:text-red-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal assignation */}
      {showAssignModal && isResponsable && (
        <AssigneeModal
          requestId={requestId}
          members={members}
          existingAssignees={detail?.assignees || []}
          colors={colors}
          slug={prayerData.department.slug}
          onClose={() => setShowAssignModal(false)}
          onSaved={() => { setShowAssignModal(false); loadDetail(); }}
        />
      )}
    </div>
  );
}

function AssigneeModal({ requestId, members, existingAssignees, colors, slug, onClose, onSaved }) {
  const [sel, setSel] = useState({ user_id: '', role: 'intercesseur' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!sel.user_id) return;
    setSaving(true);
    try {
      const member = members.find(m => m.user_id === sel.user_id);
      await base44.functions.invoke('managePrayerItem', {
        department_slug: slug,
        operation: 'add_assignee',
        item: {
          prayer_request_id: requestId,
          user_id: sel.user_id,
          full_name: member?.full_name || '',
          role: sel.role,
        },
      });
      onSaved();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold">Autoriser une personne</p>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="space-y-3">
          <select className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" value={sel.user_id} onChange={e => setSel(s => ({ ...s, user_id: e.target.value }))}>
            <option value="">Sélectionner un membre...</option>
            {members.filter(m => !existingAssignees.some(a => a.user_id === m.user_id)).map(m => <option key={m.id} value={m.user_id}>{m.full_name}</option>)}
          </select>
          <button onClick={save} disabled={saving || !sel.user_id} className={`w-full ${colors.bg} ${colors.text} border ${colors.border} py-2.5 rounded-xl text-sm font-medium disabled:opacity-50`}>
            {saving ? '...' : 'Autoriser'}
          </button>
        </div>
      </div>
    </div>
  );
}