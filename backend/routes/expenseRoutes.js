const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Expense = require("../models/Expense");
const multer = require("multer");
const csvParser = require("csv-parser");
const pdfParse = require("pdf-parse");
const { Readable } = require("stream");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const CATEGORY_RULES = {
  want: [
    "zomato",
    "swiggy",
    "restaurant",
    "cafe",
    "movie",
    "netflix",
    "amazon",
    "myntra",
    "shopping",
    "entertainment",
  ],
  need: [
    "rent",
    "grocery",
    "groceries",
    "hospital",
    "medical",
    "fuel",
    "petrol",
    "electricity",
    "water",
    "internet",
    "school",
    "transport",
    "dinner essentials",
  ],
  saving: [
    "sip",
    "mutual fund",
    "investment",
    "fd",
    "rd",
    "ppf",
    "savings",
    "transfer to savings",
  ],
};

const IMPORT_CATEGORIES = ["want", "need", "saving", "uncategorized"];
const MANUAL_CATEGORIES = [
  "General",
  "Food",
  "Travel",
  "Bills",
  "Shopping",
  "Health",
  "Education",
];
const ALL_ALLOWED_CATEGORIES = [...IMPORT_CATEGORIES, ...MANUAL_CATEGORIES];

const normalizeText = (value) => String(value || "").trim().toLowerCase();

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

const cleanAmount = (value) => {
  if (value === undefined || value === null || value === "") return 0;

  const cleaned = String(value)
    .replace(/,/g, "")
    .replace(/[^\d.-]/g, "")
    .trim();

  const amount = Number(cleaned);

  if (Number.isNaN(amount)) return 0;

  return Math.abs(amount);
};

