import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { isRetiredStructure, findOfficialStructure } from '../src/lib/officialStructures.js';
import { validateEventWrite } from './event-integrity.mjs';
import { isActiveDepartment } from '../src/lib/departmentState.js';
const dir = resolve(process.env.EJP_DATA_DIR || ".local-data");
mkdirSync(dir, { recursive: true });
export const db = new DatabaseSync(resolve(dir, "ejp.sqlite"));
db.exec(
  `PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS records(entity TEXT, id TEXT, data TEXT, PRIMARY KEY(entity,id)); CREATE TABLE IF NOT EXISTS credentials(id TEXT PRIMARY KEY, hash TEXT); CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id TEXT, expires INTEGER);`,
);
const schemas = new Map();
const defaults = entity => {
  if (!schemas.has(entity)) {
    try { schemas.set(entity,JSON.parse(readFileSync(new URL('../base44/entities/' + entity + '.jsonc',import.meta.url),'utf8')).properties || {}); }
    catch { schemas.set(entity,{}); }
  }
  return Object.fromEntries(Object.entries(schemas.get(entity)).filter(([,spec])=>Object.hasOwn(spec,'default')).map(([key,spec])=>[key,structuredClone(spec.default)]));
};
export const entities = new Proxy(
  {},
  {
    get(_, entity) {
      if (!/^[A-Za-z][A-Za-z0-9]*$/.test(entity))
        throw new Error("Entité invalide");
      const list = async (sort, limit = 1000, skip = 0) => {
        if (sort && typeof sort === "object") {
          limit = sort.limit ?? limit;
          skip = sort.skip ?? skip;
          sort = sort.sort;
        }
        let rows = db
          .prepare("SELECT data FROM records WHERE entity=?")
          .all(entity)
          .map((r) => JSON.parse(r.data));
        if (sort) {
          const key = sort.replace(/^-/, "");
          rows.sort(
            (a, b) =>
              String(a[key] ?? "").localeCompare(String(b[key] ?? "")) *
              (sort.startsWith("-") ? -1 : 1),
          );
        }
        return rows.slice(skip, skip + Number(limit));
      };
      const filter = async (query = {}, sort, limit = 1000, skip = 0) => {
        if (sort && typeof sort === "object") {
          limit = sort.limit ?? limit;
          skip = sort.skip ?? skip;
          sort = sort.sort;
        }
        const rows = await list(sort, 100000);
        return rows
          .filter((row) =>
            Object.entries(query).every(([k, v]) => {
              if (v && typeof v === "object" && !Array.isArray(v))
                return Object.entries(v).every(([op, val]) =>
                  op === "$in"
                    ? val.includes(row[k])
                    : op === "$ne"
                      ? row[k] !== val
                      : op === "$eq"
                        ? row[k] === val
                        : op === "$gte"
                          ? row[k] >= val
                          : op === "$lte"
                            ? row[k] <= val
                            : false,
                );
              return Array.isArray(row[k]) ? row[k].includes(v) : row[k] === v;
            }),
          )
          .slice(
            skip,
            skip +
              Number(typeof limit === "object" ? (limit.limit ?? 1000) : limit),
          );
      };
      const get = async (id) => {
        const row = db
          .prepare("SELECT data FROM records WHERE entity=? AND id=?")
          .get(entity, id);
        if (!row)
          throw Object.assign(new Error("Introuvable"), { status: 404 });
        return JSON.parse(row.data);
      };
      const create = async (data) => {
        await validateWrite(entity, null, data);
        const now = new Date().toISOString();
        const row = {
          ...defaults(entity),
          ...data,
          ...(entity === "FIJ" && data.is_active === undefined ? { is_active: data.status !== "closed" } : {}),
          id: randomUUID(),
          created_date: now,
          updated_date: now,
        };
        db.prepare("INSERT INTO records VALUES(?,?,?)").run(
          entity,
          row.id,
          JSON.stringify(row),
        );
        return row;
      };
      const update = async (id, data) => {
        await validateWrite(entity, await get(id), data);
        const row = {
          ...(await get(id)),
          ...data,
          id,
          updated_date: new Date().toISOString(),
        };
        db.prepare("UPDATE records SET data=? WHERE entity=? AND id=?").run(
          JSON.stringify(row),
          entity,
          id,
        );
        return row;
      };
      const remove = async (id) => {
        if (entity === 'Department' || entity === 'DepartmentMember')
          throw Object.assign(new Error('Archiver cette structure ou appartenance pour conserver son historique'), { status: 400 });
        await get(id);
        db.prepare("DELETE FROM records WHERE entity=? AND id=?").run(
          entity,
          id,
        );
        return { id };
      };
      return {
        list,
        filter,
        get,
        create,
        update,
        delete: remove,
        bulkCreate: async (rows) => Promise.all(rows.map(create)),
        deleteMany: async (query) => {
          for (const r of await filter(query)) await remove(r.id);
          return { success: true };
        },
      };
    },
  },
);
// Used by both HTTP entity operations and the service-role compatibility SDK.
async function validateWrite(entity, old, input) {
  await validateEventWrite(entities, entity, old, input);
  if (entity === 'Department') {
    if (Object.hasOwn(input, 'status')) input.is_active = input.status === 'active';
    else if (Object.hasOwn(input, 'is_active')) input.status = input.is_active ? 'active' : 'inactive';
  }
  const row = { ...old, ...input };
  const reject = (message, status = 400) => { throw Object.assign(new Error(message), { status }); };
  if(entity==='AttendanceResponse' && row.status && !['present','late','absent','excused','absent_justified','pending','no_response'].includes(row.status))reject('Statut de présence invalide');
  if (entity === 'Department' && row.is_active !== false) {
    if (isRetiredStructure(row)) reject('Cette structure est retirée de l’organisation active');
    const official = findOfficialStructure(row);
    if (official?.kind) reject('Utiliser l’espace spécialisé et ses responsabilités');
    if (official && (await entities.Department.list(null, 100000)).some(d => d.id !== old?.id && d.is_active !== false && findOfficialStructure(d)?.slug === official.slug))
      reject('Cette structure officielle existe déjà', 409);
    if (official) input.name = official.name;
  }
  if (entity === 'DepartmentMember') {
    if (old && (row.department_id !== old.department_id || row.user_id !== old.user_id)) reject('Archiver puis créer une nouvelle appartenance pour conserver l’historique');
    if (!['serviteur','membre','referent','responsable','coordinateur','adjoint','pilote'].includes(row.role_in_dept || 'serviteur')) reject('Rôle départemental invalide');
    // A consistent status is required even for legacy callers updating only is_active.
    if (Object.hasOwn(input, 'status')) input.is_active = input.status === 'active';
    else if (Object.hasOwn(input, 'is_active')) input.status = input.is_active ? 'active' : 'inactive';
    const active = (input.status ?? row.status) ? (input.status ?? row.status) === 'active' : row.is_active !== false;
    if (old && Object.hasOwn(input, 'is_active')) input.ended_at = active ? null : (old.ended_at || new Date().toISOString().slice(0, 10));
    if (!active) return;
    const department = await entities.Department.get(row.department_id);
    if (!isActiveDepartment(department) || isRetiredStructure(department)) reject('Ministère inactif : nouvelle affectation interdite');
    if (findOfficialStructure(department)?.kind) reject('Utiliser les responsabilités de l’espace spécialisé');
    const person = await entities.User.get(row.user_id);
    if (person.account_status !== 'active') reject('Compte inactif');
    if ((await entities.DepartmentMember.filter({ department_id: row.department_id, user_id: row.user_id })).some(m => m.id !== old?.id && (m.status ? m.status === 'active' : m.is_active !== false)))
      reject('Cette affectation existe déjà', 409);
    if (!old) input.joined_at ||= new Date().toISOString().slice(0, 10);
  }
}
if (!(await entities.ChurchConfig.list()).length)
  await entities.ChurchConfig.create({
    church_name: "EJP Nantes",
    auth_email_domain: "ejp.local",
  });
