import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  Wallet,
  Plus,
  Trash2,
  Receipt,
  TrendingUp,
  Layers3,
  Upload,
  FileSpreadsheet,
  FileText,
  Save,
  AlertTriangle,
  ShieldCheck,
  Target,
  Pencil,
  X,
  Check,
  Search,
  ArrowUpDown,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "../config/api";

function Expenses() {
  const API = `${API_BASE}/expenses`;
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
  const HISTORY_CATEGORIES = [...IMPORT_CATEGORIES, ...MANUAL_CATEGORIES];

  const fileInputRef = useRef(null);

  const emptyForm = {
    title: "",
    amount: "",
    category: "General",
    date: "",
  };

  const emptyEditForm = {
    title: "",
    amount: "",
    category: "General",
    date: "",
  };

  const [expenses, setExpenses] = useState([]);
  const [salaryData, setSalaryData] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [deletingAllExpenses, setDeletingAllExpenses] = useState(false);

  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [updatingExpenseId, setUpdatingExpenseId] = useState(null);

  const [historySearch, setHistorySearch] = useState("");
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState("all");
  const [historySort, setHistorySort] = useState("latest");

  const [importFile, setImportFile] = useState(null);
  const [importType, setImportType] = useState("csv");
  const [importLoading, setImportLoading] = useState(false);
  const [importSaving, setImportSaving] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const [importedTransactions, setImportedTransactions] = useState([]);
  const [showImportErrorModal, setShowImportErrorModal] = useState(false);
  const [importErrorDetails, setImportErrorDetails] = useState({
    title: "",
    message: "",
    tips: [],
  });

  const [pageMessage, setPageMessage] = useState({
    type: "",
    text: "",
  });
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const fetchExpensesAndSalary = async () => {
    try {
      setLoading(true);

      const results = await Promise.allSettled([
        axios.get(API),
        axios.get(`${API_BASE}/salary`),
      ]);

      const expenseRes = results[0];
      const salaryRes = results[1];

      setExpenses(
        expenseRes.status === "fulfilled" && Array.isArray(expenseRes.value.data)
          ? expenseRes.value.data
          : []
      );

      setSalaryData(
        salaryRes.status === "fulfilled" ? salaryRes.value.data || null : null
      );
    } catch (err) {
      console.log("Expense/salary fetch error:", err);
      setExpenses([]);
      setSalaryData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpensesAndSalary();
  }, []);

  useEffect(() => {
    if (!pageMessage.text) return;

    const timer = setTimeout(() => {
      setPageMessage({ type: "", text: "" });
    }, 2800);

    return () => clearTimeout(timer);
  }, [pageMessage]);

  const getImportErrorContent = (error) => {
    const status = error?.response?.status;
    const code = error?.response?.data?.code;
    const message =
      error?.response?.data?.message || "Failed to import bank statement";

    if (status === 401) {
      return {
        title: "Login expired",
        message: "Your session is no longer valid. Please login again and retry.",
        tips: ["Login again", "Then retry the action"],
      };
    }

    if (code === "FILE_MISSING") {
      return {
        title: "No file selected",
        message,
        tips: ["Choose one CSV or PDF file", "Then click Import Statement again"],
      };
    }

    if (code === "FILE_TOO_LARGE") {
      return {
        title: "File is too large",
        message,
        tips: ["Upload a file smaller than 5MB", "Try exporting a shorter statement range"],
      };
    }

    if (code === "TOO_MANY_FILES") {
      return {
        title: "Too many files selected",
        message,
        tips: ["Select only one file", "Remove extra files and retry"],
      };
    }

    if (code === "INVALID_CSV_FILE" || code === "INVALID_PDF_FILE") {
      return {
        title: "Invalid file type",
        message,
        tips: ["Use only .csv for CSV upload", "Use only .pdf for PDF upload"],
      };
    }

    if (code === "PDF_BROKEN_STRUCTURE") {
      return {
        title: "Damaged or unsupported PDF",
        message,
        tips: [
          "Open the PDF in Chrome or Adobe Reader",
          "Use Save As PDF and upload the new file",
          "CSV format usually works better",
        ],
      };
    }

    if (code === "PDF_NO_TEXT") {
      return {
        title: "Unreadable PDF",
        message,
        tips: [
          "Use a text-based PDF statement",
          "Avoid scanned image-only PDFs",
          "Use CSV if available",
        ],
      };
    }

    if (code === "PDF_NO_TRANSACTIONS" || code === "CSV_NO_TRANSACTIONS") {
      return {
        title: "No valid transactions found",
        message,
        tips: [
          "Check the bank statement format",
          "Try a cleaner export",
          "Use CSV for better accuracy",
        ],
      };
    }

    if (code === "IMPORT_RATE_LIMIT") {
      return {
        title: "Too many upload attempts",
        message,
        tips: [
          "Wait a few minutes before retrying",
          "Check the file before uploading again",
        ],
      };
    }

    if (code === "NO_IMPORTED_TRANSACTIONS") {
      return {
        title: "Nothing to save",
        message,
        tips: [
          "Import a statement first",
          "Then review the imported transactions before saving",
        ],
      };
    }

    if (
      message.toLowerCase().includes("no valid imported transactions found")
    ) {
      return {
        title: "No valid imported data to save",
        message,
        tips: [
          "Check if imported rows have description and amount",
          "Re-import a cleaner bank statement",
          "Try CSV for better parsing",
        ],
      };
    }

    if (
      message.toLowerCase().includes("no imported transactions provided")
    ) {
      return {
        title: "Missing imported transactions",
        message,
        tips: [
          "Import the statement again",
          "Make sure preview data is visible before saving",
        ],
      };
    }

    if (message.toLowerCase().includes("failed to save imported expenses")) {
      return {
        title: "Save failed",
        message,
        tips: [
          "Try saving again",
          "Refresh the page if needed",
          "Re-import the statement if the preview was cleared",
        ],
      };
    }

    return {
      title: "Action failed",
      message,
      tips: [
        "Check the data and try again",
        "Retry after a moment",
      ],
    };
  };

  const openImportErrorModal = (error) => {
    const details = getImportErrorContent(error);
    setImportErrorDetails(details);
    setShowImportErrorModal(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEditFormChange = (e) => {
    setEditForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();

    try {
      if (!form.title.trim()) {
        setPageMessage({ type: "error", text: "Enter expense title" });
        return;
      }

      if (!form.amount || Number(form.amount) <= 0) {
        setPageMessage({ type: "error", text: "Enter valid amount" });
        return;
      }

      const payload = {
        title: form.title.trim(),
        amount: Number(form.amount),
        category: form.category || "General",
        date: form.date || Date.now(),
      };

      const res = await axios.post(API, payload);
      setPageMessage({
        type: "success",
        text: res.data.message || "Expense added successfully",
      });
      setForm(emptyForm);
      fetchExpensesAndSalary();
    } catch (err) {
      console.log("Add expense error:", err);
      setPageMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to add expense",
      });
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await axios.delete(`${API}/${id}`);
      setExpenses((prev) => prev.filter((item) => item._id !== id));
      setPageMessage({
        type: "success",
        text: "Expense deleted successfully",
      });
    } catch (err) {
      console.log("Delete expense error:", err);
      setPageMessage({
        type: "error",
        text: "Failed to delete expense",
      });
    }
  };

  const handleDeleteAllExpenses = async () => {
    try {
      if (!expenses.length) {
        setPageMessage({
          type: "error",
          text: "No expenses available to delete",
        });
        return;
      }

      setDeletingAllExpenses(true);

      const res = await axios.delete(API);

      setExpenses([]);
      setEditingExpenseId(null);
      setEditForm(emptyEditForm);
      setShowDeleteAllConfirm(false);

      setPageMessage({
        type: "success",
        text: res.data?.message || "All expenses deleted successfully",
      });
    } catch (err) {
      console.log("Delete all expenses error:", err);
      setPageMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to delete all expenses",
      });
    } finally {
      setDeletingAllExpenses(false);
    }
  };

  const startEditExpense = (item) => {
    setEditingExpenseId(item._id);
    setEditForm({
      title: item.title || "",
      amount: item.amount || "",
      category: item.category || "General",
      date: item.date ? String(item.date).slice(0, 10) : "",
    });
  };

  const cancelEditExpense = () => {
    setEditingExpenseId(null);
    setEditForm(emptyEditForm);
  };

  const handleSaveExpense = async (id) => {
    try {
      if (!editForm.title.trim()) {
        setPageMessage({ type: "error", text: "Title is required" });
        return;
      }

      if (!editForm.amount || Number(editForm.amount) <= 0) {
        setPageMessage({ type: "error", text: "Enter valid amount" });
        return;
      }

      setUpdatingExpenseId(id);

      const res = await axios.patch(`${API}/${id}`, {
        title: editForm.title.trim(),
        amount: Number(editForm.amount),
        category: editForm.category,
        date: editForm.date || new Date().toISOString().slice(0, 10),
      });

      const updatedExpense = res.data?.expense;

      if (updatedExpense) {
        setExpenses((prev) =>
          prev.map((item) => (item._id === id ? updatedExpense : item))
        );
      }

      setEditingExpenseId(null);
      setEditForm(emptyEditForm);
      setPageMessage({
        type: "success",
        text: "Expense updated successfully",
      });
    } catch (err) {
      console.log("Update expense error:", err);
      setPageMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update expense",
      });
    } finally {
      setUpdatingExpenseId(null);
    }
  };

  const handleImportFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImportFile(file);
    setImportError("");
    setImportSuccess("");
    setShowImportErrorModal(false);

    if (!file) return;

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".pdf")) {
      setImportType("pdf");
    } else {
      setImportType("csv");
    }
  };

  const handleImportStatement = async () => {
    try {
      if (!importFile) {
        const customError = {
          response: {
            status: 400,
            data: {
              code: "FILE_MISSING",
              message: "Please choose a CSV or PDF file first.",
            },
          },
        };

        setImportError("Please choose a CSV or PDF file first.");
        openImportErrorModal(customError);
        return;
      }

      const fileName = importFile.name.toLowerCase();
      const detectedType = fileName.endsWith(".pdf") ? "pdf" : "csv";

      setImportLoading(true);
      setImportError("");
      setImportSuccess("");
      setImportType(detectedType);
      setShowImportErrorModal(false);

      const formData = new FormData();
      formData.append("file", importFile);

      const res = await axios.post(`${API}/import/${detectedType}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setImportedTransactions(
        Array.isArray(res.data?.transactions) ? res.data.transactions : []
      );
      setImportSuccess(
        res.data?.message ||
          "Bank statement imported successfully. Review and save the imported expenses."
      );
    } catch (err) {
      console.log("Import error:", err);
      setImportedTransactions([]);
      setImportError(
        err.response?.data?.message || "Failed to import bank statement"
      );
      openImportErrorModal(err);
    } finally {
      setImportLoading(false);
    }
  };

  const handleImportedCategoryChange = (id, value) => {
    setImportedTransactions((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              category: value,
            }
          : item
      )
    );
  };

  const handleSaveImportedExpenses = async () => {
    try {
      if (!importedTransactions.length) {
        const customError = {
          response: {
            status: 400,
            data: {
              code: "NO_IMPORTED_TRANSACTIONS",
              message: "No imported transactions available to save.",
            },
          },
        };

        setImportError("No imported transactions available to save.");
        openImportErrorModal(customError);
        return;
      }

      setImportSaving(true);
      setImportError("");
      setImportSuccess("");
      setShowImportErrorModal(false);

      const payload = {
        transactions: importedTransactions.map((item) => ({
          description: item.description,
          amount: item.amount,
          date: item.date,
          category: item.category,
          suggestedCategory: item.suggestedCategory,
        })),
      };

      const res = await axios.post(`${API}/import/save`, payload);

      const savedExpenses = Array.isArray(res.data?.expenses)
        ? res.data.expenses
        : [];

      if (savedExpenses.length > 0) {
        setExpenses((prev) => [...savedExpenses, ...prev]);
      } else {
        await fetchExpensesAndSalary();
      }

      setImportSuccess(
        res.data?.message ||
          `${res.data?.count || importedTransactions.length} imported expenses saved successfully`
      );

      setImportedTransactions([]);
      setImportFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.log("Save imported expenses error:", err);

      setImportError(
        err.response?.data?.message || "Failed to save imported expenses"
      );
      openImportErrorModal(err);
    } finally {
      setImportSaving(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  const formatDate = (value) => {
    if (!value) return "Not set";
    try {
      return new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return value;
    }
  };

  const getCategoryTheme = (rawCategory) => {
    const category = String(rawCategory || "").toLowerCase();

    if (category === "need") {
      return {
        badgeClass:
          "border-[var(--border-soft)] bg-[var(--status-neutral-bg)] text-[var(--color-needs)]",
        valueClass: "text-[var(--color-needs)]",
      };
    }

    if (category === "want") {
      return {
        badgeClass:
          "border-[var(--border-soft)] bg-[var(--status-warm-bg)] text-[var(--color-wants)]",
        valueClass: "text-[var(--color-wants)]",
      };
    }

    if (category === "saving") {
      return {
        badgeClass:
          "border-[var(--border-soft)] bg-[var(--status-success-bg)] text-[var(--color-savings)]",
        valueClass: "text-[var(--color-savings)]",
      };
    }

    if (category === "uncategorized") {
      return {
        badgeClass:
          "border-[var(--border-soft)] bg-[var(--panel-4)] text-[var(--text-primary)]",
        valueClass: "text-[var(--text-primary)]",
      };
    }

    return {
      badgeClass:
        "border-[var(--border-soft)] bg-[var(--panel-4)] text-[var(--text-primary)]",
        valueClass: "text-[var(--text-primary)]",
    };
  };

  const salaryAmount = Number(salaryData?.salary || 0);
  const wantsLimit = Number(salaryData?.wants || 0);
  const needsLimit = Number(salaryData?.needs || 0);
  const savingsTarget = Number(salaryData?.savings || 0);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [expenses]);

  const totalEntries = expenses.length;

  const topCategory = useMemo(() => {
    if (!expenses.length) return "No data";

    const totals = {};
    expenses.forEach((item) => {
      const category = item.category || "General";
      totals[category] = (totals[category] || 0) + Number(item.amount || 0);
    });

    let best = "No data";
    let max = 0;

    Object.keys(totals).forEach((category) => {
      if (totals[category] > max) {
        max = totals[category];
        best = category;
      }
    });

    return best;
  }, [expenses]);

  const averageExpense = totalEntries
    ? Math.round(totalExpenses / totalEntries)
    : 0;

  const importedSummary = useMemo(() => {
    return importedTransactions.reduce(
      (acc, item) => {
        const category = IMPORT_CATEGORIES.includes(item.category)
          ? item.category
          : "uncategorized";
        acc[category] += Number(item.amount || 0);
        acc.total += Number(item.amount || 0);
        return acc;
      },
      {
        want: 0,
        need: 0,
        saving: 0,
        uncategorized: 0,
        total: 0,
      }
    );
  }, [importedTransactions]);

  const savedCategorySummary = useMemo(() => {
    return expenses.reduce(
      (acc, item) => {
        const category = IMPORT_CATEGORIES.includes(item.category)
          ? item.category
          : "uncategorized";
        acc[category] += Number(item.amount || 0);
        acc.total += Number(item.amount || 0);
        return acc;
      },
      {
        want: 0,
        need: 0,
        saving: 0,
        uncategorized: 0,
        total: 0,
      }
    );
  }, [expenses]);

  const hasTrackedSavedBudgetData = useMemo(() => {
    return (
      savedCategorySummary.want > 0 ||
      savedCategorySummary.need > 0 ||
      savedCategorySummary.saving > 0
    );
  }, [savedCategorySummary]);

  const hasTrackedImportBudgetData = useMemo(() => {
    return (
      importedSummary.want > 0 ||
      importedSummary.need > 0 ||
      importedSummary.saving > 0
    );
  }, [importedSummary]);

  const filteredExpenses = useMemo(() => {
    let items = [...expenses];

    const query = historySearch.trim().toLowerCase();

    if (query) {
      items = items.filter((item) =>
        String(item.title || "").toLowerCase().includes(query)
      );
    }

    if (historyCategoryFilter !== "all") {
      items = items.filter(
        (item) => String(item.category || "") === historyCategoryFilter
      );
    }

    if (historySort === "latest") {
      items.sort(
        (a, b) =>
          new Date(b.date || b.createdAt || 0) -
          new Date(a.date || a.createdAt || 0)
      );
    } else if (historySort === "oldest") {
      items.sort(
        (a, b) =>
          new Date(a.date || a.createdAt || 0) -
          new Date(b.date || b.createdAt || 0)
      );
    } else if (historySort === "highest") {
      items.sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0));
    } else if (historySort === "lowest") {
      items.sort((a, b) => Number(a.amount || 0) - Number(b.amount || 0));
    } else if (historySort === "title-az") {
      items.sort((a, b) =>
        String(a.title || "").localeCompare(String(b.title || ""))
      );
    }

    return items;
  }, [expenses, historySearch, historyCategoryFilter, historySort]);

  const buildBudgetWarnings = (summary, hasTrackedData) => {
    if (!salaryAmount || (!wantsLimit && !needsLimit && !savingsTarget)) {
      return [];
    }

    if (!hasTrackedData) {
      return [];
    }

    const warnings = [];

    if (wantsLimit > 0 && summary.want > wantsLimit) {
      warnings.push({
        key: "want",
        label: `Wants exceeded by ${formatCurrency(summary.want - wantsLimit)}`,
      });
    }

    if (needsLimit > 0 && summary.need > needsLimit) {
      warnings.push({
        key: "need",
        label: `Needs exceeded by ${formatCurrency(summary.need - needsLimit)}`,
      });
    }

    if (savingsTarget > 0 && summary.saving > 0 && summary.saving < savingsTarget) {
      warnings.push({
        key: "saving",
        label: `Savings target missed by ${formatCurrency(
          savingsTarget - summary.saving
        )}`,
      });
    }

    return warnings;
  };

  const savedBudgetWarnings = useMemo(
    () => buildBudgetWarnings(savedCategorySummary, hasTrackedSavedBudgetData),
    [
      savedCategorySummary,
      hasTrackedSavedBudgetData,
      salaryAmount,
      wantsLimit,
      needsLimit,
      savingsTarget,
    ]
  );

  const importBudgetWarnings = useMemo(
    () => buildBudgetWarnings(importedSummary, hasTrackedImportBudgetData),
    [
      importedSummary,
      hasTrackedImportBudgetData,
      salaryAmount,
      wantsLimit,
      needsLimit,
      savingsTarget,
    ]
  );

  const overviewCards = [
    {
      title: "Total Expenses",
      value: formatCurrency(totalExpenses),
      subtitle: "Overall spending",
      icon: Wallet,
      valueClass: "text-[var(--color-accent)]",
      iconSurface:
        "bg-[var(--status-neutral-bg)] text-[var(--color-accent)]",
    },
    {
      title: "Entries",
      value: totalEntries,
      subtitle: "Tracked records",
      icon: Receipt,
      valueClass: "text-[var(--text-primary)]",
      iconSurface:
        "bg-[var(--status-success-bg)] text-[var(--status-success-text)]",
    },
    {
      title: "Top Category",
      value: topCategory,
      subtitle: "Highest spend bucket",
      icon: Layers3,
      valueClass: "text-[var(--text-primary)]",
      iconSurface:
        "bg-[var(--status-neutral-bg)] text-[var(--text-primary)]",
    },
    {
      title: "Average Expense",
      value: formatCurrency(averageExpense),
      subtitle: "Per entry average",
      icon: TrendingUp,
      valueClass: "text-[var(--color-savings)]",
      iconSurface:
        "bg-[var(--status-success-bg)] text-[var(--status-success-text)]",
    },
  ];

  const importSummaryCards = [
    {
      title: "Wants",
      value: formatCurrency(importedSummary.want),
      subtitle: "Based on final selected category",
      valueClass: "text-[var(--color-wants)]",
    },
    {
      title: "Needs",
      value: formatCurrency(importedSummary.need),
      subtitle: "Editable by the user",
      valueClass: "text-[var(--color-needs)]",
    },
    {
      title: "Savings",
      value: formatCurrency(importedSummary.saving),
      subtitle: "Auto-detected suggestions",
      valueClass: "text-[var(--color-savings)]",
    },
    {
      title: "Uncategorized",
      value: formatCurrency(importedSummary.uncategorized),
      subtitle: "For unclear transactions",
      valueClass: "text-[var(--text-primary)]",
    },
  ];

  const sectionVariants = {
    hidden: { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const listVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14, scale: 0.985 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.28, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.985,
      transition: { duration: 0.2, ease: "easeInOut" },
    },
  };

  const cardHover = {
    y: -4,
    scale: 1.01,
    transition: { duration: 0.2, ease: "easeOut" },
  };

  const warningDotStyle = {
    backgroundColor: "var(--danger-text)",
    boxShadow: "0 0 0 4px color-mix(in srgb, var(--danger-text) 18%, transparent)",
  };

  return (
    <motion.div
      className="space-y-5"
      initial="hidden"
      animate="show"
      variants={listVariants}
    >
      <AnimatePresence>
        {showImportErrorModal ? (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="w-full max-w-lg rounded-[28px] border border-[var(--danger-border)] bg-[var(--panel-2)] p-5 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-[var(--danger-bg)] p-2.5 text-[var(--danger-text)]">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                      {importErrorDetails.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                      {importErrorDetails.message}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowImportErrorModal(false)}
                  className="rounded-xl p-2 text-[var(--text-muted)] transition hover:bg-[var(--panel-3)]"
                >
                  <X size={18} />
                </button>
              </div>

              {importErrorDetails.tips?.length ? (
                <div className="mt-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-3)] p-4">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    What you can do:
                  </p>
                  <div className="mt-3 space-y-2">
                    {importErrorDetails.tips.map((tip) => (
                      <div
                        key={tip}
                        className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                      >
                        <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent)]" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowImportErrorModal(false)}
                  className="theme-primary-btn inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium"
                >
                  Okay
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.section
        variants={sectionVariants}
        className="theme-hero overflow-hidden rounded-[24px] p-4 sm:rounded-[26px] sm:p-5 md:p-6"
      >
        <div className="grid items-start gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--panel-3)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              <span className="truncate">Daily spending management</span>
            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
              Expense Tracker
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] md:text-[15px]">
              Add, review, manage, and import your bank statement inside the
              same expense workspace with editable category suggestions.
            </p>
          </div>

          <motion.div
            whileHover={cardHover}
            className="theme-surface rounded-[22px] p-4 sm:rounded-[24px] sm:p-5"
          >
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              <TrendingUp size={14} />
              Spending Overview
            </div>

            <h2 className="break-words text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
              {formatCurrency(totalExpenses)}
            </h2>

            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              Total recorded expenses across {totalEntries} entries.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {(pageMessage.text || showDeleteAllConfirm) && (
        <div className="space-y-3">
          {pageMessage.text ? (
            <div
              className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm ${
                pageMessage.type === "error"
                  ? "border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)]"
                  : "border-[var(--border-soft)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
              }`}
            >
              {pageMessage.type === "error" ? (
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              ) : (
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              )}
              <span>{pageMessage.text}</span>
            </div>
          ) : null}

          {showDeleteAllConfirm ? (
            <div className="rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-4">
              <p className="text-sm font-medium text-[var(--danger-text)]">
                Delete all saved expenses? This action cannot be undone.
              </p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleDeleteAllExpenses}
                  disabled={deletingAllExpenses}
                  className="theme-danger-btn inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium disabled:opacity-60"
                >
                  <Trash2 size={16} />
                  {deletingAllExpenses ? "Deleting..." : "Yes, Delete All"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteAllConfirm(false)}
                  disabled={deletingAllExpenses}
                  className="theme-muted-btn inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium disabled:opacity-60"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      <motion.section
        variants={listVariants}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {overviewCards.map((card) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.title}
              variants={itemVariants}
              whileHover={cardHover}
              className="theme-surface-2 rounded-[22px] p-4 transition hover:border-[var(--border-strong)] hover:bg-[var(--panel-3)]"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <p className="text-sm text-[var(--text-secondary)]">
                  {card.title}
                </p>
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${card.iconSurface}`}
                >
                  <Icon size={18} />
                </div>
              </div>

              <h2
                className={`break-words text-xl font-semibold sm:text-2xl ${card.valueClass}`}
              >
                {card.value}
              </h2>
              <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                {card.subtitle}
              </p>
            </motion.div>
          );
        })}
      </motion.section>

      <motion.section
        variants={sectionVariants}
        whileHover={cardHover}
        className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5"
      >
        <div className="mb-5 flex items-start gap-3">
          <div className="rounded-2xl bg-[var(--status-success-bg)] p-2.5 text-[var(--status-success-text)]">
            <Upload size={18} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Import Bank Statement
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Upload a CSV or PDF statement. The system suggests categories, but
              you can change every imported transaction manually.
            </p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="theme-surface-3 rounded-[20px] p-4">
            <label className="mb-2 block text-sm text-[var(--text-soft)]">
              Choose CSV or PDF file
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,application/pdf,.pdf"
              onChange={handleImportFileChange}
              className="w-full rounded-2xl border px-4 py-3 text-sm file:mb-3 file:mr-0 file:block file:rounded-xl file:border-0 file:bg-[var(--accent)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white sm:file:mb-0 sm:file:mr-4 sm:file:inline-block"
            />

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
              <span className="theme-pill inline-flex items-center gap-2 rounded-full px-3 py-1.5">
                <FileSpreadsheet size={14} />
                CSV supported
              </span>

              <span className="theme-pill inline-flex items-center gap-2 rounded-full px-3 py-1.5">
                <FileText size={14} />
                PDF supported
              </span>

              {importFile ? (
                <span className="theme-pill max-w-full rounded-full px-3 py-1.5">
                  <span className="block max-w-full truncate">
                    Selected: {importFile.name}
                  </span>
                </span>
              ) : null}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <motion.button
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleImportStatement}
                disabled={importLoading}
                className="theme-primary-btn inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <Upload size={16} />
                {importLoading
                  ? `Importing ${importType.toUpperCase()}...`
                  : "Import Statement"}
              </motion.button>

              <motion.button
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleSaveImportedExpenses}
                disabled={importSaving || importedTransactions.length === 0}
                className="theme-muted-btn inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <Save size={16} />
                {importSaving ? "Saving..." : "Save Imported Expenses"}
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              {importError ? (
                <motion.div
                  key="import-error"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="theme-danger-btn mt-4 rounded-2xl px-4 py-3 text-sm"
                >
                  {importError}
                </motion.div>
              ) : null}

              {!importError && importSuccess ? (
                <motion.div
                  key="import-success"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--status-success-bg)] px-4 py-3 text-sm text-[var(--status-success-text)]"
                >
                  {importSuccess}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <motion.div
            variants={listVariants}
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2"
          >
            {importSummaryCards.map((card) => {
              const hasCardWarning =
                hasTrackedImportBudgetData &&
                ((card.title === "Wants" &&
                  wantsLimit > 0 &&
                  importedSummary.want > wantsLimit) ||
                  (card.title === "Needs" &&
                    needsLimit > 0 &&
                    importedSummary.need > needsLimit) ||
                  (card.title === "Savings" &&
                    savingsTarget > 0 &&
                    importedSummary.saving > 0 &&
                    importedSummary.saving < savingsTarget));

              return (
                <motion.div
                  key={card.title}
                  variants={itemVariants}
                  whileHover={{ y: -3 }}
                  className="theme-surface-3 relative rounded-[20px] p-4"
                >
                  {hasCardWarning ? (
                    <motion.span
                      className="absolute left-3 top-3 h-3.5 w-3.5 rounded-full"
                      style={warningDotStyle}
                      animate={{ opacity: [1, 0.25, 1], scale: [1, 1.15, 1] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    />
                  ) : null}

                  <p className="text-sm text-[var(--text-secondary)]">
                    {card.title}
                  </p>
                  <h3
                    className={`mt-1 break-words text-lg font-semibold sm:text-xl ${card.valueClass}`}
                  >
                    {card.value}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                    {card.subtitle}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      <AnimatePresence mode="wait">
        {salaryAmount > 0 ? (
          <motion.section
            key="warning-active"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5"
          >
            <div className="mb-5 flex items-start gap-3">
              <div className="rounded-2xl bg-[var(--status-neutral-bg)] p-2.5 text-[var(--color-accent)]">
                <Target size={18} />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Budget Alerts
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Track category limits against your current 50-30-20 salary split.
                </p>
              </div>
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              <motion.div
                whileHover={{ y: -3 }}
                className="theme-surface-3 relative rounded-[20px] p-4"
              >
                {hasTrackedSavedBudgetData &&
                savedCategorySummary.need > needsLimit &&
                needsLimit > 0 ? (
                  <motion.span
                    className="absolute left-3 top-3 h-3.5 w-3.5 rounded-full"
                    style={warningDotStyle}
                    animate={{ opacity: [1, 0.25, 1], scale: [1, 1.15, 1] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  />
                ) : null}
                <p className="text-sm text-[var(--text-secondary)]">Needs Limit</p>
                <h3 className="mt-1 text-lg font-semibold text-[var(--color-needs)] sm:text-xl">
                  {formatCurrency(needsLimit)}
                </h3>
              </motion.div>

              <motion.div
                whileHover={{ y: -3 }}
                className="theme-surface-3 relative rounded-[20px] p-4"
              >
                {hasTrackedSavedBudgetData &&
                savedCategorySummary.want > wantsLimit &&
                wantsLimit > 0 ? (
                  <motion.span
                    className="absolute left-3 top-3 h-3.5 w-3.5 rounded-full"
                    style={warningDotStyle}
                    animate={{ opacity: [1, 0.25, 1], scale: [1, 1.15, 1] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  />
                ) : null}
                <p className="text-sm text-[var(--text-secondary)]">Wants Limit</p>
                <h3 className="mt-1 text-lg font-semibold text-[var(--color-wants)] sm:text-xl">
                  {formatCurrency(wantsLimit)}
                </h3>
              </motion.div>

              <motion.div
                whileHover={{ y: -3 }}
                className="theme-surface-3 relative rounded-[20px] p-4"
              >
                {hasTrackedSavedBudgetData &&
                savedCategorySummary.saving > 0 &&
                savedCategorySummary.saving < savingsTarget &&
                savingsTarget > 0 ? (
                  <motion.span
                    className="absolute left-3 top-3 h-3.5 w-3.5 rounded-full"
                    style={warningDotStyle}
                    animate={{ opacity: [1, 0.25, 1], scale: [1, 1.15, 1] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  />
                ) : null}
                <p className="text-sm text-[var(--text-secondary)]">Savings Target</p>
                <h3 className="mt-1 text-lg font-semibold text-[var(--color-savings)] sm:text-xl">
                  {formatCurrency(savingsTarget)}
                </h3>
              </motion.div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <div className="theme-surface-3 relative rounded-[20px] p-4">
                {savedBudgetWarnings.length > 0 ? (
                  <motion.span
                    className="absolute left-3 top-3 h-3.5 w-3.5 rounded-full"
                    style={warningDotStyle}
                    animate={{ opacity: [1, 0.25, 1], scale: [1, 1.15, 1] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  />
                ) : null}

                <div className="mb-3 flex items-center gap-2">
                  <AlertTriangle
                    size={16}
                    className={
                      savedBudgetWarnings.length > 0
                        ? "text-[var(--danger-text)]"
                        : "text-[var(--status-success-text)]"
                    }
                  />
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    Saved Expenses Status
                  </h3>
                </div>

                {savedBudgetWarnings.length > 0 ? (
                  <motion.div
                    variants={listVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-3"
                  >
                    {savedBudgetWarnings.map((warning) => (
                      <motion.div
                        key={warning.key}
                        variants={itemVariants}
                        className="rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-sm font-medium text-[var(--danger-text)]"
                      >
                        {warning.label}
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-[var(--border-soft)] bg-[var(--status-success-bg)] px-4 py-3 text-sm text-[var(--status-success-text)]"
                  >
                    {hasTrackedSavedBudgetData
                      ? "All saved category totals are within the current budget limits."
                      : "No tracked needs, wants, or savings data yet for saved expenses."}
                  </motion.div>
                )}
              </div>

              <div className="theme-surface-3 relative rounded-[20px] p-4">
                {importBudgetWarnings.length > 0 ? (
                  <motion.span
                    className="absolute left-3 top-3 h-3.5 w-3.5 rounded-full"
                    style={warningDotStyle}
                    animate={{ opacity: [1, 0.25, 1], scale: [1, 1.15, 1] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  />
                ) : null}

                <div className="mb-3 flex items-center gap-2">
                  {importedTransactions.length > 0 ? (
                    <AlertTriangle
                      size={16}
                      className={
                        importBudgetWarnings.length > 0
                          ? "text-[var(--danger-text)]"
                          : "text-[var(--status-warm-text)]"
                      }
                    />
                  ) : (
                    <ShieldCheck
                      size={16}
                      className="text-[var(--status-success-text)]"
                    />
                  )}

                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    Imported Preview Status
                  </h3>
                </div>

                {importedTransactions.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-dashed border-[var(--border-soft)] bg-[var(--panel-3)] px-4 py-3 text-sm text-[var(--text-muted)]"
                  >
                    Import a statement to see wants, needs, and savings warnings before saving.
                  </motion.div>
                ) : importBudgetWarnings.length > 0 ? (
                  <motion.div
                    variants={listVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-3"
                  >
                    {importBudgetWarnings.map((warning) => (
                      <motion.div
                        key={warning.key}
                        variants={itemVariants}
                        className="rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-sm font-medium text-[var(--danger-text)]"
                      >
                        {warning.label}
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-[var(--border-soft)] bg-[var(--status-success-bg)] px-4 py-3 text-sm text-[var(--status-success-text)]"
                  >
                    {hasTrackedImportBudgetData
                      ? "Imported category totals are within the current budget limits."
                      : "Imported data does not yet include tracked needs, wants, or savings totals."}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="warning-empty"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5"
          >
            <div className="rounded-[20px] border border-dashed border-[var(--border-soft)] bg-[var(--panel-3)] p-5 text-sm text-[var(--text-muted)] sm:p-6">
              Add your salary first to enable wants, needs, and savings limit warnings.
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.section
        variants={sectionVariants}
        className="grid gap-4 xl:grid-cols-[1fr_1fr]"
      >
        <motion.div
          whileHover={cardHover}
          className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5"
        >
          <div className="mb-5 flex items-start gap-3">
            <div className="rounded-2xl bg-[var(--status-success-bg)] p-2.5 text-[var(--status-success-text)]">
              <Plus size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Add New Expense
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Record a new spending entry
              </p>
            </div>
          </div>

          <form onSubmit={handleAddExpense} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-[var(--text-soft)]">
                Title
              </label>
              <input
                type="text"
                name="title"
                placeholder="Expense title"
                value={form.title}
                onChange={handleChange}
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-[var(--text-soft)]">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={form.amount}
                onChange={handleChange}
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-[var(--text-soft)]">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              >
                {MANUAL_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-[var(--text-soft)]">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
              <motion.button
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="theme-primary-btn inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition sm:w-auto"
              >
                <Plus size={16} />
                Add Expense
              </motion.button>

              <motion.button
                whileHover={expenses.length ? { y: -2, scale: 1.01 } : {}}
                whileTap={expenses.length ? { scale: 0.98 } : {}}
                type="button"
                onClick={() => {
                  if (!expenses.length) {
                    setPageMessage({
                      type: "error",
                      text: "No expenses available to delete",
                    });
                    return;
                  }
                  setShowDeleteAllConfirm(true);
                  setPageMessage({ type: "", text: "" });
                }}
                disabled={deletingAllExpenses || expenses.length === 0}
                className="theme-danger-btn inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <Trash2 size={16} />
                {deletingAllExpenses ? "Deleting All..." : "Delete All Expenses"}
              </motion.button>
            </div>
          </form>
        </motion.div>

        <motion.div
          whileHover={cardHover}
          className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5"
        >
          <div className="mb-5 flex items-start gap-3">
            <div className="rounded-2xl bg-[var(--status-warm-bg)] p-2.5 text-[var(--status-warm-text)]">
              <Receipt size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Quick Summary
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                A compact view of spending status
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <motion.div
              whileHover={{ y: -3 }}
              className="theme-surface-3 rounded-[20px] p-4"
            >
              <p className="text-sm text-[var(--text-secondary)]">
                Total Spent
              </p>
              <h3 className="mt-1 break-words text-lg font-semibold text-[var(--color-accent)] sm:text-xl">
                {formatCurrency(totalExpenses)}
              </h3>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className="theme-surface-3 rounded-[20px] p-4"
            >
              <p className="text-sm text-[var(--text-secondary)]">
                Top Category
              </p>
              <h3 className="mt-1 break-words text-lg font-semibold text-[var(--text-primary)] sm:text-xl">
                {topCategory}
              </h3>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className="theme-surface-3 rounded-[20px] p-4"
            >
              <p className="text-sm text-[var(--text-secondary)]">
                Average Entry
              </p>
              <h3 className="mt-1 break-words text-lg font-semibold text-[var(--color-savings)] sm:text-xl">
                {formatCurrency(averageExpense)}
              </h3>
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

      <motion.section
        variants={sectionVariants}
        className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5"
      >
        <div className="mb-5 flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Expense History
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Search, filter, sort, and edit your saved expenses
              </p>
            </div>

            <div className="theme-pill w-fit rounded-full px-3 py-1.5 text-xs font-medium">
              {filteredExpenses.length} shown / {totalEntries} entries
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.3fr_0.8fr_0.8fr]">
            <motion.div
              whileHover={{ y: -2 }}
              className="theme-surface-3 rounded-[20px] p-3"
            >
              <label className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                <Search size={14} />
                Search
              </label>
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search by expense title"
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              />
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="theme-surface-3 rounded-[20px] p-3"
            >
              <label className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                <Layers3 size={14} />
                Filter Category
              </label>
              <select
                value={historyCategoryFilter}
                onChange={(e) => setHistoryCategoryFilter(e.target.value)}
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              >
                <option value="all">All Categories</option>
                {HISTORY_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="theme-surface-3 rounded-[20px] p-3"
            >
              <label className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                <ArrowUpDown size={14} />
                Sort
              </label>
              <select
                value={historySort}
                onChange={(e) => setHistorySort(e.target.value)}
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              >
                <option value="latest">Latest first</option>
                <option value="oldest">Oldest first</option>
                <option value="highest">Highest amount</option>
                <option value="lowest">Lowest amount</option>
                <option value="title-az">Title A-Z</option>
              </select>
            </motion.div>
          </div>
        </div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.8 }}
            className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[var(--border-soft)] bg-[var(--panel-3)] py-10 text-center"
          >
            <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[var(--border-soft)] border-t-[var(--accent)]"></div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Loading expenses...</p>
          </motion.div>
        ) : filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[var(--border-soft)] bg-[var(--panel-3)] py-10 text-center">
            <div className="mb-3 rounded-full bg-[var(--panel-4)] p-3 text-[var(--text-muted)]">
              <Search size={24} />
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">No expenses found</p>
            <p className="mt-1 max-w-[250px] text-xs text-[var(--text-muted)]">Try adjusting your filters, search query, or track a new expense above.</p>
          </div>
        ) : (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="grid gap-3"
          >
            <AnimatePresence>
              {filteredExpenses.map((item) => {
                const isEditing = editingExpenseId === item._id;
                const isUpdating = updatingExpenseId === item._id;
                const categoryTheme = getCategoryTheme(item.category);

                return (
                  <motion.div
                    key={item._id}
                    variants={itemVariants}
                    exit="exit"
                    layout
                    whileHover={{ y: -3, scale: 1.005 }}
                    className="theme-surface-3 rounded-[20px] p-4"
                  >
                    <AnimatePresence mode="wait">
                      {!isEditing ? (
                        <motion.div
                          key="view-mode"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="break-words text-base font-semibold text-[var(--text-primary)] sm:text-lg">
                                {item.title}
                              </h3>

                              <span
                                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${categoryTheme.badgeClass}`}
                              >
                                {item.category || "General"}
                              </span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-3 text-sm text-[var(--text-soft)]">
                              <span className="rounded-xl bg-[var(--panel-4)] px-3 py-1.5">
                                <b>Date:</b> {formatDate(item.date)}
                              </span>

                              <span className="rounded-xl bg-[var(--panel-4)] px-3 py-1.5">
                                <b>Amount:</b> {formatCurrency(item.amount || 0)}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <span className={`break-words text-base font-semibold ${categoryTheme.valueClass}`}>
                              {formatCurrency(item.amount || 0)}
                            </span>

                            <motion.button
                              whileHover={{ y: -2, scale: 1.01 }}
                              whileTap={{ scale: 0.98 }}
                              type="button"
                              onClick={() => startEditExpense(item)}
                              className="theme-muted-btn inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium sm:w-auto"
                            >
                              <Pencil size={16} />
                              Edit
                            </motion.button>

                            <motion.button
                              whileHover={{ y: -2, scale: 1.01 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleDeleteExpense(item._id)}
                              className="theme-danger-btn inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition sm:w-auto"
                            >
                              <Trash2 size={16} />
                              Delete
                            </motion.button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="edit-mode"
                          initial={{ opacity: 0, y: 8, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: -8, height: 0 }}
                          className="grid gap-4 overflow-hidden"
                        >
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                              <label className="mb-2 block text-sm text-[var(--text-soft)]">
                                Title
                              </label>
                              <input
                                type="text"
                                name="title"
                                value={editForm.title}
                                onChange={handleEditFormChange}
                                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-sm text-[var(--text-soft)]">
                                Amount
                              </label>
                              <input
                                type="number"
                                name="amount"
                                value={editForm.amount}
                                onChange={handleEditFormChange}
                                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-sm text-[var(--text-soft)]">
                                Category
                              </label>
                              <select
                                name="category"
                                value={editForm.category}
                                onChange={handleEditFormChange}
                                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                              >
                                {HISTORY_CATEGORIES.map((category) => (
                                  <option key={category} value={category}>
                                    {category}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="md:col-span-2">
                              <label className="mb-2 block text-sm text-[var(--text-soft)]">
                                Date
                              </label>
                              <input
                                type="date"
                                name="date"
                                value={editForm.date}
                                onChange={handleEditFormChange}
                                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row">
                            <motion.button
                              whileHover={{ y: -2, scale: 1.01 }}
                              whileTap={{ scale: 0.98 }}
                              type="button"
                              onClick={() => handleSaveExpense(item._id)}
                              disabled={isUpdating}
                              className="theme-primary-btn inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Check size={16} />
                              {isUpdating ? "Saving..." : "Save Changes"}
                            </motion.button>

                            <motion.button
                              whileHover={{ y: -2, scale: 1.01 }}
                              whileTap={{ scale: 0.98 }}
                              type="button"
                              onClick={cancelEditExpense}
                              disabled={isUpdating}
                              className="theme-muted-btn inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <X size={16} />
                              Cancel
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.section>
    </motion.div>
  );
}

export default Expenses;