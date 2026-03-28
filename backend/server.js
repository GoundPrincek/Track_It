const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const salaryRoutes = require("./routes/salaryRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const todoRoutes = require("./routes/todoRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("TrackIt API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/todos", todoRoutes);

mongoose
  .connect("mongodb://127.0.0.1:27017/trackit")
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(5000, "0.0.0.0", () => {
      console.log("Server running on http://192.168.0.103:5000");
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err.message);
  });