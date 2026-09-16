const fs = require('fs');
const path = require('path');

const DEFAULT_CONFIG = {
  docsDir: 'docs',
  cacheDir: '.markdash/cache',
  include: ['**/*.md'],
  exclude: ['archive/**'],
  staleDays: 14,
  typeStatuses: {
    project: ['active', 'on_hold', 'done', 'archived'],
    task: ['backlog', 'todo', 'in_progress', 'blocked', 'review', 'done', 'cancelled'],
    decision: ['proposed', 'accepted', 'deprecated', 'superseded'],
    risk: ['open', 'mitigated', 'closed'],
    test: ['planned', 'passing', 'failing', 'skipped'],
    note: ['active', 'stale', 'archived'],
    doc: ['active', 'stale', 'archived'],
  },
};

function loadConfig(root) {
  const file = path.join(root, '.markdash', 'config.json');
  if (!fs.existsSync(file)) return { ...DEFAULT_CONFIG, root, configPath: null };
  let parsed = {};
  try {
    parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    throw new Error(`Invalid JSON in ${file}: ${err.message}`);
  }
  const typeStatuses = { ...DEFAULT_CONFIG.typeStatuses, ...(parsed.typeStatuses || {}) };
  return { ...DEFAULT_CONFIG, ...parsed, typeStatuses, root, configPath: file };
}

module.exports = { loadConfig, DEFAULT_CONFIG };
