import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { stripTypeScriptTypes } from 'node:module';

const useDist = process.argv.includes('--dist');
const root = resolve(import.meta.dirname, '..', useDist ? 'dist' : '.');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.ts': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' };
const port = Number(process.env.PORT || 5173);
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    try { await stat(file); } catch { file = resolve(root, 'public', '.' + pathname); }
    const isPublic = file.startsWith(resolve(root, 'public') + sep);
    const allowed = useDist || isPublic || ['index.html'].includes(pathname.slice(1)) || pathname === '/' || pathname.startsWith('/src/');
    if (!allowed) { res.writeHead(404).end(); return; }
    let content = await readFile(file);
    if (extname(file) === '.ts') content = stripTypeScriptTypes(content.toString(), { mode: 'strip' });
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(content);
  } catch { res.writeHead(404).end('Not found'); }
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}/`));
