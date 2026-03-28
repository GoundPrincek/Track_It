const express = require("express");
const router = express.Router();
const Todo = require("../models/Todo");

const getSmartStatus = (progress) => {
  const safeProgress = Math.max(0, Math.min(100, Number(progress) || 0));

  if (safeProgress >= 100) {
    return { progress: 100, status: "completed", completed: true };
  }

  if (safeProgress > 0) {
    return { progress: safeProgress, status: "in-progress", completed: false };
  }

  return { progress: 0, status: "pending", completed: false };
};

// GET ALL TODOS
router.get("/", async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    console.log("Get todos error:", err.message);
    res.status(500).json({ message: "Failed to fetch todos" });
  }
});

// CREATE TODO
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      deadline,
      workDate,
      startTime,
      endTime,
      progress,
      priority,
      category,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const smart = getSmartStatus(progress);

    const newTodo = new Todo({
      title: title.trim(),
      description: description || "",
      deadline: deadline || null,
      workDate: workDate || "",
      startTime: startTime || "",
      endTime: endTime || "",
      progress: smart.progress,
      priority: priority || "medium",
      category: category || "productivity",
      status: smart.status,
      completed: smart.completed,
    });

    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    console.log("Create todo error:", err.message);
    res.status(500).json({ message: "Failed to create todo" });
  }
});

// UPDATE TODO
router.put("/:id", async (req, res) => {
  try {
    const {
      title,
      description,
      deadline,
      workDate,
      startTime,
      endTime,
      progress,
      priority,
      category,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const smart = getSmartStatus(progress);

    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        description: description || "",
        deadline: deadline || null,
        workDate: workDate || "",
        startTime: startTime || "",
        endTime: endTime || "",
        progress: smart.progress,
        priority: priority || "medium",
        category: category || "productivity",
        status: smart.status,
        completed: smart.completed,
      },
      { new: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(updatedTodo);
  } catch (err) {
    console.log("Update todo error:", err.message);
    res.status(500).json({ message: "Failed to update todo" });
  }
});

// COMPLETE TODO
router.patch("/:id/complete", async (req, res) => {
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      {
        progress: 100,
        status: "completed",
        completed: true,
      },
      { new: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(updatedTodo);
  } catch (err) {
    console.log("Complete todo error:", err.message);
    res.status(500).json({ message: "Failed to complete todo" });
  }
});

// SAVE REVIEW
router.patch("/:id/review", async (req, res) => {
  try {
    const { review, productivityScore, focusLevel, challenges, improvementPlan } =
      req.body;

    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      {
        review: review || "",
        productivityScore: Number(productivityScore) || 0,
        focusLevel: focusLevel || "",
        challenges: challenges || "",
        improvementPlan: improvementPlan || "",
      },
      { new: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(updatedTodo);
  } catch (err) {
    console.log("Save review error:", err.message);
    res.status(500).json({ message: "Failed to save review" });
  }
});

// DELETE TODO
router.delete("/:id", async (req, res) => {
  try {
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);

    if (!deletedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json({ message: "Todo deleted successfully" });
  } catch (err) {
    console.log("Delete todo error:", err.message);
    res.status(500).json({ message: "Failed to delete todo" });
  }
});

module.exports = router;