const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const validateMongoUri = (mongoUri) => {
  let parsedUri;

  try {
    parsedUri = new URL(mongoUri);
  } catch {
    throw new Error(
      "Invalid environment variable: MONGODB_URI must be a valid MongoDB connection string."
    );
  }

  if (
    !["mongodb:", "mongodb+srv:"].includes(parsedUri.protocol) ||
    !parsedUri.hostname ||
    (parsedUri.protocol === "mongodb+srv:" && parsedUri.port)
  ) {
    throw new Error(
      "Invalid environment variable: MONGODB_URI must be a valid MongoDB connection string."
    );
  }
};

const readConfig = (env = process.env) => {
  const parsedPort = Number(env.PORT || 5000);
  if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
    throw new Error("Invalid environment variable: PORT");
  }

  return Object.freeze({
    mongoUri: String(env.MONGODB_URI || "").trim(),
    jwtSecret: String(env.JWT_SECRET || ""),
    port: parsedPort,
    clientUrl: String(env.CLIENT_URL || "").trim(),
    allowedOrigins: String(env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((origin) => origin.trim().replace(/\/+$/, ""))
      .filter(Boolean),
    vercelPreviewPattern:
      env.VERCEL_PREVIEW_PATTERN ||
      "^https:\\/\\/trackit2(?:-[a-z0-9-]+)?-[^.]+\\.vercel\\.app$",
  });
};

const loadConfig = (env = process.env) => {
  const config = readConfig(env);
  if (!config.mongoUri) {
    throw new Error("Missing required environment variable: MONGODB_URI");
  }
  validateMongoUri(config.mongoUri);
  if (!config.jwtSecret.trim()) {
    throw new Error("Missing required environment variable: JWT_SECRET");
  }
  return config;
};

module.exports = { loadConfig, readConfig };
