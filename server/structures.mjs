import { randomUUID } from 'node:crypto';
import { OFFICIAL_STRUCTURES, findOfficialStructure, isRetiredStructure } from '../src/lib/officialStructures.js';

// Pure plan first; no deletes, no reassignment of historical business records.
export function planStructures(departments) {
  const changes = [];
  for (const [index, structure] of OFFICIAL_STRUCTURES.entries()) {
    const matches = departments.filter(d => findOfficialStructure(d)?.slug === structure.slug);
    if (structure.kind) {
      for (const existing of matches.filter(d => d.is_active !== false))
        changes.push({ type: 'archive', id: existing.id, data: { is_active: false, archive_reason: 'official-structures-01: specialized workspace; responsibilities retained' } });
      continue;
    }
    const primary = matches.find(d => d.slug === structure.slug) || matches[0];
    const data = { name: structure.name, slug: structure.slug, display_order: index + 1 };
    if (!primary) changes.push({ type: 'create', data: { ...data, slug: structure.slug, is_active: true } });
    else {
      // Keep IDs and retain former slugs for old inbound links.
      if (primary.slug !== structure.slug) data.legacy_slugs = [...new Set([...(primary.legacy_slugs || []), primary.slug].filter(Boolean))];
      if (primary.name !== data.name || primary.slug !== data.slug || primary.display_order !== data.display_order)
        changes.push({ type: 'update', id: primary.id, data });
      for (const duplicate of matches.filter(d => d.id !== primary.id && d.is_active !== false))
        changes.push({ type: 'archive', id: duplicate.id, data: { is_active: false, successor_department_id: primary.id, archive_reason: 'official-structures-01: duplicate; historical records retained' } });
    }
  }
  for (const department of departments.filter(d => isRetiredStructure(d) && d.is_active !== false))
    changes.push({ type: 'archive', id: department.id, data: { is_active: false, archive_reason: 'official-structures-01: retired; historical records retained' } });
  return changes;
}

export function applyStructures(db, changes) {
  const read = db.prepare("SELECT data FROM records WHERE entity='Department' AND id=?");
  const write = db.prepare('INSERT OR REPLACE INTO records(entity,id,data) VALUES(?,?,?)');
  const now = new Date().toISOString();
  db.exec('BEGIN IMMEDIATE');
  try {
    for (const change of changes) {
      const before = change.id ? JSON.parse(read.get(change.id).data) : null;
      const row = { ...before, ...change.data, id: change.id || randomUUID(), created_date: before?.created_date || now, updated_date: now };
      write.run('Department', row.id, JSON.stringify(row));
      const audit = { id: randomUUID(), action: 'official_structures_01', entity_type: 'Department', entity_id: row.id, before, after: row, created_date: now };
      write.run('AuditLog', audit.id, JSON.stringify(audit));
    }
    db.exec('COMMIT');
  } catch (error) { db.exec('ROLLBACK'); throw error; }
}
