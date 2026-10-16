import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtemp,mkdir,writeFile,readFile,cp,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
test('lot 10 local: restore an offline complete data directory with DB relations and uploaded files',async()=>{
 const root=await mkdtemp(join(tmpdir(),'ejp-restore-'));const source=join(root,'source'),restored=join(root,'restored');
 try {
  await mkdir(join(source,'files'),{recursive:true});const db=new DatabaseSync(join(source,'ejp.sqlite'));
  db.exec('PRAGMA journal_mode=WAL; CREATE TABLE records(entity TEXT,id TEXT,data TEXT,PRIMARY KEY(entity,id)); CREATE TABLE credentials(id TEXT PRIMARY KEY,hash TEXT)');
  const insert=db.prepare('INSERT INTO records VALUES(?,?,?)');
  for(const [entity,row] of [['Department',{id:'d',name:'Accueil'}],['DepartmentMember',{id:'m',department_id:'d',user_id:'u',joined_at:'2026-01-01'}],['Event',{id:'e',title:'Programme'}],['AttendanceResponse',{id:'a',event_id:'e',user_id:'u',status:'present'}]])insert.run(entity,row.id,JSON.stringify(row));
  db.prepare('INSERT INTO credentials VALUES(?,?)').run('u','isolated-test-hash');db.close(); // Procedure requires stopping writes before copying the directory.
  const asset=Buffer.from('isolated private document');await writeFile(join(source,'files','file-id'),asset);
  await cp(source,restored,{recursive:true,errorOnExist:true,force:false});
  const restoredDb=new DatabaseSync(join(restored,'ejp.sqlite'),{readOnly:true});
  assert.equal(restoredDb.prepare('PRAGMA integrity_check').get().integrity_check,'ok');
  assert.equal(restoredDb.prepare('SELECT count(*) n FROM records').get().n,4);
  assert.equal(JSON.parse(restoredDb.prepare("SELECT data FROM records WHERE entity='DepartmentMember'").get().data).department_id,'d');
  assert.equal(restoredDb.prepare('SELECT hash FROM credentials WHERE id=?').get('u').hash,'isolated-test-hash');restoredDb.close();
  assert.deepEqual(await readFile(join(restored,'files','file-id')),asset);
 }finally{await rm(root,{recursive:true,force:true});}
});
