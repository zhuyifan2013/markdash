const fs = require('fs');
const path = require('path');
const { loadConfig } = require('./config');
const { scan } = require('./scan');
const { validate } = require('./validate');
const { summarize } = require('./aggregate');

function buildModel(root) {
  const config = loadConfig(root);
  const scanned = scan(config);
  const { errors, warnings, byId } = validate(config, scanned);
  const documents = scanned.documents
    .filter((d) => d.data && !d._skip)
    .map((d) => ({
      id: d.data.id,
      title: d.data.title,
      type: d.data.type,
      status: d.data.status,
      owner: d.data.owner || '',
      priority: d.data.priority || '',
      due: d.data.due || '',
      tags: Array.isArray(d.data.tags) ? d.data.tags : [],
      related: Array.isArray(d.data.related) ? d.data.related : [],
      project: d.data.project || '',
      blocked_by: Array.isArray(d.data.blocked_by) ? d.data.blocked_by : [],
      probability: d.data.probability || '',
      impact: d.data.impact || '',
      kind: d.data.kind || '',
      health: d.data.health || '',
      created_at: d.data.created_at,
      updated_at: d.data.updated_at,
      path: d.path,
      body: d.body,
    }));
  const summary = summarize(scanned.documents, config);
  return { config, errors, warnings, byId, documents, summary };
}

function writeCache(root, model) {
  const dir = path.join(root, model.config.cacheDir);
  fs.mkdirSync(dir, { recursive: true });
  const payload = {
    generated_at: model.summary.generated_at,
    summary: model.summary,
    documents: model.documents.map((d) => ({ ...d, body: undefined })),
  };
  fs.writeFileSync(path.join(dir, 'documents.json'), JSON.stringify(payload, null, 2) + '\n');
}

module.exports = { buildModel, writeCache };
