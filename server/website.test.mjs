import {freePort} from './test-port.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';

test('npm start serves the site, SPA routes and API without exposing server files', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ejp-web-'));
  const port = await freePort();
  const child = spawn(process.execPath, ['server/web.mjs'], { env: { ...process.env, NODE_ENV: 'production', EJP_SETUP_TOKEN: 'test-only-setup-token', EJP_DATA_DIR: dir, PORT: String(port), EJP_HOST: '127.0.0.1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    await Promise.race([once(child.stdout, 'data'), once(child, 'exit').then(() => { throw new Error('Website did not start'); })]);
    const base = `http://127.0.0.1:${port}`;
    for (const path of ['/', '/login', '/app/annuaire']) {
      const response = await fetch(base + path);
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /text\/html/);
      assert.match(await response.text(), /EJP Nantes/);
    }
    const status = await fetch(base + '/api/local/status');
    assert.equal((await status.json()).setupRequired, true);
    for (const path of ['/server/index.mjs', '/.local-data/ejp.sqlite', '/package.json', '/assets/missing.js']) {
      assert.equal((await fetch(base + path)).status, 404);
    }
    assert.equal((await fetch(base + '/api/local/unknown')).status, 404);
    for (const origin of [`https://127.0.0.1:${port}`, base]) {
      const publicRead = await fetch(base + '/api/local/entities/ChurchConfig', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify({ method: 'list', args: [] }) });
      assert.equal(publicRead.status, 200);
    }
    const foreignRead = await fetch(base + '/api/local/entities/ChurchConfig', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://foreign.example' }, body: JSON.stringify({ method: 'list', args: [] }) });
    assert.equal(foreignRead.status, 403);
    const denied = await fetch(base + '/api/local/setup', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://foreign.example' }, body: '{}' });
    assert.equal(denied.status, 403);
    const unprotected = await fetch(base + '/api/local/setup', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base }, body: JSON.stringify({ email: 'intruder@ejp.local', password: 'test-web-password-123' }) });
    assert.equal(unprotected.status, 403);
    const allowed = await fetch(base + '/api/local/setup', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base }, body: JSON.stringify({ email: 'web@ejp.local', password: 'test-web-password-123', setupToken: 'test-only-setup-token' }) });
    assert.equal(allowed.status, 200);
    assert.match(allowed.headers.get('set-cookie'), /HttpOnly/);
  } finally {
    if (child.exitCode === null) { const done = once(child, 'exit'); child.kill(); await done; }
    await rm(dir, { recursive: true, force: true });
  }
});
