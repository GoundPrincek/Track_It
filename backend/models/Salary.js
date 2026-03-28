const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema(
  {
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