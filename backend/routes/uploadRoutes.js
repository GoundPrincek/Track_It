const express = require("express");
const multer = require("multer");
const csvParser = require("csv-parser");
const pdfParse = require("pdf-parse");
const { Readable } = require("stream");

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB
  },
});

const normalizeCsvRows = (rows) => {
  return rows.map((row) => {
    const normalized = {};

    Object.keys(row).forEach((key) => {
      const cleanKey = key.trim();
      const value = row[key];

      normalized[cleanKey] =
        typeof value === "string" ? value.trim() : value;
    });

    return normalized;
  });
};

router.post("/csv", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No CSV file uploaded.",
      });
    }

    const fileName = req.file.originalname.toLowerCase();
    const allowedMimeTypes = [
      "text/csv",
      "application/csv",
      "application/vnd.ms-excel",
      "text/plain",
    ];

    const isCsv =
      fileName.endsWith(".csv") || allowedMimeTypes.includes(req.file.mimetype);

    if (!isCsv) {
      return res.status(400).json({
        success: false,
        message: "Only CSV files are allowed.",
      });
    }

    const rows = [];
    const stream = Readable.from(req.file.buffer.toString("utf-8"));

    stream
      .pipe(csvParser())
      .on("data", (data) => {
        rows.push(data);
      })
      .on("end", () => {
        const normalizedRows = normalizeCsvRows(rows);
        const headers =
          normalizedRows.length > 0 ? Object.keys(normalizedRows[0]) : [];

        return res.status(200).json({
          success: true,
          type: "csv",
          fileName: req.file.originalname,
          rowCount: normalizedRows.length,
          headers,
          rows: normalizedRows,
          previewRows: normalizedRows.slice(0, 20),
          message: "CSV parsed successfully.",
        });
      })
      .on("error", (error) => {
        return res.status(500).json({
          success: false,
          message: "Failed to parse CSV file.",
          error: error.message,
        });
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while processing CSV.",
      error: error.message,
    });
  }
});

router.post("/pdf", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No PDF file uploaded.",
      });
    }

    const fileName = req.file.originalname.toLowerCase();
    const isPdf =
      fileName.endsWith(".pdf") || req.file.mimetype === "application/pdf";

    if (!isPdf) {
      return res.status(400).json({
        success: false,
        message: "Only PDF files are allowed.",
      });
    }

    const result = await pdfParse(req.file.buffer);
    const extractedText = (result.text || "").trim();

    return res.status(200).json({
      success: true,
      type: "pdf",
      fileName: req.file.originalname,
      pageCount: result.numpages || 0,
      text: extractedText,
      previewText: extractedText.slice(0, 3000),
      message: "PDF processed successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to extract text from PDF.",
      error: error.message,
    });
  }
});

module.exports = router;