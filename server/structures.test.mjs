import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { OFFICIAL_STRUCTURES } from '../src/lib/officialStructures.js';
import { planStructures, applyStructures } from './structures.mjs';
import { getDepartmentRoute } from '../src/lib/departmentRouting.js';
import { getEnabledModules } from '../src/lib/departmentModules.js';

test('official migration retains IDs, all history and references, archives duplicates and is idempotent', () => {
  const db = new DatabaseSync(':memory:');
  db.exec('CREATE TABLE records(entity TEXT,id TEXT,data TEXT,PRIMARY KEY(entity,id))');
  const departments = [
    { id:'music',slug:'prodiges-musique',name:'Prodiges Musique',is_active:true },
    { id:'old-music',slug:'louange-adoration',name:'Louange & Adoration',is_active:true },
    { id:'welcome',slug:'accueil-et-integration',name:'Accueil & Intégration',is_active:true },
    { id:'retired',slug:'intendance',name:'Intendance & Logistique',is_active:true },
    { id:'pastoral',slug:'accompagnement-pastoral',is_active:true },
    { id:'pilot',slug:'pilote-fij',is_active:true },
  ];
  const write = db.prepare('INSERT INTO records VALUES(?,?,?)');
  for(const d of departments) write.run('Department',d.id,JSON.stringify(d));
  const membership={id:'history',department_id:'old-music',user_id:'person',status:'active',note:'Guitariste',joined_at:'2020-01-01'};
  write.run('DepartmentMember',membership.id,JSON.stringify(membership));
  write.run('MusicAssignment','assignment',JSON.stringify({id:'assignment',department_id:'old-music',user_id:'person'}));
  const changes=planStructures(departments);
  applyStructures(db,changes);
  const read=(entity,id)=>JSON.parse(db.prepare('SELECT data FROM records WHERE entity=? AND id=?').get(entity,id).data);
  const all=()=>db.prepare("SELECT data FROM records WHERE entity='Department'").all().map(r=>JSON.parse(r.data));
  assert.equal(OFFICIAL_STRUCTURES.length,12);
  assert.equal(all().filter(d=>d.is_active).length,10);
  assert.equal(read('Department','welcome').name,'Accueil');
  assert.equal(read('Department','welcome').slug,'accueil');
  assert.deepEqual(read('Department','welcome').legacy_slugs,['accueil-et-integration']);
  assert.equal(read('Department','retired').is_active,false);
  assert.equal(read('Department','old-music').successor_department_id,'music');
  assert.deepEqual(read('DepartmentMember','history'),membership);
  assert.equal(read('MusicAssignment','assignment').department_id,'old-music');
  assert.equal(db.prepare("SELECT count(*) n FROM records WHERE entity='AuditLog'").get().n,changes.length);
  assert.deepEqual(planStructures(all()),[]);
  assert.equal(getDepartmentRoute({slug:'coordination-fij'}),'/app/responsabilites/fij-coordination');
  assert.equal(getDepartmentRoute({slug:'fij'}),'/app/departements/fij');
  assert.ok(getEnabledModules('sonorisation').includes('sound_planning'));
  assert.deepEqual(getEnabledModules('intendance'),[]);
  db.close();
});

test('backend guards cover service-role writes, inactive departments, duplicates and referent isolation',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'ejp-structures-'));
  process.env.EJP_DATA_DIR=dir;
  const {entities,db}=await import('./store.mjs');
  const {executeEntity}=await import('./access.mjs');
  try {
    const a=await entities.Department.create({name:'Sonorisation',slug:'sono',is_active:true});
    const b=await entities.Department.create({name:'Accueil',slug:'accueil',is_active:true});
    const ref=await entities.User.create({account_status:'active',role:'referent'});
    const member=await entities.User.create({account_status:'active',role:'serviteur'});
    const outsider=await entities.User.create({account_status:'active',role:'serviteur',phone:'confidential'});
    await entities.DepartmentMember.create({department_id:a.id,user_id:ref.id,role_in_dept:'referent'});
    const m=await entities.DepartmentMember.create({department_id:a.id,user_id:member.id});
    await entities.DepartmentMember.create({department_id:b.id,user_id:outsider.id});
    await assert.rejects(entities.DepartmentMember.create({department_id:a.id,user_id:member.id}),/existe déjà/);
    const rows=await executeEntity({entity:'User',method:'list',args:[],user:ref});
    assert.deepEqual(new Set(rows.map(r=>r.id)),new Set([ref.id,member.id]));
    await assert.rejects(executeEntity({entity:'User',method:'get',args:[outsider.id],user:ref}),/non autorisé/);
    await assert.rejects(executeEntity({entity:'DepartmentMember',method:'update',args:[m.id,{role_in_dept:'referent'}],user:member}),/non autorisé/);
    await entities.DepartmentMember.update(m.id,{is_active:false});
    assert.equal((await entities.DepartmentMember.get(m.id)).status,'inactive');
    await entities.Department.update(a.id,{is_active:false});
    await assert.rejects(entities.DepartmentMember.update(m.id,{is_active:true}),/inactif/);
    await assert.rejects(entities.DepartmentMember.create({department_id:a.id,user_id:outsider.id}),/inactif/);
    await assert.rejects(entities.Department.create({name:'Intendance & Logistique',slug:'intendance'}),/retirée/);
    await assert.rejects(entities.Department.create({name:'Pilote FIJ',slug:'pilote-fij'}),/spécialisé/);
    assert.deepEqual((await executeEntity({entity:'User',method:'list',args:[],user:ref})).map(r=>r.id),[ref.id]);
  }finally{db.close();await rm(dir,{recursive:true,force:true});}
});
