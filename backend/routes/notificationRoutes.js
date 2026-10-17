const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const protect = require("../middleware/authMiddleware");

router.use(protect);

// GET all notifications for the logged-in user (newest first)
router.get("/", async (req, res) => {
  try {
    const userId = req.user.userId;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (err) {
    console.log("Get notifications error:", err.message);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

// GET unread count
router.get("/unread-count", async (req, res) => {
  try {
    const userId = req.user.userId;

    const count = await Notification.countDocuments({
      user: userId,
      isRead: false,
    });

    res.json({ count });
  } catch (err) {
    console.log("Unread count error:", err.message);
    res.status(500).json({ message: "Failed to fetch unread count" });
  }
});

// POST — create a new notification
router.post("/", async (req, res) => {
  try {
    const userId = req.user.userId;

    const { title, message, type, severity, link } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const notification = new Notification({
      user: userId,
      title: title.trim(),
      message: message.trim(),
      type: type || "system",
      severity: severity || "low",
      link: link || "",
    });

    await notification.save();

    res.status(201).json(notification);
  } catch (err) {
    console.log("Create notification error:", err.message);
    res.status(500).json({ message: "Failed to create notification" });
  }
});

// PATCH — mark ALL notifications as read
router.patch("/read-all", async (req, res) => {
  try {
    const userId = req.user.userId;

    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.log("Mark all read error:", err.message);
    res.status(500).json({ message: "Failed to mark all notifications as read" });
  }
});

// PATCH — mark a single notification as read
router.patch("/:id/read", async (req, res) => {
  try {
    const userId = req.user.userId;

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (err) {
    console.log("Mark read error:", err.message);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
});

// DELETE — clear all notifications for user
router.delete("/clear-all", async (req, res) => {
  try {
    const userId = req.user.userId;

    await Notification.deleteMany({ user: userId });

    res.json({ message: "All notifications cleared" });
  } catch (err) {
    console.log("Clear all notifications error:", err.message);
    res.status(500).json({ message: "Failed to clear notifications" });
  }
});

// DELETE — delete a single notification
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.user.userId;

    const deleted = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted" });
  } catch (err) {
    console.log("Delete notification error:", err.message);
    res.status(500).json({ message: "Failed to delete notification" });
  }
});

module.exports = router;
