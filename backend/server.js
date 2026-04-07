const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, ".env"),
});

const authRoutes = require("./routes/authRoutes");
const salaryRoutes = require("./routes/salaryRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const todoRoutes = require("./routes/todoRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const CLIENT_URL = process.env.CLIENT_URL;

const normalizeOrigin = (value) =>
  String(value || "").trim().replace(/\/+$/, "");

const normalizedClientUrl = normalizeOrigin(CLIENT_URL);

// Allow fetching fallback origins from an ALLOWED_ORIGINS env variable (comma-separated)
const customOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

const allowedOrigins = [
  normalizedClientUrl,
  ...customOrigins,
].filter(Boolean);

const isAllowedVercelPreviewOrigin = (origin) => {
  const normalizedOrigin = normalizeOrigin(origin);
  // Optional: move the regex pattern to env too if completely softcoded, but maybe this is standard for Vercel
  const pattern = process.env.VERCEL_PREVIEW_PATTERN || "^https:\\/\\/trackit2(?:-[a-z0-9-]+)?-[^.]+\\.vercel\\.app$";
  
  try {
    const regex = new RegExp(pattern, "i");
    return regex.test(normalizedOrigin);
  } catch {
    return false;
  }
};

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  const normalizedOrigin = normalizeOrigin(origin);

  return (
    allowedOrigins.includes(normalizedOrigin) ||
    isAllowedVercelPreviewOrigin(normalizedOrigin)
  );
};

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts. Please try again later.",
  },
});

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(generalLimiter);

app.get("/", (req, res) => {
  res.send("TrackIt API is running...");
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/notifications", notificationRoutes);

if (!MONGO_URI) {
  console.log("Missing MONGO_URI in environment variables");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.log("Missing JWT_SECRET in environment variables");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err.message);
  });