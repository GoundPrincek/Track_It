const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const multer = require("multer");
const csvParser = require("csv-parser");
const pdfParse = require("pdf-parse");
const { Readable } = require("stream");
const rateLimit = require("express-rate-limit");
const protect = require("../middleware/authMiddleware");

router.use(protect);

const importLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: "IMPORT_RATE_LIMIT",
    message: "Too many import attempts. Please try again later.",
  },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

const CATEGORY_RULES = {
  saving: [
    "sip",
    "systematic investment plan",
    "mutual fund",
    "mutualfund",
    "mf",
    "investment",
    "invest",
    "stock",
    "stocks",
    "equity",
    "etf",
    "nps",
    "ppf",
    "epf",
    "vpf",
    "fd",
    "fixed deposit",
    "rd",
    "recurring deposit",
    "bond",
    "bonds",
    "debenture",
    "gold bond",
    "sovereign gold bond",
    "ulip",
    "retirement",
    "retirement fund",
    "pension",
    "portfolio",
    "wealth",
    "savings",
    "saving",
    "save",
    "deposit to savings",
    "transfer to savings",
    "savings transfer",
    "sweep to savings",
    "sweep transfer",
    "pigmy",
    "emergency fund",
    "provident fund",
    "public provident fund",
    "rec deposit",
    "wealth creation",
    "goal based saving",
    "smallcase",
    "groww",
    "zerodha",
    "upstox",
    "angel one",
    "angel broking",
    "coin",
    "kite",
    "icici direct",
    "hdfc securities",
    "motilal oswal",
    "paytm money",
    "kuvera",
    "cams",
    "kfintech",
    "sbi mutual",
    "hdfc mutual",
    "axis mutual",
    "icici prudential",
    "kotak mutual",
    "nippon india mutual",
    "mirae asset",
    "franklin templeton",
    "uti mutual",
    "aditya birla sun life",
    "lic premium",
    "lic policy",
    "term insurance",
    "retirement corpus",
    "future fund",
  ],

  need: [
    "rent",
    "house rent",
    "flat rent",
    "room rent",
    "pg rent",
    "hostel rent",
    "maintenance",
    "society maintenance",
    "building maintenance",
    "electricity",
    "power bill",
    "electric bill",
    "water bill",
    "water charge",
    "water charges",
    "gas bill",
    "lpg",
    "indane",
    "bharat gas",
    "hp gas",
    "pipeline gas",
    "cylinder",
    "utility",
    "utilities",
    "broadband",
    "internet",
    "wifi",
    "wifi bill",
    "airtel fiber",
    "jio fiber",
    "act fibernet",
    "hathway",
    "bsnl broadband",
    "phone bill",
    "mobile bill",
    "mobile recharge",
    "recharge",
    "postpaid",
    "prepaid",
    "jio recharge",
    "airtel recharge",
    "vi recharge",
    "vodafone recharge",
    "idea recharge",
    "bsnl recharge",
    "grocery",
    "groceries",
    "grocery store",
    "supermarket",
    "mart",
    "dmart",
    "d mart",
    "reliance fresh",
    "big bazaar",
    "star bazaar",
    "spencer",
    "more supermarket",
    "nature basket",
    "kirana",
    "ration",
    "milk",
    "vegetable",
    "vegetables",
    "fruit",
    "fruits",
    "eggs",
    "rice",
    "atta",
    "dal",
    "daily needs",
    "essential",
    "essentials",
    "household",
    "cleaning supplies",
    "detergent",
    "toiletries",
    "sanitary",
    "napkin",
    "soap",
    "shampoo",
    "medical",
    "medicine",
    "medicines",
    "pharmacy",
    "chemist",
    "apollo pharmacy",
    "netmeds",
    "1mg",
    "tata 1mg",
    "medplus",
    "hospital",
    "clinic",
    "doctor",
    "diagnostic",
    "diagnostics",
    "lab test",
    "pathology",
    "scan center",
    "xray",
    "mri",
    "blood test",
    "healthcare",
    "ambulance",
    "health insurance",
    "mediclaim",
    "insurance premium",
    "fuel",
    "petrol",
    "diesel",
    "cng",
    "gas station",
    "hp petrol",
    "bharat petroleum",
    "bpcl",
    "indian oil",
    "ioc",
    "nayara",
    "transport",
    "public transport",
    "metro",
    "bus",
    "train",
    "railway",
    "irctc",
    "local train",
    "commute",
    "office commute",
    "cab to office",
    "school transport",
    "auto fare",
    "parking",
    "fastag",
    "fast tag",
    "toll",
    "school fee",
    "tuition fee",
    "college fee",
    "exam fee",
    "education fee",
    "books",
    "bookstore",
    "textbook",
    "notebook",
    "stationery",
    "uniform",
    "child fee",
    "daycare",
    "child care",
    "baby food",
    "diapers",
    "nanny",
    "loan emi",
    "emi",
    "home loan",
    "education loan",
    "personal loan emi",
    "car loan emi",
    "bill payment",
    "credit card bill",
    "property tax",
    "income tax",
    "municipal tax",
    "government fee",
    "passport fee",
    "aadhaar",
    "pan card fee",
    "registration fee",
    "repair",
    "home repair",
    "appliance repair",
    "plumber",
    "electrician",
    "car service",
    "bike service",
    "vehicle service",
    "tyre",
    "battery",
    "subscription essential",
    "internet essential",
  ],

  want: [
    "zomato",
    "swiggy",
    "uber eats",
    "eatclub",
    "food delivery",
    "restaurant",
    "restro",
    "cafe",
    "coffee",
    "tea shop",
    "bakery",
    "dessert",
    "ice cream",
    "dominos",
    "pizza hut",
    "burger king",
    "mcdonald",
    "kfc",
    "subway",
    "faasos",
    "behrouz",
    "barbeque nation",
    "starbucks",
    "barista",
    "chai point",
    "third wave coffee",
    "movie",
    "cinema",
    "pvr",
    "inox",
    "bookmyshow",
    "netflix",
    "prime video",
    "amazon prime",
    "disney",
    "hotstar",
    "spotify",
    "youtube premium",
    "apple music",
    "gaana",
    "jiosaavn",
    "sonyliv",
    "zee5",
    "subscription",
    "ott",
    "gaming",
    "game",
    "steam",
    "epic games",
    "playstation",
    "xbox",
    "nintendo",
    "game pass",
    "shopping",
    "amazon",
    "flipkart",
    "myntra",
    "ajio",
    "nykaa",
    "meesho",
    "snapdeal",
    "shopclues",
    "tatacliq",
    "firstcry",
    "lifestyle",
    "max fashion",
    "pantaloons",
    "h&m",
    "hm",
    "zara",
    "westside",
    "trends",
    "clothing",
    "fashion",
    "dress",
    "shirt",
    "jeans",
    "shoes",
    "sneakers",
    "watch",
    "perfume",
    "cosmetics",
    "makeup",
    "beauty",
    "salon",
    "spa",
    "parlour",
    "barber",
    "grooming",
    "gym",
    "fitness",
    "fitness club",
    "yoga",
    "dance class",
    "hobby",
    "concert",
    "event ticket",
    "trip",
    "travel booking",
    "vacation",
    "holiday",
    "resort",
    "hotel",
    "airbnb",
    "oyo",
    "makemytrip",
    "goibibo",
    "yatra",
    "booking.com",
    "cleartrip",
    "flight",
    "weekend",
    "outing",
    "party",
    "pub",
    "lounge",
    "gift",
    "gift shop",
    "electronics",
    "gadget",
    "gadgets",
    "headphones",
    "earbuds",
    "mobile accessory",
    "decor",
    "home decor",
    "furniture upgrade",
    "pet accessories",
    "pet toys",
    "snacks",
    "soft drink",
    "juice bar",
    "uber",
    "ola",
    "rapido",
    "cab",
    "taxi",
    "auto ride",
    "premium ride",
    "entertainment",
    "recreation",
    "luxury",
    "premium",
    "toy",
    "toys",
    "mall",
    "shopping mall",
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

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\s&/-]/g, " ")
    .replace(/\s+/g, " ");

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

