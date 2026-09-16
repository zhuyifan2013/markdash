const fs = require('fs');
const path = require('path');
const { loadConfig } = require('../config');
const { buildModel, writeCache } = require('../store');
const { updateIndexFile } = require('../generated-index');
const { isInitialized, notInitialized } = require('../project');

module.exports = function build(root) {
  const config = loadConfig(root);
  if (!isInitialized(root, config)) return notInitialized(root, config);
  const model = buildModel(root);
  if (model.errors.length) {
    console.error(`Build aborted: ${model.errors.length} validation error(s). Run 'markdash validate'.`);
    return 1;
  }
  writeCache(root, model);
  updateIndexFile(root, model);

  const webDir = path.join(__dirname, '..', '..', 'web');
  const outDir = path.join(root, '.markdash', 'dist');
  fs.rmSync(outDir, { recursive: true, force: true });
  copyDir(webDir, outDir);

  const payload = {
    generated_at: model.summary.generated_at,
    summary: model.summary,
    documents: model.documents,
  };
  fs.writeFileSync(path.join(outDir, 'data.json'), JSON.stringify(payload));
  console.log(`Static dashboard written to .markdash/dist (${model.documents.length} documents).`);
  console.log('Open .markdash/dist/index.html or serve it with any static server.');
  return 0;
};

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}
