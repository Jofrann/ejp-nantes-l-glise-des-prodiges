import test from 'node:test';
import assert from 'node:assert/strict';
import {canReadSensitiveRow,filterSensitiveRead} from './sensitive-access.mjs';
test('lots 05–07: sensitive legacy routes deny technical admin by default and preserve named assignees',async()=>{
 const data={Department:[{id:'mpi',is_active:true,slug:'mpi'}],DepartmentMember:[{user_id:'ref',department_id:'mpi',status:'active',role_in_dept:'referent'}],PrayerRequestAssignee:[{id:'assignee',user_id:'assigned',prayer_request_id:'private'}],PrayerRequest:[{id:'private',department_id:'mpi',confidentiality:'PRIVATE_ASSIGNEES'}]};
 const audit=[];const entities=new Proxy({}, {get:(_,name)=>({filter:async(q={})=>(data[name] || []).filter(r=>Object.entries(q).every(([k,v])=>r[k]===v)),get:async id=>(data[name] || []).find(r=>r.id===id),create:async row=>audit.push(row)})});
 const admin={id:'admin',role:'admin',account_status:'active'};const ref={id:'ref',account_status:'active'};
 assert.equal(await canReadSensitiveRow(entities,admin,'PrayerRequest',{id:'r',department_id:'mpi',confidentiality:'LEADERS_ONLY'}),false);
 assert.equal(await canReadSensitiveRow(entities,ref,'PrayerRequest',{id:'r',department_id:'mpi',confidentiality:'RESTRICTED_MPI'}),true);
 assert.equal(await canReadSensitiveRow(entities,{id:'assigned',account_status:'active'},'PrayerRequest',data.PrayerRequest[0]),true);
 assert.equal(await canReadSensitiveRow(entities,ref,'PrayerRequest',data.PrayerRequest[0]),false);
 assert.equal(await canReadSensitiveRow(entities,admin,'VisitorContact',{id:'v',department_id:'mpi'}),false);
 await assert.rejects(filterSensitiveRead(entities,admin,'PrayerRequest',data.PrayerRequest[0]),/non autorisé/);
 const leader={id:'leader',account_status:'active',ejp_permissions:{canViewAllEJPData:true,canViewSensitiveEJPData:true}};
 assert.equal((await filterSensitiveRead(entities,leader,'PrayerRequest',data.PrayerRequest[0])).id,'private');assert.equal(audit[0].action,'sensitive_data_read');
});
