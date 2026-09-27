import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist', import.meta.url));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
let version = 1;
createServer(async (req, res) => {
    if (req.url === '/__test/update' && req.method === 'POST') {
        version++;
        res.end('ok');
        return;
    }
    try {
        let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
        if (pathname.startsWith('/phaser-snake/')) pathname = pathname.slice('/phaser-snake'.length);
        if (pathname.endsWith('/')) pathname += 'index.html';
        const file = resolve(root, `.${pathname}`);
        if (!file.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
        let body = await readFile(file);
        if (pathname === '/sw.js') body = Buffer.concat([Buffer.from(`/* test deployment ${version} */\n`), body]);
        res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
        res.end(body);
    } catch { res.writeHead(404); res.end('Not found'); }
}).listen(4175, '127.0.0.1');
