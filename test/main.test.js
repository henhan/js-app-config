"use strict";

const generateConfig = require("../lib/index.js");
const path = require("path");
const resourceDir = path.join(__dirname, "resources");

describe("config generation", () => {
    it("should return the loaded json if no special keys are present", () => {
        const config = generateConfig({
            file: "base.json",
            dir: resourceDir
        });

        expect(config).toBeDefined();
        expect(config.a).toBe(1);
        expect(config.b).toBe("2");
    });

    it("should handle arrays", () =>  {
        const config = generateConfig({
            file: "base.json",
            dir: resourceDir
        });

        expect(config.array).toEqual([1,2,3]);
    });

    it("should return default values when no env is set", () => {
        const defaultConfig = generateConfig({
            file: "environmentDependent.json",
            dir: resourceDir
        });

        expect(defaultConfig).toBeDefined();
        expect(defaultConfig.env).toBe("default");
        expect(defaultConfig.a).toBe(1);
    });

    it("should return different strings based on env", () => {
        const devConfig = generateConfig({
            environment: "dev",
            file: "environmentDependent.json",
            dir: resourceDir
        });

        const prodConfig = generateConfig({
            environment: "prod",
            file: "environmentDependent.json",
            dir: resourceDir
        });

        expect(devConfig).toBeDefined();
        expect(devConfig.env).toBe("development");
        expect(devConfig.a).toBe(1);

        expect(prodConfig).toBeDefined();
        expect(prodConfig.env).toBe("production");
        expect(prodConfig.a).toBe(1);
    });

    it("should return different objects based on env", () => {
        const devConfig = generateConfig({
            environment: "dev",
            file: "environmentDependent.json",
            dir: resourceDir
        });

        const prodConfig = generateConfig({
            environment: "prod",
            file: "environmentDependent.json",
            dir: resourceDir
        });

        expect(devConfig.keys.key1).toBeDefined();
        expect(devConfig.keys.key2).not.toBeDefined();
        expect(devConfig.keys.key1).toBe("val def");
        expect(devConfig.prodOnly).toBeNull();

        expect(prodConfig.keys.key1).toBeDefined();
        expect(prodConfig.keys.key2).toBeDefined();
        expect(prodConfig.keys.key1).toBe("val prod");
        expect(prodConfig.keys.key2).toBe("only prod");
        expect(prodConfig.prodOnly).toBe("isProd");
    });

    it("should handle nested objects", () => {
        const devConfig = generateConfig({
            environment: "dev",
            file: "environmentDependent.json",
            dir: resourceDir
        });

        expect(devConfig.nested.one.two).toBe("dev value");
    });

    it("should support setting a custom default key", () => {
        const devConfig = generateConfig({
            environment: "dev",
            defaultKey: "customDefault",
            file: "customDefault.json",
            dir: resourceDir
        });

        expect(devConfig.keys.prod).not.toBeDefined();
        expect(devConfig.keys.key1).toBeDefined();
        expect(devConfig.keys.key1).toBe("val def");
    });

    it("should not allow default key as name in returned tree", () => {
        const testFunction = generateConfig.bind(null, {
            file: "invalid1.json",
            dir: resourceDir
        });
        expect(testFunction)
            .toThrowError("Default key 'default' is not allowed to be nested.");
    });

    it("should not allow environment key as name in returned tree", () => {
        const testFunction = generateConfig.bind(null, {
            environment: "prod",
            file: "invalid2.json",
            dir: resourceDir
        });
        expect(testFunction)
            .toThrowError("Environment key 'prod' is not allowed to be nested.");
    });

    it("should handle config put in js file", () => {
        const devConfig = generateConfig({
            environment: "dev",
            file: "jsconf.js",
            dir: resourceDir
        });

        expect(devConfig.env).toBe("myDev");
        expect(devConfig.a).toBe(1);
    });
});
