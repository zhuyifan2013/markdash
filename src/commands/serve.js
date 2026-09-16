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
  const configs = collectRoots(root, args);
  if (!configs) return Promise.resolve(2);

  const hasExplicitPort = args.some((arg) => arg.startsWith('--port='));
  const initialPort = Number((args.find((a) => a.startsWith('--port=')) || '').split('=')[1]) || 4147;
  let port = initialPort;
  const webDir = path.join(__dirname, '..', '..', 'web');
  const clients = new Set();
  let timer = null;
  let workspaces = [];

  function refresh(writeIndex) {
    const models = configs.map((config) => {
      const model = buildModel(config.root);
      writeCache(config.root, model);
      if (writeIndex) updateIndexFile(config.root, model);
      return model;
    });
    workspaces = buildWorkspaces(models);
    return workspaces;
  }

  refresh(true);

  for (const config of configs) {
    const docsDir = path.join(config.root, config.docsDir);
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
      console.log(`File watching unavailable for ${config.root}; dashboard will still load data on refresh.`);
    }
  }

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);

    if (url.pathname === '/api/documents') {
      const selected = url.searchParams.get('workspace') || '';
      const spaces = refresh(false);
      const selectedWorkspace = spaces.find((workspace) => workspace.id === selected);
      const documents = selectedWorkspace ? selectedWorkspace.documents : spaces.flatMap((workspace) => workspace.documents);
      const summary = selectedWorkspace ? selectedWorkspace.summary : mergeSummaries(spaces.map((workspace) => workspace.summary));
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        selected: selectedWorkspace ? selected : '',
        projects: spaces.map(({ id, name, path, summary }) => ({ id, name, path, summary })),
        summary,
        documents: documents.map(stripBody),
      }));
      return;
    }

    if (url.pathname === '/api/document') {
      const spaces = refresh(false);
      const id = url.searchParams.get('id') || '';
      const workspaceId = id.includes(':') ? id.slice(0, id.indexOf(':')) : '';
      const documentId = id.includes(':') ? id.slice(id.indexOf(':') + 1) : id;
      const workspace = spaces.find((workspace) => workspace.id === workspaceId) || spaces[0];
      const model = workspace && workspace.model;
      const doc = model && model.documents.find((d) => d.id === documentId);
      if (!doc) { res.writeHead(404); res.end('not found'); return; }
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(decorateDocument(doc, workspace, model.documents)));
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
      if (!hasExplicitPort && port < initialPort + 10) {
        port += 1;
        console.log(`Port ${port - 1} is already in use; trying port ${port}.`);
        server.listen(port);
        return;
      }
      console.log(`Port ${port} is already in use. Is another markdash serve running? Use --port=${port + 1}.`);
      process.exit(2);
    }
    throw err;
  });

  server.on('listening', () => {
    console.log(`Markdash dashboard: http://localhost:${port}`);
  });

  server.listen(port);

  return new Promise(() => {});
};

function collectRoots(root, args) {
  const currentConfig = loadConfig(root);
  const explicitPaths = [];
  for (const arg of args) {
    if (arg.startsWith('--project=')) {
      explicitPaths.push(path.resolve(arg.slice('--project='.length)));
    } else if (arg.startsWith('--projects=')) {
      for (const value of arg.slice('--projects='.length).split(',')) {
        if (value) explicitPaths.push(path.resolve(value));
      }
    }
  }

  if (!explicitPaths.length) {
    if (!isInitialized(root, currentConfig)) {
      notInitialized(root, currentConfig);
      return null;
    }
    const configs = [currentConfig];
    configs.push(...discoverSiblingConfigs(root));
    return configs;
  }

  const roots = [];
  if (isInitialized(root, currentConfig)) roots.push(root);
  for (const projectPath of explicitPaths) {
    if (!roots.includes(projectPath)) roots.push(projectPath);
  }

  const configs = [];
  for (const projectRoot of roots) {
    const config = loadConfig(projectRoot);
    if (!isInitialized(projectRoot, config)) {
      console.error(`This folder does not look like a Markdash project: ${projectRoot}\nRun \`markdash init\` there first.`);
      return null;
    }
    configs.push(config);
  }
  return configs;
}

