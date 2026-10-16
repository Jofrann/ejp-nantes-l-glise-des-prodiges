import test from 'node:test';
import assert from 'node:assert/strict';
import { projectAssignments, assignmentConflicts, interval } from './event-assignments.mjs';
import { validateEventWrite } from './event-integrity.mjs';
const fixture=data=>new Proxy({}, {get:(_,key)=>({list:async()=>data[key] || [],filter:async(q={})=>(data[key] || []).filter(r=>Object.entries(q).every(([k,v])=>r[k]===v)),get:async id=>{const row=(data[key] || []).find(r=>r.id===id);if(!row)throw Error('Introuvable');return row;}})});
test('lot 02: existing sources, no attendance inference, unfilled posts, missing links and actual overlaps',async()=>{
  const data={Event:[{id:'e',title:'Culte',event_date:'2026-10-18',event_time:'09:00',end_time:'11:00',is_active:true}],Department:[{id:'a',name:'Musique'},{id:'b',name:'Sonorisation'}],
    MusicServicePlan:[{id:'m',department_id:'a',event_id:'e',date:'2026-10-18',start_time:'09:00',end_time:'10:00'},{id:'legacy',department_id:'a',date:'2026-10-18'}],
    MusicAssignment:[{id:'ma',service_plan_id:'m',department_id:'a',user_id:'u',status:'confirmed',position:'clavier'}],
    SoundServicePlan:[{id:'s',department_id:'b',event_id:'e',date:'2026-10-18',call_time:'09:30',end_time:'11:00'},{id:'empty',department_id:'b',event_id:'e',date:'2026-10-18'}],
    SoundAssignment:[{id:'sa',service_plan_id:'s',department_id:'b',user_id:'u',status:'assigned'}]};
  const before=JSON.stringify(data);const result=await projectAssignments(fixture(data));
  assert.equal(result.assignments.length,3);assert.equal(result.conflicts.length,1);assert.equal(result.unfilled,0);assert.equal(result.incomplete_plans,1);assert.equal(result.pending_confirmations,1);
  assert.equal(result.unlinked_plans[0].id,'legacy');assert.equal(result.assignments[0].service_status,'not_recorded');
  assert.equal(JSON.stringify(data),before);
  assert.equal((await projectAssignments(fixture(data),{departmentId:'a'})).assignments.length,1);
  assert.equal((await projectAssignments(fixture(data),{from:'2027-01-01'})).assignments.length,0);
  assert.equal(interval({}, {date:'2026-10-18',start_time:'09:00'},{}),null);
  const adjacent=[{id:'1',user_id:'u',interval:{start:0,end:10}},{id:'2',user_id:'u',interval:{start:10,end:20}}];assert.equal(assignmentConflicts(adjacent).length,0);
  assert.equal(assignmentConflicts([...adjacent,{id:'3',user_id:'u',status:'declined',interval:{start:5,end:15}}]).length,0);
  assert.equal(interval({}, {date:'2026-10-18',start_time:'23:30',end_time:'00:30'},{}).end-interval({}, {date:'2026-10-18',start_time:'23:30',end_time:'00:30'},{}).start,3600000);
});
test('lot 02: reject mismatched event dates, foreign planning and inactive or nonmember assignees',async()=>{
  const entities=fixture({Event:[{id:'e',event_date:'2026-10-18'}],SoundServicePlan:[{id:'p',department_id:'b'}],Department:[{id:'b',is_active:true}],User:[{id:'u',account_status:'active'}]});
  await assert.rejects(validateEventWrite(entities,'MusicServicePlan',null,{event_id:'e',date:'2026-10-19'}),/date/);
  await assert.rejects(validateEventWrite(entities,'SoundAssignment',null,{service_plan_id:'p',department_id:'a',user_id:'u'}),/différents/);
  await assert.rejects(validateEventWrite(entities,'SoundAssignment',null,{service_plan_id:'p',department_id:'b',user_id:'u'}),/membre actif/);
  await assert.rejects(validateEventWrite(entities,'SoundServicePlan',{department_id:'a'},{department_id:'b'}),/historique/);
});
