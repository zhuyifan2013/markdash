const fs = require('fs');
const path = require('path');

const DIRS = ['projects', 'tasks', 'decisions', 'risks', 'tests', 'operations', 'notes', 'archive', 'guide'];

const CONFIG = {
  docsDir: 'docs',
  cacheDir: '.markdash/cache',
  include: ['**/*.md'],
  exclude: ['archive/**'],
  staleDays: 14,
};

const AGENTS_SNIPPET = `
## Markdash (Markdown-driven project dashboard)

- Read \`docs/index.md\` before starting work, then follow its document map and read only the relevant documents; do not scan everything.
- When task status, requirements, decisions, risks, tests, or deployment details change, update the corresponding Markdown file.
- Read \`docs/guide/documentation-policy.md\` before finishing a task to decide whether documentation needs updating; read \`docs/guide/metadata-schema.md\` before editing frontmatter.
- Run \`markdash validate\` after documentation changes; never hand-edit \`.markdash/cache/\`.
`;

module.exports = function init(root) {
  fs.mkdirSync(path.join(root, '.markdash'), { recursive: true });
  const configPath = path.join(root, '.markdash', 'config.json');
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify(CONFIG, null, 2) + '\n');
  }

  for (const dir of DIRS) {
    fs.mkdirSync(path.join(root, 'docs', dir), { recursive: true });
    const keep = path.join(root, 'docs', dir, '.gitkeep');
    if (!fs.existsSync(keep)) fs.writeFileSync(keep, '');
  }

  const assets = path.join(__dirname, '..', '..', 'assets');
  copyDir(path.join(assets, 'docs', 'guide'), path.join(root, 'docs', 'guide'));
  copyDir(path.join(assets, 'templates'), path.join(root, 'templates'));

  const indexPath = path.join(root, 'docs', 'index.md');
  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(
      indexPath,
      [
        '---',
        'id: doc-index',
        'title: Project index',
        'type: doc',
        'status: active',
        'owner: ""',
        'tags: [index]',
        `created_at: ${today()}`,
        `updated_at: ${today()}`,
        '---',
        '',
        '# Project index',
        '',
        'Describe what this project is, current priorities, and the document map.',
        '',
        '## Document map',
        '',
        '| I want to… | Read |',
        '|---|---|',
        '| Move a task forward | `tasks/` + `guide/agent-workflow.md` |',
        '| Understand a design choice | `decisions/` |',
        '| Check risks | `risks/` |',
        '| Check tests | `tests/` |',
        '| Run / troubleshoot | `operations/` |',
        '',
        '---',
        '',
        '<!-- markdash:generated -->',
        '',
      ].join('\n'),
    );
  }

  const agentsPath = path.join(root, 'AGENTS.md');
  if (!fs.existsSync(agentsPath)) {
    fs.writeFileSync(agentsPath, '# Agent guide\n' + AGENTS_SNIPPET);
  } else if (!fs.readFileSync(agentsPath, 'utf8').includes('Markdash')) {
    fs.appendFileSync(agentsPath, AGENTS_SNIPPET);
    console.log('Appended Markdash section to existing AGENTS.md');
  }

  console.log('Markdash initialized.');
  console.log('Next: add documents under docs/, then run `markdash serve`.');
  return 0;
};

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else if (!fs.existsSync(d)) fs.copyFileSync(s, d);
  }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
