import React, { useState } from 'react';
import { Calendar, Plus, X, CheckCircle2, XCircle, AlertCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import {
  POSITION_LABELS, POSITION_OPTIONS, PLAN_STATUS_LABELS, PLAN_STATUS_COLORS,
  ASSIGNMENT_STATUS_LABELS, ASSIGNMENT_STATUS_COLORS,
  formatDate, formatDateShort, isUpcoming
} from '@/lib/musicConstants';

/**
 * MusicPlanningTab — Planning des services musicaux.
 *
 * Responsable : créer/modifier des plans, affecter des membres.
 * Membre : voir ses affectations, confirmer/décliner.
 */
export default function MusicPlanningTab({ musicData, isResponsable, currentUserId, colors, onRefresh }) {
  const { plans = [], assignments_by_plan = {}, members = [], availability_by_date = {} } = musicData;
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [expandedPlan, setExpandedPlan] = useState(null);

  const sortedPlans = [...(plans || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  const upcoming = sortedPlans.filter(p => isUpcoming(p.date) && p.status !== 'cancelled');
  const past = sortedPlans.filter(p => !isUpcoming(p.date) || p.status === 'cancelled');

  const handleSavePlan = async (data) => {
    try {
      await base44.functions.invoke('manageMusicItem', {
        department_slug: musicData.department.slug,
        operation: 'save_plan',
        item: data,
        item_id: editingPlan?.id || null,
      });
      toast({ title: editingPlan ? 'Plan modifié' : 'Plan créé' });
      setShowForm(false);
      setEditingPlan(null);
      onRefresh();
    } catch (e) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
  };

  const handleConfirm = async (assignmentId) => {
    try {
      await base44.functions.invoke('manageMusicItem', {
        department_slug: musicData.department.slug,
        operation: 'confirm_assignment',
        item_id: assignmentId,
      });
      toast({ title: 'Affectation confirmée' });
      onRefresh();
    } catch (e) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
  };

  const handleDecline = async (assignmentId) => {
    try {
      await base44.functions.invoke('manageMusicItem', {
        department_slug: musicData.department.slug,
        operation: 'decline_assignment',
        item_id: assignmentId,
      });
      toast({ title: 'Affectation déclinée' });
      onRefresh();
    } catch (e) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      {isResponsable && (
        <button
          onClick={() => { setEditingPlan(null); setShowForm(true); }}
          className={`w-full flex items-center justify-center gap-2 text-sm font-medium ${colors.bg} ${colors.text} border ${colors.border} rounded-xl py-3 hover:brightness-110 transition-all`}
        >
          <Plus className="w-4 h-4" /> Nouveau service
        </button>
      )}

      {showForm && isResponsable && (
        <PlanForm
          plan={editingPlan}
          onSave={handleSavePlan}
          onCancel={() => { setShowForm(false); setEditingPlan(null); }}
        />
      )}

      {upcoming.length === 0 && past.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun service musical n'est encore planifié.</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">À venir</p>
          <div className="space-y-3">
            {upcoming.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                assignments={assignments_by_plan[plan.id] || []}
                members={members}
                availability={availability_by_date[plan.date] || []}
                isResponsable={isResponsable}
                currentUserId={currentUserId}
                colors={colors}
                expanded={expandedPlan === plan.id}
                onToggle={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                onEdit={() => { setEditingPlan(plan); setShowForm(true); }}
                onConfirm={handleConfirm}
                onDecline={handleDecline}
                musicData={musicData}
                onRefresh={onRefresh}
              />
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Passés</p>
          <div className="space-y-2">
            {past.slice(0, 10).map(plan => (
              <div key={plan.id} className="flex items-center gap-3 bg-card/50 border border-border rounded-xl p-3 opacity-70">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{plan.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(plan.date)}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-lg border ${PLAN_STATUS_COLORS[plan.status] || PLAN_STATUS_COLORS.draft}`}>
                  {PLAN_STATUS_LABELS[plan.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlanCard({ plan, assignments, members, availability, isResponsable, currentUserId, colors, expanded, onToggle, onEdit, onConfirm, onDecline, musicData, onRefresh }) {
  const myAssignment = assignments.find(a => a.user_id === currentUserId);
  const confirmed = assignments.filter(a => a.status === 'confirmed').length;
  const declined = assignments.filter(a => a.status === 'declined').length;

  return (
    <div className={`bg-card border ${colors.border} rounded-2xl overflow-hidden`}>
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 text-left">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{plan.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(plan.date)} {plan.start_time && `— ${plan.start_time}`}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-lg border ${PLAN_STATUS_COLORS[plan.status] || PLAN_STATUS_COLORS.draft}`}>
            {PLAN_STATUS_LABELS[plan.status]}
          </span>
          <span className="text-xs text-muted-foreground">{assignments.length} affecté{assignments.length > 1 ? 's' : ''}</span>
          {confirmed > 0 && <span className="text-xs text-green-600">{confirmed}✓</span>}
          {declined > 0 && <span className="text-xs text-red-600">{declined}✗</span>}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2 border-t border-border pt-3">
          {assignments.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-3">Aucune affectation pour ce service.</p>
          )}
          {assignments.map(a => {
            const member = members.find(m => m.user_id === a.user_id);
            const avail = availability.find(av => av.user_id === a.user_id);
            const isMe = a.user_id === currentUserId;
            return (
              <div key={a.id} className="flex items-center gap-3 bg-surface/50 rounded-xl p-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{a.full_name || member?.full_name || '?'}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${colors.bg} ${colors.text} ${colors.border}`}>
                      {POSITION_LABELS[a.position] || a.position}
                    </span>
                    {avail && avail.status === 'unavailable' && (
                      <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                        <AlertCircle className="w-3 h-3" /> Déclaré indisponible
                      </span>
                    )}
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-lg border ${ASSIGNMENT_STATUS_COLORS[a.status] || ASSIGNMENT_STATUS_COLORS.assigned}`}>
                  {ASSIGNMENT_STATUS_LABELS[a.status] || a.status}
                </span>
                {isMe && a.status === 'assigned' && (
                  <div className="flex gap-1">
                    <button onClick={() => onConfirm(a.id)} className="w-7 h-7 flex items-center justify-center text-green-600 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-all">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDecline(a.id)} className="w-7 h-7 flex items-center justify-center text-red-600 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all">
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {isResponsable && (
            <AssignmentEditor plan={plan} assignments={assignments} members={members} availability={availability} colors={colors} musicData={musicData} onRefresh={onRefresh} />
          )}

          {isResponsable && (
            <button onClick={onEdit} className="w-full text-xs text-muted-foreground hover:text-foreground py-1.5 transition-colors">
              Modifier le plan
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function AssignmentEditor({ plan, assignments, members, availability, colors, musicData, onRefresh }) {
  const { toast } = useToast();
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');

  const handleAdd = async () => {
    if (!selectedMember || !selectedPosition) return;
    const member = members.find(m => m.user_id === selectedMember);
    try {
      await base44.functions.invoke('manageMusicItem', {
        department_slug: musicData.department.slug,
        operation: 'save_assignment',
        item: {
          service_plan_id: plan.id,
          user_id: selectedMember,
          full_name: member?.full_name || '',
          position: selectedPosition,
          status: 'assigned',
        },
      });
      toast({ title: 'Membre affecté' });
      setSelectedMember('');
      setSelectedPosition('');
      onRefresh();
    } catch (e) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
  };

  const handleRemove = async (assignmentId) => {
    try {
      await base44.functions.invoke('manageMusicItem', {
        department_slug: musicData.department.slug,
        operation: 'delete_assignment',
        item_id: assignmentId,
      });
      toast({ title: 'Affectation retirée' });
      onRefresh();
    } catch (e) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
  };

  const availableMembers = members.filter(m => !assignments.find(a => a.user_id === m.user_id && a.status !== 'declined'));

  return (
    <div className="mt-3 pt-3 border-t border-border space-y-2">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Affecter un membre</p>
      <div className="flex gap-2">
        <select
          value={selectedMember}
          onChange={e => setSelectedMember(e.target.value)}
          className="flex-1 text-xs border border-border rounded-lg px-2 py-2 bg-card"
        >
          <option value="">Choisir un membre...</option>
          {availableMembers.map(m => (
            <option key={m.user_id} value={m.user_id}>{m.full_name}</option>
          ))}
        </select>
        <select
          value={selectedPosition}
          onChange={e => setSelectedPosition(e.target.value)}
          className="flex-1 text-xs border border-border rounded-lg px-2 py-2 bg-card"
        >
          <option value="">Poste...</option>
          {POSITION_OPTIONS.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={!selectedMember || !selectedPosition}
          className="px-3 py-2 text-xs font-medium text-white bg-primary rounded-lg disabled:opacity-40 hover:bg-primary/90 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      {assignments.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {assignments.map(a => (
            <button
              key={a.id}
              onClick={() => handleRemove(a.id)}
              className="flex items-center gap-1 text-[10px] bg-surface border border-border rounded-lg px-2 py-1 hover:border-red-400/30 hover:text-red-600 transition-all"
            >
              {POSITION_LABELS[a.position]} · {a.full_name}
              <X className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PlanForm({ plan, onSave, onCancel }) {
  const [title, setTitle] = useState(plan?.title || '');
  const [date, setDate] = useState(plan?.date || '');
  const [startTime, setStartTime] = useState(plan?.start_time || '');
  const [status, setStatus] = useState(plan?.status || 'draft');
  const [notes, setNotes] = useState(plan?.notes || '');

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">{plan ? 'Modifier le service' : 'Nouveau service'}</p>
      <input
        type="text"
        placeholder="Titre (ex: Culte EJP)"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full text-sm border border-border rounded-lg px-3 py-2"
      />
      <div className="flex gap-2">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="flex-1 text-sm border border-border rounded-lg px-3 py-2"
        />
        <input
          type="time"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          className="text-sm border border-border rounded-lg px-3 py-2"
        />
      </div>
      <select
        value={status}
        onChange={e => setStatus(e.target.value)}
        className="w-full text-sm border border-border rounded-lg px-3 py-2"
      >
        {Object.entries(PLAN_STATUS_LABELS).map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
      <textarea
        placeholder="Notes..."
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={2}
        className="w-full text-sm border border-border rounded-lg px-3 py-2"
      />
      <div className="flex gap-2">
        <button
          onClick={() => onSave({ title, date, start_time: startTime, status, notes })}
          disabled={!title || !date}
          className="flex-1 text-sm font-medium text-white bg-primary rounded-lg py-2 disabled:opacity-40 hover:bg-primary/90 transition-all"
        >
          {plan ? 'Enregistrer' : 'Créer'}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 text-sm font-medium text-muted-foreground bg-surface border border-border rounded-lg py-2 hover:text-foreground transition-all"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}