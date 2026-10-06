import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare, Plus, X, Loader2, ChevronRight,
  Calendar, User, Flag, Check, Ban
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { PRIORITY_META, DECISION_STATUS_META, SOURCE_TYPE_LABELS } from '@/lib/pilotageConstants';

export default function PilotageDecisionsTab({ data, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', priority: 'normal', due_date: '', assigned_to_name: '',
  });
  const decisions = data?.decisions || [];

  const createDecision = async () => {
    if (!formData.title.trim()) return;
    setSaving(true);
    try {
      await base44.functions.invoke('managePilotageItem', {
        operation: 'create_decision',
        ...formData,
      });
      setFormData({ title: '', description: '', priority: 'normal', due_date: '', assigned_to_name: '' });
      setShowForm(false);
      onRefresh?.();
    } catch (e) {
      // Silencieux
    } finally {
      setSaving(false);
    }
  };

  const resolveDecision = async (id) => {
    try {
      await base44.functions.invoke('managePilotageItem', {
        operation: 'resolve_decision',
        decision_id: id,
      });
      onRefresh?.();
    } catch (e) {}
  };

  const cancelDecision = async (id) => {
    try {
      await base44.functions.invoke('managePilotageItem', {
        operation: 'cancel_decision',
        decision_id: id,
      });
      onRefresh?.();
    } catch (e) {}
  };

  const sorted = [...decisions].sort((a, b) => {
    const statusOrder = { open: 0, in_progress: 1, resolved: 2, cancelled: 3 };
    return (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
  });

  return (
    <div className="space-y-4">
      {/* Bouton créer */}
      <button
        onClick={() => setShowForm(true)}
        className="w-full glass-card border border-border rounded-2xl p-4 flex items-center justify-center gap-2 text-sm text-secondary hover:bg-secondary/5 transition-all"
      >
        <Plus className="w-4 h-4" /> Créer un suivi décisionnel
      </button>

      {/* Formulaire de création */}
      {showForm && (
        <div className="glass-card border border-secondary/20 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Nouvelle décision</p>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Titre de la décision"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:border-secondary"
          />
          <textarea
            placeholder="Description / contexte"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:border-secondary resize-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Priorité</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:border-secondary mt-1"
              >
                <option value="low">Basse</option>
                <option value="normal">Normale</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Échéance</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:border-secondary mt-1"
              />
            </div>
          </div>
          <input
            type="text"
            placeholder="Assigné à (nom)"
            value={formData.assigned_to_name}
            onChange={(e) => setFormData({ ...formData, assigned_to_name: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:border-secondary"
          />
          <button
            onClick={createDecision}
            disabled={!formData.title.trim() || saving}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Créer la décision
          </button>
        </div>
      )}

      {/* Liste des décisions */}
      {sorted.length === 0 ? (
        <div className="text-center py-12">
          <CheckSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucune décision de pilotage pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((d) => {
            const statusMeta = DECISION_STATUS_META[d.status] || DECISION_STATUS_META.open;
            const prioMeta = PRIORITY_META[d.priority] || PRIORITY_META.normal;
            const isClosed = d.status === 'resolved' || d.status === 'cancelled';
            return (
              <div key={d.id} className={`glass-card border border-border rounded-2xl p-4 ${isClosed ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusMeta.bg} ${statusMeta.color} ${statusMeta.border} border`}>
                        {statusMeta.label}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${prioMeta.bg} ${prioMeta.color} ${prioMeta.border} border`}>
                        <Flag className="w-2.5 h-2.5 inline mr-0.5" />{prioMeta.label}
                      </span>
                      {d.source_type && d.source_type !== 'manual' && (
                        <span className="text-[10px] text-muted-foreground bg-surface border border-border rounded px-1.5 py-0.5">
                          {SOURCE_TYPE_LABELS[d.source_type] || d.source_type}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-foreground">{d.title}</p>
                    {d.description && (
                      <p className="text-xs text-muted-foreground mt-1">{d.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                      {d.assigned_to_name && (
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{d.assigned_to_name}</span>
                      )}
                      {d.due_date && (
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{d.due_date}</span>
                      )}
                      {d.created_by_name && (
                        <span>par {d.created_by_name}</span>
                      )}
                    </div>
                    {d.resolution_notes && (
                      <p className="text-xs text-success mt-2 italic">« {d.resolution_notes} »</p>
                    )}
                  </div>
                  {!isClosed && (
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => resolveDecision(d.id)}
                        className="w-8 h-8 rounded-lg bg-success/10 hover:bg-success/20 flex items-center justify-center text-success transition-colors"
                        title="Marquer résolu"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => cancelDecision(d.id)}
                        className="w-8 h-8 rounded-lg bg-muted/10 hover:bg-muted/20 flex items-center justify-center text-muted-foreground transition-colors"
                        title="Annuler"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                {d.source_department_slug && (
                  <Link
                    to={`/app/pilotage/departements/${d.source_department_slug}`}
                    className="flex items-center gap-1 text-xs text-secondary mt-3 hover:underline"
                  >
                    Voir le département source <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}