const scoreCategory = (text, keywords) => {
  let score = 0;

  for (const keyword of keywords) {
    const normalizedKeyword = normalizeText(keyword);
    if (!normalizedKeyword) continue;

    if (text === normalizedKeyword) {
      score += 6;
      continue;
    }

    if (text.includes(` ${normalizedKeyword} `)) {
      score += 5;
      continue;
    }

    if (text.startsWith(`${normalizedKeyword} `) || text.endsWith(` ${normalizedKeyword}`)) {
      score += 4;
      continue;
    }

    if (text.includes(normalizedKeyword)) {
      score += 2;
    }
  }

  return score;
};

const classifyTransaction = (description = "") => {
  const rawText = normalizeText(description);
  const text = ` ${rawText} `;

  if (!rawText) return "uncategorized";

  const savingScore = scoreCategory(text, CATEGORY_RULES.saving);
  const needScore = scoreCategory(text, CATEGORY_RULES.need);
  const wantScore = scoreCategory(text, CATEGORY_RULES.want);

  if (savingScore === 0 && needScore === 0 && wantScore === 0) {
    return "uncategorized";
  }

  const maxScore = Math.max(savingScore, needScore, wantScore);

  if (savingScore === maxScore && savingScore > 0) return "saving";
  if (needScore === maxScore && needScore > 0) return "need";
  if (wantScore === maxScore && wantScore > 0) return "want";

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
              "transaction description",
              "merchant name",
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

const ensureSingleAllowedUpload = (req, res, expectedType) => {
  if (!req.file) {
    res.status(400).json({
      code: "FILE_MISSING",
      message: `${expectedType.toUpperCase()} file is required`,
    });
    return false;
  }

  const originalName = String(req.file.originalname || "").toLowerCase().trim();
  const mimeType = String(req.file.mimetype || "").toLowerCase().trim();

  if (expectedType === "csv") {
    const validCsvMimeTypes = [
      "text/csv",
      "application/csv",
      "application/vnd.ms-excel",
    ];

    const isCsv =
      originalName.endsWith(".csv") && validCsvMimeTypes.includes(mimeType);

    if (!isCsv) {
      res.status(400).json({
        code: "INVALID_CSV_FILE",
        message: "Please upload a valid CSV file under 5MB",
      });
      return false;
    }
  }

  if (expectedType === "pdf") {
    const isPdf = originalName.endsWith(".pdf") && mimeType === "application/pdf";

    if (!isPdf) {
      res.status(400).json({
        code: "INVALID_PDF_FILE",
        message: "Please upload a valid PDF file under 5MB",
      });
      return false;
    }
  }

  return true;
};

const runSingleUpload = (req, res, expectedType) =>
  new Promise((resolve, reject) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return reject({
              status: 400,
              code: "FILE_TOO_LARGE",
              message: "File is too large. Please upload a file under 5MB.",
            });
          }

          if (err.code === "LIMIT_FILE_COUNT") {
            return reject({
              status: 400,
              code: "TOO_MANY_FILES",
              message: "Please upload only one file at a time.",
            });
          }

          return reject({
            status: 400,
            code: "UPLOAD_ERROR",
            message: "Upload failed. Please try again with one valid file.",
          });
        }

        return reject({
          status: 500,
          code: "UPLOAD_ERROR",
          message: "Upload failed. Please try again.",
        });
      }

      if (!ensureSingleAllowedUpload(req, res, expectedType)) {
        return resolve(false);
      }

      return resolve(true);
    });
  });

