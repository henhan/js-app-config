const generateConfig = require("../index.js");
const path = require("path");

it("should return the loaded json if no special keys are present", () => {
    const config = generateConfig({
        file: "base.json",
        dir: path.join(__dirname, "testConfigs")
    });

    expect(config).toBeDefined();
    expect(config.a).toBe(1);
    expect(config.b).toBe("2");
});
