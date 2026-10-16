import test from 'node:test';
import assert from 'node:assert/strict';
import { departmentAnalytics } from './department-analytics.mjs';
test('lot 03: explicit denominator, deduplication, no response is not absence, individual department isolation',async()=>{
 const data={Department:[{id:'d'}],User:[{id:'u',full_name:'Alice'},{id:'v',full_name:'Benoit'}],DepartmentMember:[{user_id:'u',department_id:'d',status:'active'},{user_id:'v',department_id:'d',status:'active'}],Event:[{id:'a',event_date:'2026-10-01',is_active:true},{id:'b',event_date:'2026-10-02',is_active:true},{id:'other',event_date:'2026-10-03',is_active:true}],MusicServicePlan:[{id:'p',department_id:'d',event_id:'a',date:'2026-10-01'},{id:'q',department_id:'d',event_id:'b',date:'2026-10-02'}],MusicAssignment:[{id:'1',service_plan_id:'p',user_id:'u'},{id:'2',service_plan_id:'p',user_id:'u'},{id:'3',service_plan_id:'q',user_id:'u'},{id:'4',service_plan_id:'q',user_id:'v',status:'declined'}],AttendanceResponse:[{id:'r',event_id:'a',user_id:'u',status:'present'},{id:'r2',event_id:'a',user_id:'u',status:'present'}]};
 const match=(r,q)=>Object.entries(q).every(([k,v])=>v?.$in ? v.$in.includes(r[k]) : r[k]===v);
 const entities=new Proxy({}, {get:(_,name)=>({list:async()=>data[name] || [],filter:async(q={})=>(data[name] || []).filter(r=>match(r,q))})});
 const result=await departmentAnalytics(entities,'d',{today:'2026-10-16'});
 assert.equal(result.summary.expected,2);assert.equal(result.summary.recorded,1);assert.equal(result.summary.present,1);assert.equal(result.summary.missing,1);assert.equal(result.summary.absent,0);assert.equal(result.summary.rate,100);
 assert.equal(result.members.find(m=>m.id==='v').rate,null);
 assert.equal(result.attendance.length,2);assert.equal(result.members.some(m=>'phone' in m),false);
 await assert.rejects(departmentAnalytics(entities,'d',{userId:'outside'}),/hors/);
});