// GET ALL EXPENSES
router.get("/", async (req, res) => {
  try {
    const userId = req.user.userId;

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
    const userId = req.user.userId;
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
      suggestedCategory: classifyTransaction(title),
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
router.post("/import/csv", importLimiter, async (req, res) => {
  try {
    const uploadPassed = await runSingleUpload(req, res, "csv");
    if (!uploadPassed) return;

    const transactions = await parseCsvBuffer(req.file.buffer);

    if (!transactions.length) {
      return res.status(400).json({
        code: "CSV_NO_TRANSACTIONS",
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
    console.log("CSV import error:", err.message || err);

    return res.status(err.status || 500).json({
      code: err.code || "CSV_IMPORT_FAILED",
      message: err.message || "Failed to import CSV bank statement",
    });
  }
});

// IMPORT PDF BANK STATEMENT
router.post("/import/pdf", importLimiter, async (req, res) => {
  try {
    const uploadPassed = await runSingleUpload(req, res, "pdf");
    if (!uploadPassed) return;

    const pdfText = await extractPdfText(req.file.buffer);

    if (!pdfText.trim()) {
      return res.status(400).json({
        code: "PDF_NO_TEXT",
        message:
          "This PDF does not contain readable text. Try a text-based bank statement PDF or use CSV.",
      });
    }

    const transactions = parsePdfTextToTransactions(pdfText);

    if (!transactions.length) {
      return res.status(400).json({
        code: "PDF_NO_TRANSACTIONS",
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
        code: "PDF_BROKEN_STRUCTURE",
        message:
          "This PDF seems damaged or uses an unsupported structure. Open it in Chrome or Adobe Reader, save it again as PDF, then upload again. CSV import usually works better.",
      });
    }

    return res.status(err.status || 500).json({
      code: err.code || "PDF_IMPORT_FAILED",
      message: err.message || "Failed to import PDF bank statement",
    });
  }
});

// SAVE IMPORTED TRANSACTIONS TO EXPENSES
router.post("/import/save", async (req, res) => {
  try {
    const userId = req.user.userId;

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
          : classifyTransaction(title);

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
    const userId = req.user.userId;

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
    const userId = req.user.userId;
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
        suggestedCategory: classifyTransaction(title),
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
    const userId = req.user.userId;
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
    const userId = req.user.userId;

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