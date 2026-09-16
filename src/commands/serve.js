const fs = require('fs');
const http = require('http');
const path = require('path');
const { loadConfig } = require('../config');
const { buildModel, writeCache } = require('../store');
const { updateIndexFile } = require('../generated-index');
const { isInitialized, notInitialized } = require('../project');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

module.exports = function serve(root, args) {
  const config = loadConfig(root);
  if (!isInitialized(root, config)) return Promise.resolve(notInitialized(root, config));

  const port = Number((args.find((a) => a.startsWith('--port=')) || '').split('=')[1]) || 4147;
  const webDir = path.join(__dirname, '..', '..', 'web');
  const clients = new Set();
  let timer = null;

  function refresh(writeIndex) {
    const model = buildModel(root);
    writeCache(root, model);
    if (writeIndex) updateIndexFile(root, model);
    return model;
  }

  refresh(true);

  const docsDir = path.join(root, config.docsDir);
  try {
    fs.watch(docsDir, { recursive: true }, (_event, filename) => {
      if (filename && !String(filename).endsWith('.md')) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        refresh(true);
        for (const res of clients) res.write('data: update\n\n');
      }, 150);
    });
  } catch {
    console.log('File watching unavailable; dashboard will still load data on refresh.');
  }

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);

    if (url.pathname === '/api/documents') {
      const model = refresh(false);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ summary: model.summary, documents: model.documents.map(stripBody) }));
      return;
    }

    if (url.pathname === '/api/document') {
      const model = buildModel(root);
      const id = url.searchParams.get('id');
      const doc = model.documents.find((d) => d.id === id);
      if (!doc) { res.writeHead(404); res.end('not found'); return; }
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(doc));
      return;
    }

    if (url.pathname === '/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });
      res.write('retry: 2000\n\n');
      clients.add(res);
      req.on('close', () => clients.delete(res));
      return;
    }

    let rel = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
    const file = path.join(webDir, path.normalize(rel));
    if (!file.startsWith(webDir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404);
      res.end('not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is already in use. Is another markdash serve running? Use --port=${port + 1}.`);
      process.exit(2);
    }
    throw err;
  });

  server.listen(port, () => {
    console.log(`Markdash dashboard: http://localhost:${port}`);
  });

  return new Promise(() => {});
};

function stripBody(d) {
  const { body, ...rest } = d;
  return rest;
}
