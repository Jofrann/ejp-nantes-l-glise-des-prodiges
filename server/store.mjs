import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
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
if (!(await entities.ChurchConfig.list()).length)
  await entities.ChurchConfig.create({
    church_name: "EJP Nantes",
    auth_email_domain: "ejp.local",
  });
