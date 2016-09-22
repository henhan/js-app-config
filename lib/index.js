"use strict";

const fs = require("fs");
const path = require("path");

function loadFile(filePath) {
  const fileInfo = fs.statSync(filePath);
  return fileInfo.isFile() ? require(filePath) : undefined;
}

function isObject(obj) {
  return obj && typeof obj === "object" && !Array.isArray(obj);
}

function handleObj(obj, currentEnv, defaultKey) {
  if (!isObject(obj)) {
    return obj;
  }
  if (obj[currentEnv]) {
    return obj[currentEnv];
  }
  if (obj[defaultKey]) {
    return obj[defaultKey];
  }
  const retObj = {};
  Object.keys(obj).forEach((key) => {
    retObj[key] = handleObj(obj[key], currentEnv, defaultKey);
  });
  return retObj;
}

function generateConfig(options = {}) {
  const envName = options.environment || process.env.NODE_ENV || "dev";
  const inputFile = options.file || "config.json";
  const basePath = options.dir || process.env.CONFIG_BASE_PATH || process.cwd();
  const defaultOptionKey = options.defaultKey || "default";

  const filePath = path.join(basePath, inputFile);

  const inputConfig = loadFile(filePath);

  return handleObj(inputConfig, envName, defaultOptionKey);
}

module.exports = generateConfig;