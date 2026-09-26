import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.PORT || 4173);
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json', '.svg':'image/svg+xml', '.pdf':'application/pdf', '.bib':'text/plain; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.avif':'image/avif' };
const server = http.createServer(async (req,res) => {
  try {
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    let requested;
    try { requested = decodeURIComponent(url.pathname); } catch { res.writeHead(400); res.end('Invalid URL'); return; }
    if (requested.includes('\\')) { res.writeHead(403); res.end(); return; }
    const local = path.resolve(root, '.' + requested);
    const relative = path.relative(root,local);
    if (relative.startsWith('..') || path.isAbsolute(relative)) { res.writeHead(403); res.end(); return; }
    const file = (await stat(local)).isDirectory() ? path.join(local, 'index.html') : local;
    const content = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch { res.writeHead(404, { 'Content-Type':'text/plain; charset=utf-8' }); res.end('Página no encontrada.'); }
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Vista previa: http://127.0.0.1:${port}\nCtrl+C para detener.`));
