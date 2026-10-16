import test from 'node:test';
import assert from 'node:assert/strict';
import { readLeaderData,sanitizeBusinessData } from './leader-data.mjs';
import { canViewAllEJPData } from '../src/lib/ejpAccess.js';
test('lot 05: explicit grants, sensitive audit, pagination and secret exclusion',async()=>{
 const audit=[];const entities=new Proxy({}, {get:(_,name)=>({list:async()=>[],filter:async()=>Array.from({length:26},(_,i)=>({id:String(i),title:'Dossier',nested:{password:'DO_NOT_EXPOSE',note:'visible'}})),create:async data=>{if(name==='AuditLog')audit.push(data);}})});
 for(const user of [{role:'admin'},{badges:['LEADER','PILOTAGE']},{roles:['bureau']},{ejp_permissions:{canViewAllEJPData:true},account_status:'suspended'}])await assert.rejects(readLeaderData(entities,user,{}),/nominative/);
 const leader={id:'l',account_status:'active',ejp_permissions:{canViewAllEJPData:true}};
 assert.equal(canViewAllEJPData(leader),true);
 const catalog=await readLeaderData(entities,leader,{});assert.equal(catalog.sources.some(s=>s.source==='PrayerRequest'),false);
 await assert.rejects(readLeaderData(entities,leader,{source:'PrayerRequest'}),/sensible/);
 await assert.rejects(readLeaderData(entities,leader,{source:'ChurchConfig'}),/non consultable/);
 const page=await readLeaderData(entities,leader,{source:'MusicServicePlan',limit:9999});assert.equal(page.records.length,25);assert.equal(page.next_offset,25);assert.equal(JSON.stringify(page).includes('DO_NOT_EXPOSE'),false);
 leader.ejp_permissions.canViewSensitiveEJPData=true;
 await readLeaderData(entities,leader,{source:'PrayerRequest'});assert.equal(audit.at(-1).action,'sensitive_data_read');assert.equal(audit.at(-1).entity_ids.length,25);
 assert.deepEqual(sanitizeBusinessData({ok:1,api_key:'secret',nested:{token:'secret',notes:'ok'}}),{ok:1,nested:{notes:'ok'}});
 const failing=new Proxy(entities,{get:(target,key)=>key==='AuditLog' ? {create:async()=>{throw Error('Audit unavailable');}} : target[key]});
 await assert.rejects(readLeaderData(failing,leader,{source:'PrayerRequest'}),/Audit unavailable/);
});
