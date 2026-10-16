import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useEJPRead, ReadState, AssignmentList } from '../DepartmentAnalytics';

export function PlanEventLink({plan,departmentId,onLinked}) {
  const state=useEJPRead('getProgramAssignments',{department_id:departmentId});
  const [eventId,setEventId]=useState('');const [saving,setSaving]=useState(false);const [error,setError]=useState('');
  const save=async()=>{setSaving(true);setError('');try{await base44.functions.invoke('linkDepartmentEvent',{department_id:departmentId,source:plan.source,plan_id:plan.id,event_id:eventId});onLinked();}catch(e){setError(e.message);}finally{setSaving(false);}};
  return <div className="py-3 border-t border-border space-y-2"><p className="text-sm">{plan.title || 'Planning'} · {plan.date || 'Date manquante'}</p><ReadState state={state}><label className="block text-sm">Programme à relier<select className="block border border-border bg-card rounded-lg p-2 w-full" value={eventId} onChange={e=>setEventId(e.target.value)}><option value="">Choisir un programme de la même date</option>{state.data?.events.filter(e=>e.event_date===plan.date).map(e=><option key={e.id} value={e.id}>{e.title} · {e.event_date}</option>)}</select></label><Button disabled={!eventId || saving} onClick={save}>{saving ? 'Enregistrement…' : 'Relier le planning'}</Button></ReadState>{error && <p role="alert">{error}</p>}</div>;
}
export function DepartmentPlanningTools({departmentId}) {
  const state=useEJPRead('getProgramAssignments',{department_id:departmentId});
  return <section className="mt-6 border border-border bg-card rounded-xl p-4"><h3 className="font-semibold">Plannings à relier à un programme</h3><ReadState state={state}>{state.data?.unlinked_plans.length && state.data?.can_link_plans ? state.data.unlinked_plans.map(plan=><PlanEventLink key={plan.source+plan.id} plan={plan} departmentId={departmentId} onLinked={state.refresh}/>) : <p className="text-sm text-muted-foreground mt-2">Aucun planning à relier avec tes autorisations actuelles.</p>}</ReadState></section>;
}
export default function ProgramTeams() {
  const [eventId,setEventId]=useState('');
  const catalog=useEJPRead('getProgramAssignments',{});
  const state=useEJPRead('getProgramAssignments',{event_id:eventId || undefined});
  const data=state.data;
  return <section className="space-y-5" aria-label="Équipes des programmes"><h2 className="text-lg font-semibold">Équipes par programme</h2>
    <ReadState state={catalog}><label className="text-sm block">Programme<select className="block w-full border border-border bg-card rounded-lg p-3 mt-1" value={eventId} onChange={e=>setEventId(e.target.value)}><option value="">Tous les programmes</option>{catalog.data?.events.map(e=><option key={e.id} value={e.id}>{e.event_date} · {e.title}</option>)}</select></label></ReadState>
    <Button variant="outline" onClick={()=>{state.refresh();catalog.refresh();}}>Actualiser</Button>
    <ReadState state={state}>{data && <>
      <p className="text-sm">{data.assignments.length} affectation(s) · {data.unfilled} poste(s) non couvert(s) · {data.pending_confirmations} confirmation(s) manquante(s) · {data.conflicts.length} conflit(s).</p>
      {data.events.filter(e=>!eventId || e.id===eventId).map(event=>{
        const rows=data.assignments.filter(a=>a.event_id===event.id);
        const departments=[...new Set(rows.map(a=>a.department_id))];
        return <article key={event.id} className="border border-border rounded-xl bg-card p-4 space-y-4"><h3 className="font-semibold">{event.title} · {event.event_date}</h3><p className="text-sm text-muted-foreground">{event.event_time || '?'} – {event.end_time || '?'}</p>{!rows.length && <p className="text-sm text-muted-foreground">Aucune équipe reliée à ce programme. Les Référents renseignent les affectations depuis leur ministère.</p>}{departments.map(id=><div key={id}><h4 className="text-sm font-semibold">{rows.find(a=>a.department_id===id)?.department_name}</h4><AssignmentList rows={rows.filter(a=>a.department_id===id)}/></div>)}</article>;
      })}
      {!!data.conflicts.length && <div role="status" className="border border-danger/30 rounded-xl p-4"><h3 className="font-semibold">Chevauchements à résoudre avec les Référents</h3><ul className="mt-2 space-y-2 text-sm">{data.conflicts.map((c,i)=><li key={i}>{data.assignments.find(a=>a.user_id===c.user_id)?.full_name || 'Membre'} : {c.assignment_ids.map(id=>{const a=data.assignments.find(x=>x.id===id);return `${a?.department_name} (${a?.start_time}–${a?.end_time})`;}).join(' / ')}</li>)}</ul></div>}
      <p className="text-xs text-muted-foreground">{data.unlinked_plans.length} planning(s) sans programme relié · {data.missing_times.length} horaire(s) incomplet(s). Aucun conflit n’est déduit d’un horaire manquant. Les postes non couverts indiquent les places enregistrées ; aucun besoin non saisi n’est inventé.</p>
    </>}</ReadState>
  </section>;
}
