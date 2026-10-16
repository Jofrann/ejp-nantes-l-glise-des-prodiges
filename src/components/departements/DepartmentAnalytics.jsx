import React, { useEffect, useState, lazy, Suspense } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
const AttendanceTrend=lazy(()=>import('./AttendanceTrend'));

export const PRESENCE_LABELS={present:'Présent',late:'En retard',absent:'Absent',excused:'Absence justifiée',absent_justified:'Absence justifiée',no_response:'Non renseigné',not_recorded:'Non renseigné',pending:'En attente'};
export function useEJPRead(name,parameters) {
  const [state,setState]=useState({loading:true,data:null,error:''});
  const [version,setVersion]=useState(0);
  const key=JSON.stringify(parameters);
  useEffect(()=>{let current=true;setState({loading:true,data:null,error:''});
    base44.functions.invoke(name,JSON.parse(key)).then(r=>{if(current)setState({loading:false,data:r.data,error:''});}).catch(e=>{if(current)setState({loading:false,data:null,error:e.message || 'Chargement impossible'});});
    return()=>{current=false;};
  },[name,key,version]);
  return {...state,refresh:()=>setVersion(v=>v+1)};
}
export function ReadState({state,children}) {
  if(state.loading)return <p role="status" className="p-4 text-sm text-muted-foreground">Chargement…</p>;
  if(state.error)return <div role="alert" className="p-4 border border-danger/30 rounded-xl"><p>{state.error}</p><Button variant="outline" className="mt-3" onClick={state.refresh}>Réessayer</Button></div>;
  return children;
}
export function AssignmentList({rows=[],onServiceChange}) {
  if(!rows.length)return <p className="text-sm text-muted-foreground">Aucune affectation dans cette période.</p>;
  return <ul className="divide-y divide-border">{rows.map(a=><li key={a.id} className="py-3 text-sm flex flex-wrap gap-2 justify-between"><div className="min-w-0 break-words"><p className="font-medium">{a.full_name || (a.user_id ? 'Membre affecté' : a.status==='unconfigured' ? 'Équipe non renseignée' : 'Poste non couvert')} · {a.position}</p><p className="text-muted-foreground">{a.event_title} · {a.date} · {a.department_name}</p></div><div className="text-muted-foreground"><p>{a.start_time || '?'} – {a.end_time || '?'}</p><p>{({assigned:'À confirmer',confirmed:'Confirmé',declined:'Indisponible',replaced:'Remplacé',unfilled:'Non couvert',unconfigured:'À renseigner'})[a.status] || a.status}</p><p>Service : {({not_recorded:'non renseigné',completed:'réalisé',not_completed:'non réalisé'})[a.service_status] || a.service_status}</p>{onServiceChange && a.user_id && <label className="block">Service réalisé<select aria-label={`Service de ${a.full_name || 'ce membre'} pour ${a.event_title}`} className="block border border-border rounded-lg p-2 bg-card max-w-full" value={a.service_status} onChange={e=>onServiceChange(a,e.target.value)}><option value="not_recorded">Non renseigné</option><option value="completed">Réalisé</option><option value="not_completed">Non réalisé</option></select></label>}</div></li>)}</ul>;
}
export default function DepartmentAnalytics({departmentId,userId}) {
  const [from,setFrom]=useState('');const [to,setTo]=useState('');const [selected,setSelected]=useState(userId || '');
  useEffect(()=>setSelected(userId || ''),[departmentId,userId]);
  const state=useEJPRead('getDepartmentAnalytics',{department_id:departmentId,from,to,user_id:selected || undefined});
  const {data}=state;
  const [serviceError,setServiceError]=useState('');
  const recordService=async(row,status)=>{setServiceError('');try{await base44.functions.invoke('recordDepartmentService',{department_id:departmentId,source:row.source,assignment_id:row.source==='ModerationServicePlan' ? row.plan_id : row.source_id,position:row.position,status});state.refresh();}catch(e){setServiceError(e.message);}};
  return <section className="space-y-5" aria-label="Suivi de l’équipe">
    <div className="flex flex-wrap items-end gap-3"><label className="text-sm">Du<Input type="date" value={from} onChange={e=>setFrom(e.target.value)} /></label><label className="text-sm">Au<Input type="date" min={from || undefined} value={to} onChange={e=>setTo(e.target.value)} /></label><Button variant="outline" onClick={state.refresh}>Actualiser</Button>{selected && !userId && <Button variant="outline" onClick={()=>setSelected('')}>Toute l’équipe</Button>}</div>
    <ReadState state={state}>{data && <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[['Membres actifs',data.summary.active_members],['Présence renseignée',data.summary.rate===null ? '—' : `${data.summary.rate} %`],['Participations',data.summary.present],['Données manquantes',data.summary.missing]].map(([label,value])=><div key={label} className="bg-card border border-border rounded-xl p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="text-2xl font-semibold mt-1">{value}</p></div>)}</div>
      <p className="text-xs text-muted-foreground">{data.denominator} {data.summary.recorded} renseignée(s) pour {data.summary.expected} attendue(s). Les présences proviennent des déclarations enregistrées.</p>
      {data.trend.length>0 && <Suspense fallback={<p role="status" className="h-64">Chargement du graphique…</p>}><AttendanceTrend data={data.trend}/></Suspense>}
      <div className="bg-card border border-border rounded-xl p-4"><h3 className="font-semibold mb-3">Équipe et présences</h3>{!data.members.length && <p>Aucun membre actif dans ce périmètre.</p>}<ul className="divide-y divide-border">{data.members.map(m=><li key={m.id} className="py-3 flex flex-wrap justify-between gap-2"><div><Button variant="link" className="p-0 h-auto" onClick={()=>setSelected(m.id)}>{m.full_name || 'Membre'}</Button><p className="text-xs text-muted-foreground">{m.memberships.map(x=>[x.role_in_dept,x.note].filter(Boolean).join(' · ')).join(', ')}</p></div><p className="text-sm">{m.present} présence(s) · {m.absent} absence(s) · {m.excused} justifiée(s) · {m.missing} non renseignée(s)</p></li>)}</ul></div>
      {selected && <div className="bg-card border border-border rounded-xl p-4"><h3 className="font-semibold mb-3">Historique de présence attendu</h3><ul className="space-y-2 text-sm">{data.attendance.map(r=><li key={r.event_id+':'+r.user_id}>{r.date} · {r.event_title} : {PRESENCE_LABELS[r.status] || 'En attente de renseignement'}</li>)}</ul></div>}
      {selected && <div className="bg-card border border-border rounded-xl p-4"><h3 className="font-semibold mb-3">Disponibilités enregistrées</h3>{data.availability?.length ? <ul className="text-sm space-y-2">{data.availability.map((a,i)=><li key={i}>{a.date} · {({available:'Disponible',unavailable:'Indisponible',maybe:'À confirmer',tentative:'À confirmer'})[a.status] || 'À préciser'}</li>)}</ul> : <p className="text-sm text-muted-foreground">Aucune disponibilité renseignée dans cette période.</p>}</div>}
      {!selected && <details className="border border-border bg-card rounded-xl p-4"><summary className="cursor-pointer font-medium">Mouvements de l’équipe</summary><ul className="mt-3 text-sm space-y-2">{data.recent_members?.map((m,i)=><li key={i}>{data.members.find(p=>p.id===m.user_id)?.full_name || 'Ancien membre'} · Entrée : {m.joined_at || 'non renseignée'} · Fin : {m.ended_at || 'en cours'}</li>)}</ul>{!data.recent_members?.length && <p className="mt-3 text-sm text-muted-foreground">Aucun mouvement daté dans cette période.</p>}</details>}
      <div className="bg-card border border-border rounded-xl p-4"><h3 className="font-semibold mb-3">Affectations et service</h3><AssignmentList rows={data.assignments} onServiceChange={data.can_record_service ? recordService : undefined}/>{serviceError && <p role="alert">{serviceError}</p>}</div>
      <p className="text-sm text-muted-foreground">{data.pending_confirmations} confirmation(s) attendue(s) · {data.unfilled} poste(s) non couvert(s) · {data.conflicts.length} conflit(s) interne(s) · {data.missing_times.length} horaire(s) incomplet(s).</p>
      {!!data.unlinked_plans.length && <p role="status" className="text-sm text-muted-foreground">{data.unlinked_plans.length} planning(s) sans programme relié, exclus du calcul des présences.</p>}
    </>}</ReadState>
  </section>;
}
