const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Salary = require("../models/Salary");

const getUserId = (req) => {
  const headerUserId = req.headers["x-user-id"];
  return String(headerUserId || "").trim();
};

const ensureUserId = (req, res) => {
  const userId = getUserId(req);

  if (!userId) {
    res.status(401).json({ message: "User not found. Please login again." });
    return null;
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(401).json({ message: "Invalid user session. Please login again." });
    return null;
  }

  return userId;
};

router.get("/", async (req, res) => {
  try {
    const userId = ensureUserId(req, res);
    if (!userId) return;

    const latestSalary = await Salary.findOne({ user: userId }).sort({
      createdAt: -1,
    });

    res.json(latestSalary || null);
  } catch (err) {
    console.log("Get salary error:", err.message);
    res.status(500).json({ message: "Failed to fetch salary" });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = ensureUserId(req, res);
    if (!userId) return;

    const salaryValue = Number(req.body.salary);

    if (!salaryValue || salaryValue < 0) {
      return res.status(400).json({ message: "Valid salary is required" });
    }

    const needs = Math.round(salaryValue * 0.5);
    const wants = Math.round(salaryValue * 0.3);
    const savings = Math.round(salaryValue * 0.2);

    const newSalary = new Salary({
      user: userId,
      salary: salaryValue,
      needs,
      wants,
      savings,
    });

    await newSalary.save();

    res.status(201).json({
      message: "Salary saved successfully",
      data: newSalary,
    });
  } catch (err) {
    console.log("Save salary error:", err.message);
    res.status(500).json({ message: "Failed to save salary" });
  }
});

module.exports = router;