const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    deadline: {
      type: Date,
      default: null,
    },
    workDate: {
      type: String,
      default: "",
      trim: true,
    },
    startTime: {
      type: String,
      default: "",
      trim: true,
    },
    endTime: {
      type: String,
      default: "",
      trim: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    category: {
      type: String,
      default: "productivity",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    review: {
      type: String,
      default: "",
      trim: true,
    },
    productivityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    focusLevel: {
      type: String,
      enum: ["low", "medium", "high", ""],
      default: "",
    },
    challenges: {
      type: String,
      default: "",
      trim: true,
    },
    improvementPlan: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Todo", todoSchema);