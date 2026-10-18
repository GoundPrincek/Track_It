const { loadConfig } = require("../config/env");

describe("backend environment configuration", () => {
  test("requires the canonical MONGODB_URI variable without echoing secrets", () => {
    expect(() => loadConfig({ JWT_SECRET: "test-secret" })).toThrow(
      "Missing required environment variable: MONGODB_URI"
    );
  });

  test("loads MongoDB and JWT settings from the canonical environment names", () => {
    const config = loadConfig({
      MONGODB_URI: "mongodb://localhost:27017/trackit-test",
      JWT_SECRET: "test-secret",
      PORT: "5001",
    });

    expect(config.mongoUri).toBe("mongodb://localhost:27017/trackit-test");
    expect(config.port).toBe(5001);
  });

  test("rejects malformed MongoDB connection strings without echoing them", () => {
    expect(() =>
      loadConfig({
        MONGODB_URI: "https://example.invalid/private-value",
        JWT_SECRET: "test-secret",
      })
    ).toThrow(
      "Invalid environment variable: MONGODB_URI must be a valid MongoDB connection string."
    );
  });
});
