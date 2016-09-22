"use strict";

const path = require("path");

describe("module usage", () => {
    it("should return config when called directly", () => {
        const config = require("../lib/index.js")({
            file: "base.json",
            dir: path.join(__dirname, "resources")
        });

        expect(config).toBeDefined();
        expect(config.a).toBe(1);
        expect(config.b).toBe("2");
    });
});
