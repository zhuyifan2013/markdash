const TYPES = ['project', 'task', 'decision', 'risk', 'test', 'note', 'doc'];
const REQUIRED = ['id', 'title', 'type', 'status', 'created_at', 'updated_at'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validate(config, scanned) {
  const errors = [...scanned.parseErrors.map((e) => ({ level: 'error', path: e.path, message: e.message }))];
  const warnings = [];
  const byId = new Map();

  for (const doc of scanned.documents) {
    const d = doc.data;
    const p = doc.path;

    if (!d) {
      warnings.push({ level: 'warning', path: p, message: 'No frontmatter; excluded from dashboard data.' });
      doc._skip = true;
      continue;
    }

    for (const field of REQUIRED) {
      const v = d[field];
      if (v === undefined || v === null || v === '') {
        errors.push({ level: 'error', path: p, message: `Missing required field: ${field}` });
      }
    }

    if (d.type && !TYPES.includes(d.type)) {
      errors.push({ level: 'error', path: p, message: `Unknown type: ${d.type}` });
    }

    if (d.type && d.status && config.typeStatuses[d.type]) {
      const allowed = config.typeStatuses[d.type];
      if (!allowed.includes(d.status)) {
        errors.push({
          level: 'error',
          path: p,
          message: `Invalid status "${d.status}" for type ${d.type}; allowed: ${allowed.join(', ')}`,
        });
      }
    }

    for (const field of ['created_at', 'updated_at']) {
      if (d[field] && !DATE_RE.test(d[field])) {
        errors.push({ level: 'error', path: p, message: `${field} must be YYYY-MM-DD, got: ${d[field]}` });
      }
    }
    if (d.due && !DATE_RE.test(d.due)) {
      errors.push({ level: 'error', path: p, message: `due must be YYYY-MM-DD, got: ${d.due}` });
    }

    if (d.id) {
      if (byId.has(d.id)) {
        errors.push({ level: 'error', path: p, message: `Duplicate id: ${d.id} (also in ${byId.get(d.id)})` });
      } else {
        byId.set(d.id, p);
      }
    }

    if (d.type === 'task' && d.status === 'blocked' && (!Array.isArray(d.blocked_by) || d.blocked_by.length === 0)) {
      warnings.push({ level: 'warning', path: p, message: 'Task is blocked but blocked_by is empty.' });
    }
    if (d.type === 'task' && d.status === 'done' && !/result|verification|test/i.test(doc.body)) {
      warnings.push({ level: 'warning', path: p, message: 'Done task should record result/verification in body.' });
    }
  }

  for (const doc of scanned.documents) {
    const d = doc.data;
    if (!d || doc._skip) continue;
    const links = [];
    if (Array.isArray(d.related)) links.push(...d.related.map((x) => ['related', x]));
    if (d.project) links.push(['project', d.project]);
    if (d.supersedes) links.push(['supersedes', d.supersedes]);
    for (const [field, ref] of links) {
      if (!byId.has(ref)) {
        errors.push({ level: 'error', path: doc.path, message: `Broken ${field} link: ${ref}` });
      }
    }
  }

  return { errors, warnings, byId };
}

module.exports = { validate };
