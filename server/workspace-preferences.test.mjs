import {freePort} from './test-port.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {once} from 'node:events';import {mkdtemp,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';
test('appearance preferences persist per account and do not replace unrelated workspace fields',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'ejp-appearance-')),port=await freePort();const child=spawn(process.execPath,['server/index.mjs'],{env:{...process.env,EJP_DATA_DIR:dir,EJP_API_PORT:String(port)},stdio:['ignore','pipe','pipe']});let cookie='';
 const call=async(path,body,status=200)=>{const r=await fetch(`http://127.0.0.1:${port}/api/local/${path}`,{method:'POST',headers:{'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify(body)}),data=await r.json();assert.equal(r.status,status,JSON.stringify(data));if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return data;};
 const pref=(method,...args)=>call('entities/UserWorkspacePreference',{method,args,scope:'self'});
 try{await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw Error('API startup failed');})]);await call('setup',{email:'appearance@example.invalid',password:'isolated-appearance-admin-2026'});const admin=cookie;
 const other=await call('functions/adminManageUser',{action:'create',first_name:'Autre',last_name:'Apparence'});
 const saved=await pref('create',{appearance_mode:'dark',reduce_motion:true,accent_color:'green',display_density:'compact',default_agenda_view:'month',personal_verse_text:'Texte conservé',show_right_panel:false});
 await pref('update',saved.id,{appearance_mode:'system'});const rows=await pref('list','-updated_date',1);assert.equal(rows[0].appearance_mode,'system');assert.equal(rows[0].personal_verse_text,'Texte conservé');assert.equal(rows[0].accent_color,'green');assert.equal(rows[0].reduce_motion,true);assert.equal(rows[0].default_agenda_view,'month');assert.equal(rows[0].show_right_panel,false);
 await call('auth/login',{email:other.internal_identifier,password:other.temporary_password});await call('auth/changePassword',{currentPassword:other.temporary_password,newPassword:'isolated-other-appearance-2026'});assert.deepEqual(await pref('list'),[]);await call('entities/UserWorkspacePreference',{method:'update',args:[saved.id,{appearance_mode:'light'}],scope:'self'},403);
 cookie=admin;assert.equal((await pref('list'))[0].appearance_mode,'system');
 }finally{child.kill();await once(child,'exit').catch(()=>{});await rm(dir,{recursive:true,force:true});}
});
