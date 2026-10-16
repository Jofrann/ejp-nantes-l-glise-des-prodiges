import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { applyStructures, planStructures } from './structures.mjs';
import { isActiveDepartment } from '../src/lib/departmentState.js';

test('migrated ministries without status can accept existing accounts, while archives and non-admin writes stay blocked', async () => {
  assert.equal(isActiveDepartment({is_active:true}),true);
  assert.equal(isActiveDepartment({is_active:true,status:'archived'}),false);
  assert.equal(isActiveDepartment({is_active:false,status:'active'}),false);
  const dir=await mkdtemp(join(tmpdir(),'ejp-membership-regression-'));
  const db=new DatabaseSync(join(dir,'ejp.sqlite'));
  db.exec('CREATE TABLE records(entity TEXT,id TEXT,data TEXT,PRIMARY KEY(entity,id))');
  applyStructures(db,planStructures([]));
  db.close();
  const port=58000+Math.floor(Math.random()*1000);
  const child=spawn(process.execPath,['server/index.mjs'],{env:{...process.env,EJP_DATA_DIR:dir,EJP_API_PORT:String(port)},stdio:['ignore','pipe','pipe']});
  let cookie='';
  const call=async(path,data,status=200)=>{
    const r=await fetch(`http://127.0.0.1:${port}/api/local/${path}`,{method:'POST',headers:{'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify(data)});
    const value=await r.json();assert.equal(r.status,status,JSON.stringify(value));
    if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return value;
  };
  const op=(name,data,status)=>call('functions/'+name,data,status);
  const entity=(name,method,...args)=>call('entities/'+name,{method,args});
  try {
    await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw Error('Server failed');})]);
    await call('setup',{email:'regression@ejp.local',password:'isolated-regression-admin-123'});
    const adminCookie=cookie;
    const person=await op('adminManageUser',{action:'create',first_name:'Existant',last_name:'Recette'});
    const before=await op('annuaireSearch',{action:'getPerson',user_id:person.user_id});
    assert.equal(before.active_departments.length,10);
    const ministry=before.active_departments.find(d=>d.slug==='accueil');
    await op('adminManageUser',{action:'add_membership',user_id:person.user_id,department_id:ministry.id,role_in_dept:'serviteur'});
    const after=await op('annuaireSearch',{action:'getPerson',user_id:person.user_id});
    assert.equal(after.memberships.length,1);
    assert.equal(after.memberships[0].department_id,ministry.id);
    await op('adminManageUser',{action:'add_membership',user_id:person.user_id,department_id:ministry.id},409);
    await op('adminManageUser',{action:'remove_membership',membership_id:after.memberships[0].membership_id});
    const history=await op('annuaireSearch',{action:'getPerson',user_id:person.user_id});
    assert.equal(history.memberships[0].status,'archived');
    assert.equal(history.memberships[0].membership_id,after.memberships[0].membership_id);
    const archived=await entity('Department','update',ministry.id,{status:'archived'});
    assert.equal(archived.is_active,false);
    assert.equal((await op('annuaireSearch',{action:'getPerson',user_id:person.user_id})).active_departments.length,9);
    await call('auth/login',{email:person.internal_identifier,password:person.temporary_password});
    await call('auth/changePassword',{currentPassword:person.temporary_password,newPassword:'isolated-regression-member-123'});
    await op('adminManageUser',{action:'add_membership',user_id:person.user_id,department_id:before.active_departments[0].id},403);
    cookie=adminCookie;
    assert.equal((await entity('Department','list')).length,10);
  } finally {child.kill();await once(child,'exit');await rm(dir,{recursive:true,force:true,maxRetries:5,retryDelay:100});}
});