function discoverSiblingConfigs(root) {
  const resolvedRoot = path.resolve(root);
  const parent = path.dirname(resolvedRoot);
  let entries;
  try {
    entries = fs.readdirSync(parent, { withFileTypes: true });
  } catch {
    return [];
  }

  const configs = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const candidateRoot = path.join(parent, entry.name);
    const candidateConfigPath = path.join(candidateRoot, '.markdash', 'config.json');
    if (candidateRoot === resolvedRoot || !fs.existsSync(candidateConfigPath)) continue;

    try {
      const config = loadConfig(candidateRoot);
      if (isInitialized(candidateRoot, config)) configs.push(config);
    } catch (err) {
      console.error(`Ignoring sibling project ${candidateRoot}: ${err.message}`);
    }
  }
  return configs.sort((a, b) => a.root.localeCompare(b.root));
}

function buildWorkspaces(models) {
  const usedIds = new Set();
  return models.map((model, index) => {
    const rootName = path.basename(model.config.root);
    const projectDoc = model.documents.find((d) => d.type === 'project');
    const name = projectDoc ? projectDoc.title : rootName;
    let id = slugify(rootName) || `project-${index + 1}`;
    let suffix = 2;
    while (usedIds.has(id)) id = `${slugify(rootName) || 'project'}-${suffix++}`;
    usedIds.add(id);

    const workspace = { id, name, path: model.config.root, model };
    workspace.documents = model.documents.map((doc) => decorateDocument(doc, workspace, model.documents));
    workspace.summary = decorateSummary(model.summary, id, model.documents);
    return workspace;
  });
}

function decorateDocument(doc, workspace, projectDocuments) {
  const relatedById = new Map(projectDocuments.map((related) => [related.id, `${workspace.id}:${related.id}`]));
  return {
    ...doc,
    key: `${workspace.id}:${doc.id}`,
    workspace_id: workspace.id,
    workspace_name: workspace.name,
    related: (doc.related || []).map((related) => relatedById.get(related) || related),
  };
}

function decorateSummary(summary, workspaceId, projectDocuments) {
  const keyById = new Map(projectDocuments.map((doc) => [doc.id, `${workspaceId}:${doc.id}`]));
  const ref = (item) => ({ ...item, key: keyById.get(item.id) || item.id });
  return {
    ...summary,
    tasks: {
      ...summary.tasks,
      by_status: { ...summary.tasks.by_status },
      blocked: summary.tasks.blocked.map(ref),
      in_progress: summary.tasks.in_progress.map(ref),
      overdue: summary.tasks.overdue.map(ref),
    },
    risks: {
      ...summary.risks,
      open: summary.risks.open.map(ref),
      high: summary.risks.high.map(ref),
    },
    stale: summary.stale.map(ref),
    recent: summary.recent.map(ref),
  };
}

function mergeSummaries(summaries) {
  const totals = { documents: 0, tasks: 0, risks: 0, decisions: 0, tests: 0 };
  const byStatus = {};
  const recent = [];
  const stale = [];
  for (const summary of summaries) {
    for (const [key, value] of Object.entries(summary.totals)) totals[key] = (totals[key] || 0) + value;
    for (const [status, count] of Object.entries(summary.tasks.by_status)) {
      byStatus[status] = (byStatus[status] || 0) + count;
    }
    recent.push(...summary.recent);
    stale.push(...summary.stale);
  }
  return {
    totals,
    tasks: {
      by_status: byStatus,
      blocked: summaries.flatMap((summary) => summary.tasks.blocked),
      in_progress: summaries.flatMap((summary) => summary.tasks.in_progress),
      overdue: summaries.flatMap((summary) => summary.tasks.overdue),
    },
    risks: {
      open: summaries.flatMap((summary) => summary.risks.open),
      high: summaries.flatMap((summary) => summary.risks.high),
    },
    tests: {
      by_status: summaries.reduce((all, summary) => {
        for (const [status, count] of Object.entries(summary.tests.by_status)) {
          all[status] = (all[status] || 0) + count;
        }
        return all;
      }, {}),
    },
    stale: stale.sort((a, b) => b.age_days - a.age_days),
    recent: recent.sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 10),
    generated_at: new Date().toISOString(),
  };
}

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function stripBody(d) {
  const { body, ...rest } = d;
  return rest;
}
