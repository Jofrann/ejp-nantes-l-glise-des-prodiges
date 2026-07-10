import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle, Clock, MessageSquare, Calendar } from 'lucide-react';

const RDV_TYPES = {
  bergere: 'Bergère',
  leader: 'Leader',
  referent: 'Référent',
  pastoral: 'Soins pastoraux',
  academic: 'Vie Académique',
  formation: 'Formation',
  service: 'Service',
  orientation: 'Orientation',
  autre: 'Autre',
};

const STATUS_INFO = {
  pending: { label: 'En attente', cls: 'text-warning bg-warning/10 border-warning/20' },
  accepted: { label: 'Accepté', cls: 'text-success bg-success/10 border-success/20' },
  proposed: { label: 'Créneau proposé', cls: 'text-info bg-info/10 border-info/20' },
  completed: { label: 'Terminé', cls: 'text-muted-foreground bg-surface border-border' },
  cancelled: { label: 'Annulé', cls: 'text-danger bg-danger/10 border-danger/20' },
  transferred: { label: 'Transféré', cls: 'text-muted-foreground bg-surface border-border' },
};

const URGENCY_INFO = {
  normal: { label: 'Normal', cls: 'text-muted-foreground' },
  important: { label: 'Important', cls: 'text-warning' },
  urgent: { label: 'Urgent', cls: 'text-danger' },
};

export default function AdminAppointmentsTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [reviewComment, setReviewComment] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await base44.entities.AppointmentRequest.list('-created_date', 100);
      setRequests(data || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, comment = undefined) => {
    const payload = { status };
    if (comment !== undefined) payload.review_comment = comment;
    await base44.entities.AppointmentRequest.update(id, payload);
    load();
  };

  const filtered = requests.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'pending') return r.status === 'pending';
    if (filter === 'active') return ['pending', 'accepted', 'proposed'].includes(r.status);
    if (filter === 'done') return ['completed', 'cancelled', 'transferred'].includes(r.status);
    return true;
  });

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-border border-t-secondary rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <h2 className="text-sm font-heading font-bold text-foreground mb-4">Gestion des rendez-vous</h2>

      <div className="flex gap-1 bg-surface border border-border rounded-xl p-1 mb-5 w-fit">
        {[
          { key: 'pending', label: 'En attente' },
          { key: 'active', label: 'Actifs' },
          { key: 'done', label: 'Traités' },
          { key: 'all', label: 'Tous' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Aucune demande dans cette catégorie.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => {
            const st = STATUS_INFO[req.status] || STATUS_INFO.pending;
            const ug = URGENCY_INFO[req.urgency] || URGENCY_INFO.normal;
            const isExpanded = expandedId === req.id;
            return (
              <div key={req.id} className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-medium text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">{RDV_TYPES[req.request_type] || req.request_type}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${st.cls}`}>{st.label}</span>
                      <span className={`text-[10px] font-medium ${ug.cls}`}>{ug.label}</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{req.subject}</p>
                  </div>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : req.id)}
                    className="text-xs text-secondary hover:underline flex-shrink-0"
                  >
                    {isExpanded ? 'Réduire' : 'Détails'}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border space-y-2">
                    {req.message && (
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground leading-relaxed">{req.message}</p>
                      </div>
                    )}
                    {req.proposed_slots && (
                      <div className="flex items-start gap-2">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">Disponibilités: {req.proposed_slots}</p>
                      </div>
                    )}
                    {req.review_comment && (
                      <p className="text-xs text-info bg-info/5 rounded-lg px-3 py-2">Note interne: {req.review_comment}</p>
                    )}
                    <input
                      type="text"
                      placeholder="Note interne..."
                      value={reviewComment[req.id] || ''}
                      onChange={e => setReviewComment(prev => ({ ...prev, [req.id]: e.target.value }))}
                      className="w-full bg-white border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-secondary/40"
                    />
                  </div>
                )}

                {req.status === 'pending' && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <button
                      onClick={() => updateStatus(req.id, 'accepted', reviewComment[req.id])}
                      className="flex items-center gap-1 text-xs font-medium text-success bg-success/10 border border-success/20 px-3 py-1.5 rounded-lg hover:bg-success/20 transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Accepter
                    </button>
                    <button
                      onClick={() => updateStatus(req.id, 'proposed', reviewComment[req.id])}
                      className="flex items-center gap-1 text-xs font-medium text-info bg-info/10 border border-info/20 px-3 py-1.5 rounded-lg hover:bg-info/20 transition-all"
                    >
                      <Clock className="w-3.5 h-3.5" /> Proposer créneau
                    </button>
                    <button
                      onClick={() => updateStatus(req.id, 'cancelled', reviewComment[req.id])}
                      className="flex items-center gap-1 text-xs font-medium text-danger bg-danger/10 border border-danger/20 px-3 py-1.5 rounded-lg hover:bg-danger/20 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Refuser
                    </button>
                  </div>
                )}
                {req.status === 'accepted' && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <button
                      onClick={() => updateStatus(req.id, 'completed')}
                      className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-surface border border-border px-3 py-1.5 rounded-lg hover:bg-muted transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Marquer terminé
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}