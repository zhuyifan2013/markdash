const { loadConfig } = require('../config');
const { buildModel, writeCache } = require('../store');
const { isInitialized, notInitialized } = require('../project');

module.exports = function validate(root) {
  const config = loadConfig(root);
  if (!isInitialized(root, config)) return notInitialized(root, config);
  const model = buildModel(root);
  const all = [...model.errors, ...model.warnings].sort((a, b) => a.path.localeCompare(b.path));
  for (const item of all) {
    const tag = item.level === 'error' ? 'ERROR ' : 'WARN  ';
    console.log(`${tag}${item.path}: ${item.message}`);
  }
  writeCache(root, model);
  if (model.errors.length) {
    console.log(`\n${model.errors.length} error(s), ${model.warnings.length} warning(s).`);
    return 1;
  }
  console.log(`OK - ${model.documents.length} documents, ${model.warnings.length} warning(s).`);
  return 0;
};
