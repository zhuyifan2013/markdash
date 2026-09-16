const fs = require('fs');
const path = require('path');
const { splitMarkdown } = require('./frontmatter');

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.git')) continue;
      walk(full, out);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

function matchAny(rel, patterns) {
  return patterns.some((p) => {
    const re = patternToRegExp(p);
    return re.test(rel);
  });
}

function patternToRegExp(pattern) {
  const escaped = pattern
    .replace(/[.+^${}()|\\]/g, '\\$&')
    .replace(/\*\*\//g, '§D§')
    .replace(/\*\*/g, '§A§')
    .replace(/\*/g, '[^/]*')
    .replace(/§D§/g, '(.*/)?')
    .replace(/§A§/g, '.*');
  return new RegExp(`^${escaped}$`);
}

function scan(config) {
  const docsRoot = path.join(config.root, config.docsDir);
  const files = walk(docsRoot);
  const documents = [];
  const parseErrors = [];

  for (const file of files) {
    const rel = path.relative(config.root, file).split(path.sep).join('/');
    if (config.exclude && matchAny(rel, config.exclude)) continue;
    if (config.include && config.include.length && !matchAny(rel, config.include)) continue;

    const content = fs.readFileSync(file, 'utf8');
    let parsed;
    try {
      parsed = splitMarkdown(content);
    } catch (err) {
      parseErrors.push({ path: rel, message: err.message });
      continue;
    }
    documents.push({
      path: rel,
      data: parsed.data,
      body: parsed.body,
      mtime: fs.statSync(file).mtimeMs,
    });
  }

  return { documents, parseErrors };
}

module.exports = { scan, matchAny };
