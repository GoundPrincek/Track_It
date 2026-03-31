const express = require("express");
const router = express.Router();
const Salary = require("../models/Salary");
const protect = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", async (req, res) => {
  try {
    const userId = req.user.userId;

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
    const userId = req.user.userId;
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