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

function objectHasAnyKey(obj, keys) {
    const matches = Object.keys(obj).filter((key) => {
        return keys.includes(key);
    });
    return matches.length > 0;
}

// Every key that is sibling to the default key will become a reserved environment key
function findEnvNames(obj, defaultKey) {
    let envNames = [];
    if (!isObject(obj)) {
        return envNames;
    }
    if (obj.hasOwnProperty(defaultKey)) {
        envNames = envNames.concat(Object.keys(obj));
    }
    Object.keys(obj).forEach((key) => {
        envNames = envNames.concat(findEnvNames(obj[key], defaultKey));
    });
    return envNames;
}

function validateConfig(obj, envNames, defaultKey, isNested) {
    if (!isObject(obj)) {
        return;
    }
    const envKeysPresent = objectHasAnyKey(obj, envNames);
    // Having environment keys without default key is a config error since we would risk returning
    // that subtree for any environment.
    if (envKeysPresent && !obj.hasOwnProperty(defaultKey)) {
        throw "Environment keys are only allowed as siblings to default key '" + defaultKey + "'.";
    }
    // Don't allow default or prod key in environment dependent subtree to avoid allowing
    // confusing configurations.
    if (isNested && envKeysPresent) {
        throw "Environment keys is not allowed inside environment dependent subtree.";
    }
    Object.keys(obj).forEach((key) => {
        const isEnvSubTree = isNested || envNames.includes(key);
        validateConfig(obj[key], envNames, defaultKey, isEnvSubTree);
    });
}

function handleObj(obj, currentEnv, defaultKey) {
    if (!isObject(obj)) {
        return obj;
    }
    if (obj.hasOwnProperty(currentEnv)) {
        return obj[currentEnv];
    }
    if (obj.hasOwnProperty(defaultKey)) {
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

    const envNames = new Set(findEnvNames(inputConfig, defaultOptionKey));

    // Will throw error if anything is bad
    validateConfig(inputConfig, Array.from(envNames), defaultOptionKey);

    return handleObj(inputConfig, envName, defaultOptionKey);
}

module.exports = generateConfig;
