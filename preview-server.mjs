import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = process.cwd();
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

createServer(async (request, response) => {
  const requested = new URL(request.url, 'http://localhost').pathname;
  const relative = requested === '/' ? 'index.html' : requested.slice(1);
  const file = normalize(join(root, relative));
  if (!file.startsWith(root)) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const content = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
    response.end(content);
  } catch {
    const fallback = await readFile(join(root, '404.html'));
    response.writeHead(404, { 'Content-Type': types['.html'] });
    response.end(fallback);
  }
}).listen(4173, '127.0.0.1');
