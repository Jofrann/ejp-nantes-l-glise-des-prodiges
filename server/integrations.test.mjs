import './hooks.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

test('external adapters: configuration, structured AI output, quotas, mail permissions and idempotent Paris Meet dates',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'ejp-integrations-'));process.env.EJP_DATA_DIR=dir;
 const originalFetch=globalThis.fetch;
 const {integrationStatus,invokeAI,sendEmail,createMeet}=await import('./integrations.mjs');
 const {db,entities}=await import('./store.mjs');
 const admin={id:'admin',role:'admin',roles:['admin'],email:'admin@example.test'};
 const member={id:'member',role:'serviteur',roles:['serviteur']};
 try {
  delete process.env.OPENAI_API_KEY;delete process.env.RESEND_API_KEY;delete process.env.GOOGLE_REFRESH_TOKEN;
  assert.equal(integrationStatus().ai.configured,false);
  await assert.rejects(()=>invokeAI({prompt:'Bonjour'},member),{status:503});
  await assert.rejects(()=>sendEmail({to:'test@example.test',subject:'test',body:'test'},member),{status:403});
  process.env.OPENAI_API_KEY='test-placeholder-not-live';
  let payload;
  globalThis.fetch=async(url,init)=>{assert.equal(url,'https://api.openai.com/v1/responses');payload=JSON.parse(init.body);return Response.json({status:'completed',output:[{content:[{type:'output_text',text:'{"message":"Bonjour"}'}]}]});};
  const schema={type:'object',properties:{message:{type:'string'}},required:['message']};
  assert.deepEqual(await invokeAI({prompt:'Bonjour',response_json_schema:schema},member),{message:'Bonjour'});
  assert.equal(payload.store,false);assert.equal(payload.model,'gpt-5-mini');
  globalThis.fetch=async()=>Response.json({status:'completed',output:[{content:[{type:'output_text',text:'{"message":123}'}]}]});
  await assert.rejects(()=>invokeAI({prompt:'Bonjour',response_json_schema:schema},member),{status:502});
  process.env.EJP_AI_DAILY_LIMIT='2';
  await assert.rejects(()=>invokeAI({prompt:'Troisieme'},member),{status:429});
  delete process.env.EJP_AI_DAILY_LIMIT;
  globalThis.fetch=async()=>new Response('secret provider details',{status:401});
  await assert.rejects(()=>invokeAI({prompt:'test'},admin),e=>e.status===502 && !e.message.includes('secret provider'));
  process.env.RESEND_API_KEY='test-placeholder-not-live';process.env.EJP_EMAIL_FROM='EJP <notifications@example.test>';
  globalThis.fetch=async(url,init)=>{assert.equal(url,'https://api.resend.com/emails');assert.deepEqual(JSON.parse(init.body).to,['test@example.test']);return Response.json({id:'mail-123'});};
  assert.equal((await sendEmail({to:'test@example.test',subject:'Test',body:'Ceci est un test simule'},admin)).status,'accepted');
  await assert.rejects(()=>sendEmail({to:'test@example.test\r\nBcc:other@example.test',subject:'test',body:'test'},admin),{status:400});
  assert.equal((await entities.AuditLog.list())[0].action,'email_accepted');
  const event=await entities.Event.create({title:'Reunion',event_date:'2026-12-20',event_time:'15:00',end_time:'16:00'});
  await assert.rejects(()=>createMeet({event_id:event.id},member),{status:403});
  await assert.rejects(()=>createMeet({event_id:event.id},admin),{status:503});
  process.env.GOOGLE_CLIENT_ID='test-id';process.env.GOOGLE_CLIENT_SECRET='test-placeholder';process.env.GOOGLE_REFRESH_TOKEN='test-placeholder';
  let calendarCalls=0;
  globalThis.fetch=async(url,init)=>{
   if(url==='https://oauth2.googleapis.com/token')return Response.json({access_token:'test-access-token'});
   calendarCalls++;const body=JSON.parse(init.body);
   assert.equal(body.start.dateTime,'2026-12-20T15:00:00');assert.equal(body.start.timeZone,'Europe/Paris');assert.match(body.id,/^[a-f0-9]{64}$/);
   return Response.json({id:body.id,hangoutLink:'https://meet.google.com/test-fixture'});
  };
  const meet=await createMeet({event_id:event.id,title:'untrusted title'},admin);
  assert.equal(meet.meet_url,'https://meet.google.com/test-fixture');
  assert.equal((await createMeet({event_id:event.id},admin)).meet_url,meet.meet_url);assert.equal(calendarCalls,1);
 }finally{globalThis.fetch=originalFetch;db.close();await rm(dir,{recursive:true,force:true});}
});
