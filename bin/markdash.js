#!/usr/bin/env node
const cmd = process.argv[2];
const args = process.argv.slice(3);
const root = process.cwd();

const commands = {
  init: () => require('../src/commands/init')(root, args),
  sync: () => require('../src/commands/sync')(root, args),
  validate: () => require('../src/commands/validate')(root, args),
  serve: () => require('../src/commands/serve')(root, args),
  build: () => require('../src/commands/build')(root, args),
};

function usage() {
  console.log(`markdash - Markdown-native project dashboard

Usage:
  markdash init        Initialize docs/, guides, templates, AGENTS.md
  markdash sync        Scan Markdown, refresh cache and generated index
  markdash validate    Validate frontmatter, links, enums; refreshes cache
  markdash serve       Start dashboard with live reload (default port 4147)
  markdash build       Emit static dashboard to .markdash/dist
`);
}

if (!cmd || cmd === '-h' || cmd === '--help' || !commands[cmd]) {
  usage();
  process.exit(1);
}

Promise.resolve(commands[cmd]())
  .then((code) => process.exit(typeof code === 'number' ? code : 0))
  .catch((err) => {
    console.error(err.stack || String(err));
    process.exit(1);
  });
