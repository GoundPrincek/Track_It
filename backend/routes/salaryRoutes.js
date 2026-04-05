const express = require("express");
const router = express.Router();
const Salary = require("../models/Salary");
const protect = require("../middleware/authMiddleware");

router.use(protect);

// GET latest salary for the logged-in user
router.get("/", async (req, res) => {
  try {
    const userId = req.user.userId;

    const latestSalary = await Salary.findOne({ user: userId }).sort({
      updatedAt: -1,
    });

    res.json(latestSalary || null);
  } catch (err) {
    console.log("Get salary error:", err.message);
    res.status(500).json({ message: "Failed to fetch salary" });
  }
});

// POST — upsert salary (update if exists, create if not)
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

    // Upsert: update the existing salary document for this user, or create one
    const salary = await Salary.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        salary: salaryValue,
        needs,
        wants,
        savings,
      },
      {
        new: true,       // return updated document
        upsert: true,    // create if not exists
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      message: "Salary saved successfully",
      data: salary,
    });
  } catch (err) {
    console.log("Save salary error:", err.message);
    res.status(500).json({ message: "Failed to save salary" });
  }
});

// PUT — update existing salary by ID
router.put("/:id", async (req, res) => {
  try {
    const userId = req.user.userId;
    const salaryValue = Number(req.body.salary);

    if (!salaryValue || salaryValue < 0) {
      return res.status(400).json({ message: "Valid salary is required" });
    }

    const needs = Math.round(salaryValue * 0.5);
    const wants = Math.round(salaryValue * 0.3);
    const savings = Math.round(salaryValue * 0.2);

    const updated = await Salary.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { salary: salaryValue, needs, wants, savings },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Salary record not found" });
    }

    res.json({
      message: "Salary updated successfully",
      data: updated,
    });
  } catch (err) {
    console.log("Update salary error:", err.message);
    res.status(500).json({ message: "Failed to update salary" });
  }
});

module.exports = router;