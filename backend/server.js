const mongoose = require("mongoose");
const app = require("./app");
const { loadConfig } = require("./config/env");

const startServer = async () => {
  const config = loadConfig();

  try {
    await mongoose.connect(config.mongoUri);
  } catch (error) {
    console.error("MongoDB connection failed.", {
      errorName: error.name || "Error",
      errorCode: error.code || undefined,
    });
    throw new Error("Unable to connect to MongoDB");
  }

  console.log("MongoDB connected.");
  const server = app.listen(config.port, "0.0.0.0", () => {
    console.log(`TrackIt API listening on port ${config.port}.`);
  });

  return server;
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { startServer };
