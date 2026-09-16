const { loadConfig } = require('../config');
const { buildModel, writeCache } = require('../store');
const { updateIndexFile } = require('../generated-index');
const { isInitialized, notInitialized } = require('../project');

module.exports = function sync(root) {
  const config = loadConfig(root);
  if (!isInitialized(root, config)) return notInitialized(root, config);
  const model = buildModel(root);
  writeCache(root, model);
  updateIndexFile(root, model);
  const s = model.summary;
  console.log(`Synced ${s.totals.documents} documents.`);
  console.log(`  tasks=${s.totals.tasks} decisions=${s.totals.decisions} risks=${s.totals.risks} tests=${s.totals.tests}`);
  if (model.errors.length || model.warnings.length) {
    console.log(`  (${model.errors.length} errors, ${model.warnings.length} warnings - run 'markdash validate' for details)`);
  }
  return 0;
};
