const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { readConfig } = require("./config/env");
const { errorHandler, notFoundHandler, createHttpError } = require("./middleware/errorHandler");
const { validateRequest } = require("./middleware/requestValidation");

const authRoutes = require("./routes/authRoutes");
const salaryRoutes = require("./routes/salaryRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const todoRoutes = require("./routes/todoRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const config = readConfig();

const allowedOrigins = [
  config.clientUrl.replace(/\/+$/, ""),
  ...config.allowedOrigins,
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  const normalizedOrigin = String(origin).trim().replace(/\/+$/, "");
  if (allowedOrigins.includes(normalizedOrigin)) return true;

  try {
    return new RegExp(config.vercelPreviewPattern, "i").test(normalizedOrigin);
  } catch {
    return false;
  }
};

app.disable("x-powered-by");
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  res.setHeader("X-Request-ID", req.requestId);
  next();
});

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(createHttpError(403, "Origin is not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    skip: () => process.env.NODE_ENV === "test",
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests. Please try again later." },
  })
);
app.use(validateRequest);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skip: () => process.env.NODE_ENV === "test",
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Please try again later." },
});

app.get("/", (req, res) => {
  res.send("TrackIt API is running...");
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
