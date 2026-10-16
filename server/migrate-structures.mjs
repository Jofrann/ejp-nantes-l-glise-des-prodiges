import { DatabaseSync, backup } from 'node:sqlite';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { planStructures, applyStructures } from './structures.mjs';

const path = resolve(process.env.EJP_DATA_DIR || '.local-data', 'ejp.sqlite');
if (!existsSync(path)) throw new Error('Base absente : préciser EJP_DATA_DIR. Aucune base vide créée.');
const db = new DatabaseSync(path);
try {
  const departments = db.prepare("SELECT data FROM records WHERE entity='Department'").all().map(r => JSON.parse(r.data));
  const changes = planStructures(departments);
  console.log(JSON.stringify({ mode: process.argv.includes('--apply') ? 'apply' : 'simulation', changes }, null, 2));
  if (process.argv.includes('--apply') && changes.length) {
    const destination = `${path}.before-structures-01-${Date.now()}.sqlite`;
    await backup(db, destination);
    applyStructures(db, changes);
    console.log(`Sauvegarde : ${destination}`);
  }
} finally { db.close(); }