const normalizeDate = (value) => {
  if (!value) return new Date().toISOString().slice(0, 10);

  const raw = String(value).trim();

  const ddmmyyyy = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (ddmmyyyy) {
    const day = ddmmyyyy[1].padStart(2, "0");
    const month = ddmmyyyy[2].padStart(2, "0");
    const year = ddmmyyyy[3].length === 2 ? `20${ddmmyyyy[3]}` : ddmmyyyy[3];
    return `${year}-${month}-${day}`;
  }

  const yyyymmdd = raw.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (yyyymmdd) {
    const year = yyyymmdd[1];
    const month = yyyymmdd[2].padStart(2, "0");
    const day = yyyymmdd[3].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const directDate = new Date(raw);
  if (!Number.isNaN(directDate.getTime())) {
    return directDate.toISOString().slice(0, 10);
  }

  return new Date().toISOString().slice(0, 10);
};

const classifyTransaction = (description = "") => {
  const text = normalizeText(description);

  for (const keyword of CATEGORY_RULES.saving) {
    if (text.includes(keyword)) return "saving";
  }

  for (const keyword of CATEGORY_RULES.need) {
    if (text.includes(keyword)) return "need";
  }

  for (const keyword of CATEGORY_RULES.want) {
    if (text.includes(keyword)) return "want";
  }

  return "uncategorized";
};

const buildImportedTransaction = ({
  date,
  description,
  amount,
  source = "import",
}) => {
  const parsedAmount = cleanAmount(amount);

  if (!description || !String(description).trim()) return null;
  if (!parsedAmount || parsedAmount <= 0) return null;

  const suggestedCategory = classifyTransaction(description);

  return {
    id: `${source}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    date: normalizeDate(date),
    description: String(description).trim(),
    amount: parsedAmount,
    suggestedCategory,
    category: suggestedCategory,
    source,
  };
};

const detectCsvField = (row, possibleKeys = []) => {
  const rowKeys = Object.keys(row || {});
  const match = rowKeys.find((key) =>
    possibleKeys.includes(normalizeText(key))
  );
  return match || null;
};

const parseCsvBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    const results = [];

    Readable.from(buffer)
      .pipe(csvParser())
      .on("data", (row) => {
        results.push(row);
      })
      .on("end", () => {
        const imported = results
          .map((row) => {
            const dateKey = detectCsvField(row, [
              "date",
              "transaction date",
              "txn date",
              "posted date",
              "value date",
            ]);

            const descriptionKey = detectCsvField(row, [
              "description",
              "narration",
              "details",
              "remarks",
              "transaction details",
              "particulars",
              "merchant",
              "title",
            ]);

            const amountKey = detectCsvField(row, [
              "amount",
              "debit",
              "withdrawal",
              "transaction amount",
              "amt",
            ]);

            const date = dateKey ? row[dateKey] : "";
            const description = descriptionKey ? row[descriptionKey] : "";
            const amount = amountKey ? row[amountKey] : "";

            return buildImportedTransaction({
              date,
              description,
              amount,
              source: "csv",
            });
          })
          .filter(Boolean);

        resolve(imported);
      })
      .on("error", (error) => reject(error));
  });

const extractPdfText = async (buffer) => {
  const pdfData = await pdfParse(buffer);
  return String(pdfData?.text || "");
};

const parsePdfTextToTransactions = (text) => {
  const lines = String(text || "")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const transactions = [];

  for (const line of lines) {
    const dateMatch = line.match(
      /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})/
    );

    const amountMatches = line.match(/-?\d[\d,]*\.?\d{0,2}/g);

    if (!dateMatch || !amountMatches || amountMatches.length === 0) continue;

    const date = dateMatch[1];
    const amount = amountMatches[amountMatches.length - 1];

    let description = line.replace(dateMatch[0], "").trim();
    description = description.replace(amount, "").trim();
    description = description.replace(/\s{2,}/g, " ");

    if (!description) continue;

    const transaction = buildImportedTransaction({
      date,
      description,
      amount,
      source: "pdf",
    });

    if (transaction) {
      transactions.push(transaction);
    }
  }

  return transactions;
};

const summarizeImportedTransactions = (transactions = []) => {
  return transactions.reduce(
    (acc, item) => {
      const key = IMPORT_CATEGORIES.includes(item.category)
        ? item.category
        : "uncategorized";
      acc[key] += Number(item.amount || 0);
      return acc;
    },
    {
      want: 0,
      need: 0,
      saving: 0,
      uncategorized: 0,
      total: transactions.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      ),
    }
  );
};

const isBrokenPdfStructureError = (err) => {
  const message = String(err?.message || "").toLowerCase();
  const details = String(err?.details || "").toLowerCase();

  return (
    message.includes("bad xref entry") ||
    details.includes("bad xref entry") ||
    message.includes("xref") ||
    details.includes("xref") ||
    message.includes("invalid pdf structure") ||
    details.includes("invalid pdf structure") ||
    message.includes("could not find xref") ||
    details.includes("could not find xref")
  );
};

// GET ALL EXPENSES
router.get("/", async (req, res) => {
  try {
    const userId = ensureUserId(req, res);
    if (!userId) return;

    const expenses = await Expense.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(expenses);
  } catch (err) {
    console.log("Get expenses error:", err.message);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
});

// ADD EXPENSE
router.post("/", async (req, res) => {
  try {
    const userId = ensureUserId(req, res);
    if (!userId) return;

    const { title, amount, category, date } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (amount === undefined || amount === null || Number(amount) <= 0) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    const newExpense = new Expense({
      user: userId,
      title: title.trim(),
      amount: Number(amount),
      suggestedCategory: "",
      category: category || "General",
      date: date || Date.now(),
    });

    await newExpense.save();

    res.status(201).json({
      message: "Expense added successfully",
      expense: newExpense,
    });
  } catch (err) {
    console.log("Add expense error:", err.message);
    res.status(500).json({ message: "Failed to add expense" });
  }
});

// IMPORT CSV BANK STATEMENT
router.post("/import/csv", upload.single("file"), async (req, res) => {
  try {
    const userId = ensureUserId(req, res);
    if (!userId) return;

    if (!req.file) {
      return res.status(400).json({ message: "CSV file is required" });
    }

    const isCsv =
      req.file.mimetype === "text/csv" ||
      req.file.mimetype === "application/vnd.ms-excel" ||
      req.file.originalname.toLowerCase().endsWith(".csv");

    if (!isCsv) {
      return res.status(400).json({ message: "Please upload a valid CSV file" });
    }

    const transactions = await parseCsvBuffer(req.file.buffer);

    if (!transactions.length) {
      return res.status(400).json({
        message:
          "No valid transactions found in CSV. Please check the statement format.",
      });
    }

    return res.status(200).json({
      message: "CSV imported successfully",
      transactions,
      summary: summarizeImportedTransactions(transactions),
    });
  } catch (err) {
    console.log("CSV import error:", err.message);
    res.status(500).json({ message: "Failed to import CSV bank statement" });
  }
});

// IMPORT PDF BANK STATEMENT
router.post("/import/pdf", upload.single("file"), async (req, res) => {
  try {
    const userId = ensureUserId(req, res);
    if (!userId) return;

    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    const isPdf =
      req.file.mimetype === "application/pdf" ||
      req.file.originalname.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return res.status(400).json({ message: "Please upload a valid PDF file" });
    }

    const pdfText = await extractPdfText(req.file.buffer);

    if (!pdfText.trim()) {
      return res.status(400).json({
        message:
          "This PDF does not contain readable text. Try a text-based bank statement PDF or use CSV.",
      });
    }

    const transactions = parsePdfTextToTransactions(pdfText);

    if (!transactions.length) {
      return res.status(400).json({
        message:
          "Could not extract transaction rows from this PDF. Try a clearer bank statement PDF or use CSV for better accuracy.",
      });
    }

    return res.status(200).json({
      message: "PDF imported successfully",
      transactions,
      summary: summarizeImportedTransactions(transactions),
    });
  } catch (err) {
    console.log("PDF import error:", err);

    if (isBrokenPdfStructureError(err)) {
      return res.status(400).json({
        message:
          "This PDF seems damaged or uses an unsupported structure (bad XRef entry). Open it in Chrome/Adobe Reader and Save as PDF, then upload again. CSV import will usually work better.",
      });
    }

    return res.status(500).json({
      message: "Failed to import PDF bank statement",
    });
  }
});

// SAVE IMPORTED TRANSACTIONS TO EXPENSES
router.post("/import/save", async (req, res) => {
  try {
    const userId = ensureUserId(req, res);
    if (!userId) return;

    const transactions = Array.isArray(req.body?.transactions)
      ? req.body.transactions
      : [];

    if (!transactions.length) {
      return res.status(400).json({
        message: "No imported transactions provided to save",
      });
    }

    const validTransactions = transactions
      .map((item) => {
        const title = String(item?.description || item?.title || "").trim();
        const amount = cleanAmount(item?.amount);
        const date = normalizeDate(item?.date);
        const category = IMPORT_CATEGORIES.includes(item?.category)
          ? item.category
          : "uncategorized";
        const suggestedCategory = IMPORT_CATEGORIES.includes(item?.suggestedCategory)
          ? item.suggestedCategory
          : "uncategorized";

        if (!title || amount <= 0) return null;

        return {
          user: userId,
          title,
          amount: Number(amount),
          suggestedCategory,
          category,
          date,
        };
      })
      .filter(Boolean);

    if (!validTransactions.length) {
      return res.status(400).json({
        message: "No valid imported transactions found to save",
      });
    }

    const savedExpenses = await Expense.insertMany(validTransactions);

    return res.status(201).json({
      message: "Imported expenses saved successfully",
      expenses: savedExpenses,
      count: savedExpenses.length,
    });
  } catch (err) {
    console.log("Save imported expenses error:", err);
    return res.status(500).json({
      message: err?.message || "Failed to save imported expenses",
    });
  }
});

// DELETE ALL EXPENSES FOR LOGGED-IN USER
router.delete("/", async (req, res) => {
  try {
    const userId = ensureUserId(req, res);
    if (!userId) return;

    const result = await Expense.deleteMany({ user: userId });

    return res.status(200).json({
      message:
        result.deletedCount > 0
          ? `${result.deletedCount} expenses deleted successfully`
          : "No expenses found to delete",
      count: result.deletedCount,
    });
  } catch (err) {
    console.log("Delete all expenses error:", err.message);
    return res.status(500).json({
      message: "Failed to delete all expenses",
    });
  }
});

// UPDATE FULL EXPENSE
router.patch("/:id", async (req, res) => {
  try {
    const userId = ensureUserId(req, res);
    if (!userId) return;

    const { title, amount, category, date } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const cleanedAmount = cleanAmount(amount);

    if (!cleanedAmount || cleanedAmount <= 0) {
      return res.status(400).json({
        message: "Valid amount is required",
      });
    }

    if (!category || !ALL_ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Please provide a valid category",
      });
    }

    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      {
        title: String(title).trim(),
        amount: Number(cleanedAmount),
        category,
        date: normalizeDate(date),
      },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    return res.status(200).json({
      message: "Expense updated successfully",
      expense: updatedExpense,
    });
  } catch (err) {
    console.log("Update expense error:", err.message);
    return res.status(500).json({
      message: "Failed to update expense",
    });
  }
});

// UPDATE EXPENSE CATEGORY
router.patch("/:id/category", async (req, res) => {
  try {
    const userId = ensureUserId(req, res);
    if (!userId) return;

    const { category } = req.body;

    if (!category || !ALL_ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Please provide a valid category",
      });
    }

    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { category },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    return res.status(200).json({
      message: "Expense category updated successfully",
      expense: updatedExpense,
    });
  } catch (err) {
    console.log("Update expense category error:", err.message);
    return res.status(500).json({
      message: "Failed to update expense category",
    });
  }
});

// DELETE EXPENSE
router.delete("/:id", async (req, res) => {
  try {
    const userId = ensureUserId(req, res);
    if (!userId) return;

    const deletedExpense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.log("Delete expense error:", err.message);
    res.status(500).json({ message: "Failed to delete expense" });
  }
});

module.exports = router;