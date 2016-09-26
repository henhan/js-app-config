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

// Don't allow default or prod key in returned subtree to avoid allowing
// confusing configurations.
function validSubtree(obj, currentEnv, defaultKey) {
    if (!isObject(obj)) {
        return obj;
    }
    if (obj.hasOwnProperty(defaultKey)) {
        throw "Default key '" + defaultKey + "' is not allowed to be nested.";
    }
    if (obj.hasOwnProperty(currentEnv)) {
        throw "Environment key '" + currentEnv + "' is not allowed to be nested.";
    }
    const retObj = {};
    Object.keys(obj).forEach((key) => {
        retObj[key] = validSubtree(obj[key], currentEnv, defaultKey);
    });
    return retObj;
}

function handleObj(obj, currentEnv, defaultKey) {
    if (!isObject(obj)) {
        return obj;
    }
    if (obj.hasOwnProperty(currentEnv)) {
        return validSubtree(obj[currentEnv], currentEnv, defaultKey);
    }
    if (obj.hasOwnProperty(defaultKey)) {
        return validSubtree(obj[defaultKey], currentEnv, defaultKey);
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
