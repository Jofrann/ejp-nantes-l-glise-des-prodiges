import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
test('initial administrator is transactional and never overwrites existing credentials', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ejp-bootstrap-'));
  try {
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
      import assert from 'node:assert/strict';
      import {initializeAdmin} from './server/bootstrap-admin.mjs';
      import {db,entities} from './server/store.mjs';
      const hash='a'.repeat(32)+':'+ 'b'.repeat(128);
      assert.equal(await initializeAdmin({identifier:'admin@prodiges',passwordHash:hash}),true);
      assert.equal(await initializeAdmin({identifier:'other@prodige',passwordHash:hash}),false);
      const users=await entities.User.list();
      assert.equal(users.length,1);
      assert.equal(users[0].internal_identifier,'admin@prodiges');
      assert.equal(users[0].role,'admin');
      assert.equal(db.prepare('SELECT hash FROM credentials').get().hash,hash);
      db.close();
    `], {env:{...process.env,EJP_DATA_DIR:dir},encoding:'utf8'});
    assert.equal(result.status,0,result.stderr);
  } finally { await rm(dir,{recursive:true,force:true}); }
});
