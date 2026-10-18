const mongoose = require("mongoose");
const { performance } = require("perf_hooks");
const app = require("./app");
const { loadConfig } = require("./config/env");

const safeErrorName = (value) =>
  typeof value === "string" && /^[A-Za-z][A-Za-z0-9_]{0,79}$/.test(value)
    ? value
    : "Error";

const safeErrorCode = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return typeof value === "string" && /^[A-Za-z0-9_.-]{1,40}$/.test(value)
    ? value
    : undefined;
};

const collectConnectionErrors = (rootError) => {
  const queue = [rootError];
  const seen = new Set();
  const errors = [];

  while (queue.length > 0 && errors.length < 20) {
    const current = queue.shift();
    if (!current || typeof current !== "object" || seen.has(current)) continue;

    seen.add(current);
    errors.push(current);

    if (current.cause) queue.push(current.cause);
    if (current.reason && typeof current.reason === "object") {
      queue.push(current.reason);
    }
    if (Array.isArray(current.errors)) queue.push(...current.errors);

    for (const topology of [current, current.reason]) {
      if (topology?.servers && typeof topology.servers.values === "function") {
        for (const server of topology.servers.values()) {
          if (server?.error) queue.push(server.error);
        }
      }
    }
  }

  return errors;
};

const classifyConnectionError = (error) => {
  const code = String(error.code || "").toUpperCase();
  const codeName = String(error.codeName || "").toLowerCase();
  const name = String(error.name || "").toLowerCase();
  const message = String(error.message || "").toLowerCase();

  if (name.includes("mongoparseerror") || name.includes("invalidargument")) {
    return "configuration";
  }
  if (
    code === "18" ||
    codeName.includes("authenticationfailed") ||
    /authentication failed|bad auth/.test(message)
  ) {
    return "authentication";
  }
  if (["ENOTFOUND", "EAI_AGAIN"].includes(code)) return "dns";
  if (code.startsWith("ERR_TLS") || /tls|ssl|certificate/.test(message)) {
    return "tls";
  }
  if (code === "ECONNREFUSED") return "connection-refused";
  if (code === "ETIMEDOUT") return "network-timeout";
  if (code === "ECONNRESET") return "connection-reset";
  if (["ENETUNREACH", "EHOSTUNREACH"].includes(code)) {
    return "network-unreachable";
  }
  if (/timed out|timeout/.test(message) && name.includes("serverselection")) {
    return "server-selection-timeout";
  }
  if (name.includes("mongonetworkerror")) return "network-error";
  if (name.includes("mongoservererror")) return "mongodb-server-error";
  if (name.includes("serverselection")) return "server-selection-error";
  return "connection-error";
};

const categoryPriority = {
  configuration: 105,
  authentication: 100,
  tls: 95,
  dns: 90,
  "connection-refused": 85,
  "network-timeout": 85,
  "connection-reset": 85,
  "network-unreachable": 85,
  "server-selection-timeout": 75,
  "network-error": 70,
  "mongodb-server-error": 60,
  "server-selection-error": 40,
  "connection-error": 0,
};

const getSafeConnectionDiagnostics = (rootError) => {
  const errors = collectConnectionErrors(rootError);
  const categories = errors.map(classifyConnectionError);
  const category = categories.reduce(
    (best, candidate) =>
      categoryPriority[candidate] > categoryPriority[best] ? candidate : best,
    "connection-error"
  );
  const safeErrors = [];
  const seenErrorKeys = new Set();

  for (const error of errors) {
    const detail = {
      name: safeErrorName(error.name),
      category: classifyConnectionError(error),
    };
    const code = safeErrorCode(error.code);
    const codeName = safeErrorName(error.codeName);
    if (code !== undefined) detail.code = code;
    if (codeName !== "Error") detail.codeName = codeName;

    const key = JSON.stringify(detail);
    if (!seenErrorKeys.has(key)) {
      seenErrorKeys.add(key);
      safeErrors.push(detail);
    }
  }

  let selectionTimeoutMs;
  for (const error of errors) {
    const match = String(error.message || "").match(
      /timed out after\s+(\d+)\s*ms/i
    );
    if (match) {
      selectionTimeoutMs = Number(match[1]);
      break;
    }
  }

  return {
    category,
    selectionTimeoutMs,
    errors: safeErrors.slice(0, 10),
  };
};

const startServer = async () => {
  const config = loadConfig();
  const mongoConnectStartedAt = performance.now();

  try {
    await mongoose.connect(config.mongoUri);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("MongoDB connection failed (development diagnostics).", {
        ...getSafeConnectionDiagnostics(error),
        durationMs: Number((performance.now() - mongoConnectStartedAt).toFixed(1)),
      });
    } else {
      console.error("MongoDB connection failed.", {
        errorName: safeErrorName(error.name),
        errorCode: safeErrorCode(error.code),
      });
    }
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
