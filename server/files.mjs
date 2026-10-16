import { randomUUID } from 'node:crypto';
import { mkdir, writeFile, unlink, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { resolve } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { db, entities } from './store.mjs';
import { executeEntity } from './access.mjs';
import { isAdmin } from '../src/lib/permissions.js';

export const maxUploadBytes = 50 * 1024 * 1024;
const root = resolve(process.env.EJP_DATA_DIR || '.local-data', 'files');
db.exec('CREATE TABLE IF NOT EXISTS uploaded_files(id TEXT PRIMARY KEY, owner_id TEXT, visibility TEXT, name TEXT, mime TEXT, size INTEGER, created_at INTEGER)');
const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
const formats = {
  'image/png': b => b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),
  'image/jpeg': b => b[0] === 255 && b[1] === 216 && b[2] === 255,
  'image/gif': b => /^GIF8[79]a$/.test(b.subarray(0,6).toString()),
  'image/webp': b => b.subarray(0,4).toString() === 'RIFF' && b.subarray(8,12).toString() === 'WEBP',
  'application/pdf': b => b.subarray(0,5).toString() === '%PDF-',
  'video/quicktime': b => ['ftyp','moov','mdat'].includes(b.subarray(4,8).toString()),
  'video/mp4': b => b.subarray(4,8).toString() === 'ftyp',
  'video/webm': b => b.subarray(0,4).equals(Buffer.from([26,69,223,163])),
  'audio/mpeg': b => b.subarray(0,3).toString() === 'ID3' || (b[0] === 255 && (b[1] & 224) === 224),
  'audio/wav': b => b.subarray(0,4).toString() === 'RIFF' && b.subarray(8,12).toString() === 'WAVE',
  'text/plain': b => !b.includes(0),
  'text/csv': b => !b.includes(0),
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': b => b.subarray(0,4).equals(Buffer.from([80,75,3,4])) && b.includes(Buffer.from('word/')),
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': b => b.subarray(0,4).equals(Buffer.from([80,75,3,4])) && b.includes(Buffer.from('xl/')),
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': b => b.subarray(0,4).equals(Buffer.from([80,75,3,4])) && b.includes(Buffer.from('ppt/')),
};

export async function uploadFile(raw, contentType, user) {
  let data;
  try { data = await new Response(raw, { headers: { 'Content-Type': contentType } }).formData(); }
  catch { fail(400, 'Fichier multipart invalide'); }
  const file = data.get('file');
  if (!file || typeof file.arrayBuffer !== 'function' || !file.size) fail(400, 'Choisis un fichier non vide');
  if (file.size > maxUploadBytes) fail(413, 'Le fichier dépasse 50 Mo');
  const visibility = data.get('visibility') || 'private';
  if (!['private','public'].includes(visibility)) fail(400, 'Visibilité invalide');
  if (visibility === 'public' && !isAdmin(user)) fail(403, 'Seul un administrateur peut publier un fichier');
  const bytes = Buffer.from(await file.arrayBuffer());
  const mime = String(file.type || '').toLowerCase();
  if (!formats[mime]?.(bytes)) fail(415, 'Format non autorisé ou contenu incompatible (images, PDF, vidéos, audio, Office, TXT, CSV)');
  if (visibility === 'public' && !/^(image|video|audio)\//.test(mime)) fail(400, 'Seuls les médias peuvent être publics');
  // Leave headroom on the 1 GB persistent disk for the database and backups.
  await mkdir(root, { recursive: true });
  const total = db.prepare('SELECT coalesce(sum(size),0) AS size FROM uploaded_files').get().size;
  const own = db.prepare('SELECT coalesce(sum(size),0) AS size FROM uploaded_files WHERE owner_id=?').get(user.id).size;
  if (total + file.size > 800 * 1024 * 1024 || (!isAdmin(user) && own + file.size > 200 * 1024 * 1024)) fail(507, 'Espace de stockage insuffisant. Contacte l’administration.');
  const id = randomUUID();
  const name = String(file.name).replace(/[\r\n\x00-\x1f/\\]/g, '_').slice(0,180) || 'fichier';
  db.prepare('INSERT INTO uploaded_files VALUES(?,?,?,?,?,?,?)').run(id,user.id,visibility,name,mime,file.size,Date.now());
  try { await writeFile(resolve(root,id), bytes, { flag: 'wx' }); }
  catch (error) { db.prepare('DELETE FROM uploaded_files WHERE id=?').run(id); await unlink(resolve(root,id)).catch(()=>{}); throw error; }
  return { file_url: `/api/local/files/${id}`, file_id: id, name, size: file.size, visibility };
}

async function canReadFile(file, user) {
  if (file.visibility === 'public') return true;
  if (!user || user.account_status !== 'active' || user.first_login) return false;
  if (isAdmin(user) || file.owner_id === user.id) return true;
  // A private attachment inherits access from a readable resource created by its uploader.
  // Only trusted resource types can share files; personal notes cannot grant file access.
  const url = `/api/local/files/${file.id}`;
  const uploader = await entities.User.get(file.owner_id).catch(()=>null);
  for (const entity of ['TrainingProgram','TrainingModule','StarResource','StarProduct','FijDocument','DeptMessage','Post','User']) {
    const rows = await entities[entity].list(null,100000);
    const legacyCatalog = ['TrainingProgram','TrainingModule','StarResource','StarProduct'].includes(entity) && uploader && isAdmin(uploader);
    const linked = rows.filter(row => (row.created_by_id === file.owner_id || (entity === 'User' && row.id === file.owner_id) || (legacyCatalog && !row.created_by_id)) && JSON.stringify(row).includes(url));
    for (const row of linked) {
      try { await executeEntity({ entity, method: 'get', args: [row.id], user }); return true; }
      catch (error) { if (![403,404].includes(error.status)) throw error; }
    }
  }
  return false;
}

export async function serveFile(req, res, id, user) {
  if (!['GET','HEAD'].includes(req.method)) fail(405, 'Méthode non autorisée');
  const file = db.prepare('SELECT * FROM uploaded_files WHERE id=?').get(id);
  if (!file || !(await canReadFile(file,user))) fail(404, 'Fichier introuvable');
  const path = resolve(root,file.id);
  let info;
  try { info = await stat(path); } catch { fail(404, 'Fichier introuvable'); }
  const headers = { 'Content-Type': file.mime, 'X-Content-Type-Options':'nosniff', 'Content-Security-Policy':"sandbox; default-src 'none'", 'Cache-Control':'private, no-store', 'Accept-Ranges':'bytes',
    'Content-Disposition': `${/^(image|video|audio)\//.test(file.mime) ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(file.name)}` };
  let start = 0, end = info.size - 1, status = 200;
  if (req.headers.range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if (!match || (!match[1] && !match[2])) { res.writeHead(416,{'Content-Range':`bytes */${info.size}`}); res.end(); return; }
    start = match[1] ? Number(match[1]) : Math.max(0,info.size-Number(match[2]));
    end = match[1] && match[2] ? Math.min(Number(match[2]),end) : end;
    if (start > end || start >= info.size) { res.writeHead(416,{'Content-Range':`bytes */${info.size}`}); res.end(); return; }
    headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`; status = 206;
  }
  headers['Content-Length'] = String(end-start+1);
  res.writeHead(status,headers);
  if (req.method === 'HEAD') { res.end(); return; }
  await pipeline(createReadStream(path,{start,end}),res);
}
