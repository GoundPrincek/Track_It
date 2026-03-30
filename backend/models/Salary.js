const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    salary: {
      type: Number,
      required: true,
      min: 0,
    },
    needs: {
      type: Number,
      default: 0,
    },
    wants: {
      type: Number,
      default: 0,
    },
    savings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Salary", salarySchema);