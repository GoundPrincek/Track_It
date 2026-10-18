const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { performance } = require("node:perf_hooks");
const nodemailer = require("nodemailer");
const router = express.Router();
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  preferences: user.preferences,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const createToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      tokenVersion: Number(user.tokenVersion || 0),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || "").trim();

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.log("Register error:", err.message);
    res.status(500).json({ message: "Register failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const timingEnabled = process.env.NODE_ENV === "development";
  const requestStartedAt = timingEnabled ? performance.now() : null;
  const stageDurations = timingEnabled
    ? {
        userLookupMs: null,
        passwordCompareMs: null,
        jwtSigningMs: null,
      }
    : null;

  if (timingEnabled) {
    res.once("finish", () => {
      const totalMs = performance.now() - requestStartedAt;
      const measuredStageMs = Object.values(stageDurations).reduce(
        (total, duration) => total + (duration || 0),
        0
      );

      console.info("[dev-timing] POST /api/auth/login", {
        requestId: req.requestId || "unavailable",
        status: res.statusCode,
        totalMs: Number(totalMs.toFixed(2)),
        userLookupMs:
          stageDurations.userLookupMs === null
            ? null
            : Number(stageDurations.userLookupMs.toFixed(2)),
        passwordCompareMs:
          stageDurations.passwordCompareMs === null
            ? null
            : Number(stageDurations.passwordCompareMs.toFixed(2)),
        jwtSigningMs:
          stageDurations.jwtSigningMs === null
            ? null
            : Number(stageDurations.jwtSigningMs.toFixed(2)),
        otherMs: Number(Math.max(0, totalMs - measuredStageMs).toFixed(2)),
      });
    });
  }

  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || "").trim();

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const userLookupStartedAt = timingEnabled ? performance.now() : null;
    const user = await User.findOne({ email });
    if (timingEnabled) {
      stageDurations.userLookupMs = performance.now() - userLookupStartedAt;
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const passwordCompareStartedAt = timingEnabled ? performance.now() : null;
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (timingEnabled) {
      stageDurations.passwordCompareMs =
        performance.now() - passwordCompareStartedAt;
    }

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const jwtSigningStartedAt = timingEnabled ? performance.now() : null;
    const token = createToken(user);
    if (timingEnabled) {
      stageDurations.jwtSigningMs = performance.now() - jwtSigningStartedAt;
    }

    res.json({
      message: "Login successful",
      user: sanitizeUser(user),
      token,
    });
  } catch (err) {
    console.error("Login failed.", {
      errorName: err.name || "Error",
      errorCode: err.code || undefined,
    });
    res.status(500).json({ message: "Login failed" });
  }
});

// GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user: sanitizeUser(user) });
  } catch (err) {
    console.log("Get profile error:", err.message);
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// PUT /api/auth/profile — update name and/or password (protected)
router.put("/profile", protect, async (req, res) => {
  try {
    const userId = req.user.userId;

    const newName = String(req.body?.name || "").trim();
    const currentPassword = String(req.body?.currentPassword || "").trim();
    const newPassword = String(req.body?.newPassword || "").trim();

    if (!newName) {
      return res.status(400).json({ message: "Name is required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update name
    user.name = newName;

    let passwordChanged = false;

    // If user wants to change password
    if (newPassword) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ message: "Current password is required to set a new password" });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "New password must be at least 6 characters long" });
      }

      const isCurrentValid = await bcrypt.compare(currentPassword, user.password);

      if (!isCurrentValid) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      user.tokenVersion = Number(user.tokenVersion || 0) + 1;
      passwordChanged = true;
    }

    // Update preferences if provided
    if (req.body?.preferences) {
      const {
        emailNotifications,
        whatsappNotifications,
        whatsappNumber,
        urgentOnlyMode,
      } = req.body.preferences;

      if (whatsappNotifications && (!whatsappNumber || String(whatsappNumber).trim() === "")) {
        return res.status(400).json({ message: "WhatsApp number is required to enable WhatsApp notifications" });
      }

      if (!user.preferences) user.preferences = {};
      
      if (typeof emailNotifications === "boolean") user.preferences.emailNotifications = emailNotifications;
      if (typeof whatsappNotifications === "boolean") user.preferences.whatsappNotifications = whatsappNotifications;
      if (typeof urgentOnlyMode === "boolean") user.preferences.urgentOnlyMode = urgentOnlyMode;
      if (whatsappNumber !== undefined) user.preferences.whatsappNumber = String(whatsappNumber).trim();
    }

    await user.save();

    const response = {
      message: "Profile updated successfully",
      user: sanitizeUser(user),
    };

    if (passwordChanged) response.token = createToken(user);
    res.json(response);
  } catch (err) {
    console.log("Profile update error:", err.message);
    res.status(500).json({ message: "Failed to update profile" });
  }
});
// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const responseMessage =
      "If an account exists for this email, password reset instructions have been sent.";
    const resetToken = crypto.randomBytes(32).toString("hex");
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ message: responseMessage });
    }

    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"TrackIt App" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: "TrackIt Password Reset",
        html: `
          <h1>You requested a password reset</h1>
          <p>Please click on the following link, or paste it into your browser to complete the process:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        `,
      };

      transporter.sendMail(mailOptions).catch((error) => {
        console.error("Password reset email could not be sent.", {
          errorName: error.name || "Error",
          errorCode: error.code || undefined,
        });
      });
    } else {
      console.info("Password reset requested. SMTP is not configured.");
    }

    return res.status(200).json({ message: responseMessage });
  } catch (err) {
    console.error("Password reset request failed.", {
      errorName: err.name || "Error",
      errorCode: err.code || undefined,
    });
    res.status(500).json({ message: "Unable to process the password reset request." });
  }
});

// POST /api/auth/reset-password/:token
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired." });
    }

    user.password = await bcrypt.hash(password, 10);
    user.tokenVersion = Number(user.tokenVersion || 0) + 1;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Your password has been successfully reset. You can now login." });
  } catch (err) {
    console.log("Reset password error:", err.message);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

module.exports = router;
