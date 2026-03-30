const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Todo = require("../models/Todo");

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
    const userId = ensureUserId(req, res);
    if (!userId) return;

    const todos = await Todo.find({ user: userId }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    console.log("Get todos error:", err.message);
    res.status(500).json({ message: "Failed to fetch todos" });
  }
});

// CREATE TODO
router.post("/", async (req, res) => {
  try {
    const userId = ensureUserId(req, res);
    if (!userId) return;

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
      user: userId,
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
      sessionStartedAt: null,
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
    const userId = ensureUserId(req, res);
    if (!userId) return;

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

    const existingTodo = await Todo.findOne({ _id: req.params.id, user: userId });

    if (!existingTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    const smart = getSmartStatus(progress);

    existingTodo.title = title.trim();
    existingTodo.description = description || "";
    existingTodo.deadline = deadline || null;
    existingTodo.workDate = workDate || "";
    existingTodo.startTime = startTime || "";
    existingTodo.endTime = endTime || "";
    existingTodo.progress = smart.progress;
    existingTodo.priority = priority || "medium";
    existingTodo.category = category || "productivity";
    existingTodo.status = smart.status;
    existingTodo.completed = smart.completed;

    if (smart.completed) {
      existingTodo.sessionStartedAt = null;
    }

    await existingTodo.save();
    res.json(existingTodo);
  } catch (err) {
    console.log("Update todo error:", err.message);
    res.status(500).json({ message: "Failed to update todo" });
  }
});

// START TODO SESSION
router.patch("/:id/start-session", async (req, res) => {
  try {
    const userId = ensureUserId(req, res);
    if (!userId) return;

    const todo = await Todo.findOne({ _id: req.params.id, user: userId });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    if (Number(todo.progress || 0) >= 100 || todo.completed) {
      return res
        .status(400)
        .json({ message: "Completed goals cannot start a new session" });
    }

    todo.sessionStartedAt = new Date();
    todo.status = "in-progress";
    todo.completed = false;

    await todo.save();

    res.json({
      message: "Todo session started successfully",
      todo,
    });
  } catch (err) {
    console.log("Start todo session error:", err.message);
    res.status(500).json({ message: "Failed to start todo session" });
  }
});

// COMPLETE TODO
router.patch("/:id/complete", async (req, res) => {
  try {
    const userId = ensureUserId(req, res);
    if (!userId) return;

    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      {
        progress: 100,
        status: "completed",
        completed: true,
        sessionStartedAt: null,
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
    const userId = ensureUserId(req, res);
    if (!userId) return;

    const { review, productivityScore, focusLevel, challenges, improvementPlan } =
      req.body;

    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: userId },
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
    const userId = ensureUserId(req, res);
    if (!userId) return;

    const deletedTodo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

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