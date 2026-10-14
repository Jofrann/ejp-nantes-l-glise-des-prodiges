import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('dist');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
export async function serveWebsite(req, res, pathname) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return;
  }
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { res.writeHead(400); res.end(); return; }
  const target = resolve(root, '.' + decoded);
  if (target !== root && !target.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
  let file = target, content;
  try { content = await readFile(file); }
  catch {
    if (extname(decoded)) { res.writeHead(404); res.end('Fichier introuvable'); return; }
    file = resolve(root, 'index.html');
    try { content = await readFile(file); }
    catch { res.writeHead(503); res.end('Compilez le site avec npm run build avant de le lancer.'); return; }
  }
  res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': file.includes(sep + 'assets' + sep) ? 'public, max-age=31536000, immutable' : 'no-cache', 'X-Content-Type-Options': 'nosniff' });
  res.end(req.method === 'HEAD' ? undefined : content);
}
