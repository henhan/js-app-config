"use strict";

const generateConfig = require("../lib/index.js");
const path = require("path");

it("should return the loaded json if no special keys are present", () => {
    const config = generateConfig({
        file: "base.json",
        dir: path.join(__dirname, "resources")
    });

    expect(config).toBeDefined();
    expect(config.a).toBe(1);
    expect(config.b).toBe("2");
});

it("should handle arrays", () =>  {
    const config = generateConfig({
        file: "base.json",
        dir: path.join(__dirname, "resources")
    });

    expect(config.array).toEqual([1,2,3]);
});

it("should return different strings based on env", () => {
    const defaultConfig = generateConfig({
        environment: "custom",
        file: "environmentDependent.json",
        dir: path.join(__dirname, "resources")
    });

    const devConfig = generateConfig({
        environment: "dev",
        file: "environmentDependent.json",
        dir: path.join(__dirname, "resources")
    });

    expect(defaultConfig).toBeDefined();
    expect(defaultConfig.env).toBe("default");
    expect(defaultConfig.a).toBe(1);

    expect(devConfig).toBeDefined();
    expect(devConfig.env).toBe("development");
    expect(devConfig.a).toBe(1);
});

it("should return different objects based on env", () => {
    const devConfig = generateConfig({
        environment: "dev",
        file: "environmentDependent.json",
        dir: path.join(__dirname, "resources")
    });

    const prodConfig = generateConfig({
        environment: "prod",
        file: "environmentDependent.json",
        dir: path.join(__dirname, "resources")
    });

    expect(devConfig.keys.key1).toBeDefined();
    expect(devConfig.keys.key2).not.toBeDefined();
    expect(devConfig.keys.key1).toBe("val def");

    expect(prodConfig.keys.key1).toBeDefined();
    expect(prodConfig.keys.key2).toBeDefined();
    expect(prodConfig.keys.key1).toBe("val prod");
    expect(prodConfig.keys.key2).toBe("only prod");
});

it("should handle nested objects", () => {
    const devConfig = generateConfig({
        environment: "dev",
        file: "environmentDependent.json",
        dir: path.join(__dirname, "resources")
    });

    expect(devConfig.nested.one.two).toBe("dev value");
});

it("should support setting a custom default key", () => {
    const devConfig = generateConfig({
        environment: "dev",
        defaultKey: "customDefault",
        file: "customDefault.json",
        dir: path.join(__dirname, "resources")
    });

    expect(devConfig.keys.prod).not.toBeDefined();
    expect(devConfig.keys.key1).toBeDefined();
    expect(devConfig.keys.key1).toBe("val def");
});
