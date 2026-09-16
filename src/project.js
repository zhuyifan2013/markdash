const fs = require('fs');
const path = require('path');

function isInitialized(root, config) {
  const docsRoot = path.join(root, config.docsDir);
  if (!fs.existsSync(docsRoot)) return false;
  return true;
}

function notInitialized(root, config) {
  console.log(
    `This folder does not look like a Markdash project (no ${config.docsDir}/ directory).\n` +
    `Run \`markdash init\` in the project root first.`,
  );
  return 2;
}

module.exports = { isInitialized, notInitialized };
