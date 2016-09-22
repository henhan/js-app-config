const fs = require("fs");
const path = require("path");

function loadFile(filePath) {
  const fileInfo = fs.statSync(filePath);
  return fileInfo.isFile() ? require(filePath) : undefined;
}

function generateConfig(options = {}) {
  const envName = options.environment || process.env.NODE_ENV || "dev";
  const inputFile = options.file || "config.json";
  const basePath = options.dir || process.env.CONFIG_BASE_PATH || process.cwd();

  const filePath = path.join(basePath, inputFile);

  return loadFile(filePath);
}

module.exports = generateConfig;
