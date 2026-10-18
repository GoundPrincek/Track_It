const jwt = require("jsonwebtoken");
const User = require("../models/User");

const unauthorized = (res) =>
  res.status(401).json({ message: "Unauthorized. Invalid or expired token." });

const protect = async (req, res, next) => {
  const authHeader = String(req.headers.authorization || "").trim();
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized. Token missing." });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return res.status(401).json({ message: "Unauthorized. Token missing." });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return unauthorized(res);
  }

  if (!decoded || typeof decoded.userId !== "string" || !decoded.userId) {
    return unauthorized(res);
  }

  let user;
  try {
    user = await User.findById(decoded.userId).select("tokenVersion");
  } catch (error) {
    if (error.name === "CastError") return unauthorized(res);
    return next(error);
  }
  if (!user) return unauthorized(res);

  const tokenVersion = Number(decoded.tokenVersion ?? 0);
  const currentVersion = Number(user.tokenVersion ?? 0);
  if (!Number.isInteger(tokenVersion) || tokenVersion !== currentVersion) {
    return unauthorized(res);
  }

  req.user = {
    userId: decoded.userId,
    email: decoded.email,
  };
  return next();
};

module.exports = protect;
