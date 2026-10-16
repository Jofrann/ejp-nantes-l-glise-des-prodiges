import { activeMembership } from '../src/lib/ejpAccess.js';
import { projectAssignments } from './event-assignments.mjs';
const recorded=new Set(['present','late','absent','excused','absent_justified']);
const personId=row=>row.user_id || row.created_by_id;
export async function departmentAnalytics(entities,departmentId,{from,to,userId,today=new Intl.DateTimeFormat('fr-CA',{timeZone:'Europe/Paris'}).format(new Date())}={}) {
  const memberships=await entities.DepartmentMember.filter({department_id:departmentId},null,100000);
  const active=memberships.filter(activeMembership);
  const userIds=[...new Set(active.map(m=>m.user_id).filter(Boolean))];
  if(userId && !userIds.includes(userId))throw Object.assign(new Error('Personne hors du département'),{status:403});
  const people=userIds.length ? await entities.User.filter({id:{$in:userIds}},null,100000) : [];
  const projection=await projectAssignments(entities,{departmentId,from,to});
  const expected=projection.assignments.filter(a=>a.user_id && userIds.includes(a.user_id) && !['declined','replaced','cancelled'].includes(a.status) && (!userId || a.user_id===userId));
  // Denominator is one expected person per event, never one per position.
  const unique=[...new Map(expected.map(a=>[`${a.event_id}:${a.user_id}`,a])).values()];
  const eventIds=[...new Set(unique.map(a=>a.event_id))];
  const responses=eventIds.length ? await entities.AttendanceResponse.filter({event_id:{$in:eventIds}},'-updated_date',100000) : [];
  const responseMap=new Map();
  for(const response of responses){const key=`${response.event_id}:${personId(response)}`;if(!responseMap.has(key))responseMap.set(key,response);}
  const attendance=unique.map(a=>({event_id:a.event_id,event_title:a.event_title,date:a.date,user_id:a.user_id,status:responseMap.get(`${a.event_id}:${a.user_id}`)?.status || 'not_recorded'}));
  const stats=rows=>{
    const elapsed=rows.filter(r=>r.date<today);
    const known=elapsed.filter(r=>recorded.has(r.status));
    const present=known.filter(r=>['present','late'].includes(r.status)).length;
    return {expected:elapsed.length,recorded:known.length,present,absent:known.filter(r=>r.status==='absent').length,excused:known.filter(r=>['excused','absent_justified'].includes(r.status)).length,missing:elapsed.filter(r=>!recorded.has(r.status)).length,rate:known.length ? Math.round(present/known.length*1000)/10 : null};
  };
  const members=people.filter(p=>!userId || p.id===userId).map(p=>({id:p.id,first_name:p.first_name,last_name:p.last_name,full_name:p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim(),photo_url:p.photo_url,
    memberships:active.filter(m=>m.user_id===p.id).map(m=>({id:m.id,role_in_dept:m.role_in_dept,joined_at:m.joined_at,note:m.note})),...stats(attendance.filter(a=>a.user_id===p.id))}));
  const availability=[];
  for(const source of ['MusicAvailability','SoundAvailability','PrayerAvailability'])for(const row of await entities[source].filter({department_id:departmentId},null,100000)) {
    if(userIds.includes(row.user_id) && (!userId || row.user_id===userId) && (!from || row.date>=from) && (!to || row.date<=to))availability.push({user_id:row.user_id,date:row.date,status:row.status});
  }
  return {department_id:departmentId,members,summary:{active_members:userIds.length,...stats(attendance)},
    denominator:'Membres actuellement actifs attendus sur une affectation non déclinée, une fois par événement des jours précédents ; taux = présents ou retards / présences renseignées. Les données manquantes sont exclues du taux.',
    attendance,trend:eventIds.map(id=>{const rows=attendance.filter(a=>a.event_id===id);return {event_id:id,event_title:rows[0].event_title,date:rows[0].date,...stats(rows)};}).sort((a,b)=>a.date.localeCompare(b.date)),
    recent_members:memberships.filter(m=>m.joined_at && (!from || m.joined_at>=from) && (!to || m.joined_at<=to)).map(m=>({user_id:m.user_id,joined_at:m.joined_at,ended_at:m.ended_at || null,status:m.status})),
    ...projection,availability,assignments:projection.assignments.filter(a=>!userId || a.user_id===userId).sort((a,b)=>a.date.localeCompare(b.date))};
}
