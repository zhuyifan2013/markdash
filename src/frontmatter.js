function parseScalar(raw) {
  const v = raw.trim();
  if (v === '') return '';
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null' || v === '~') return null;
  if (/^-?\d+$/.test(v)) return Number(v);
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

function parseInlineList(raw) {
  const inner = raw.trim().replace(/^\[/, '').replace(/\]$/, '');
  if (inner.trim() === '') return [];
  const parts = [];
  let cur = '';
  let quote = null;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (quote) {
      cur += ch;
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
    } else if (ch === ',') {
      parts.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  parts.push(cur.trim());
  return parts.filter(Boolean).map(parseScalar);
}

function parseFrontmatter(yamlText) {
  const lines = yamlText.split('\n');
  const data = {};
  for (const original of lines) {
    const line = original.replace(/\s+$/, '');
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (/^\s/.test(line)) {
      throw new Error(`Nested YAML is not supported: "${original}". Use inline lists, e.g. tags: [a, b].`);
    }
    const idx = line.indexOf(':');
    if (idx === -1) throw new Error(`Invalid frontmatter line: "${original}"`);
    const key = line.slice(0, idx).trim();
    const rest = line.slice(idx + 1).trim();
    if (rest.startsWith('[') && rest.endsWith(']')) {
      data[key] = parseInlineList(rest);
    } else {
      data[key] = parseScalar(rest);
    }
  }
  return data;
}

function splitMarkdown(content) {
  if (!content.startsWith('---')) return { data: null, body: content };
  const end = content.indexOf('\n---', 3);
  if (end === -1) throw new Error('Frontmatter opening "---" has no closing "---"');
  let closeEnd = end + 4;
  if (content[closeEnd] === '\r') closeEnd += 1;
  if (content[closeEnd] === '\n') closeEnd += 1;
  const yamlText = content.slice(3, end).replace(/^\r?\n/, '');
  const body = content.slice(closeEnd);
  return { data: parseFrontmatter(yamlText), body };
}

module.exports = { splitMarkdown, parseFrontmatter };
