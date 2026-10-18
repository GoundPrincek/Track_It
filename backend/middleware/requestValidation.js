const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EXPENSE_CATEGORIES = new Set([
  "want",
  "need",
  "saving",
  "uncategorized",
  "General",
  "Food",
  "Travel",
  "Bills",
  "Shopping",
  "Health",
  "Education",
]);

const isPlainObject = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isValidDate = (value) => {
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  if (typeof value !== "string" || !value.trim()) return false;

  const input = value.trim();
  const isoDate = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDate) {
    const date = new Date(`${input}T00:00:00.000Z`);
    return (
      date.getUTCFullYear() === Number(isoDate[1]) &&
      date.getUTCMonth() + 1 === Number(isoDate[2]) &&
      date.getUTCDate() === Number(isoDate[3])
    );
  }

  const date = new Date(input);
  return !Number.isNaN(date.getTime());
};

const isOptionalDate = (value) =>
  value === undefined || value === null || value === "" || isValidDate(value);

const isPositiveNumber = (value) => {
  if (!(typeof value === "number" || (typeof value === "string" && value.trim()))) {
    return false;
  }
  const number = Number(value);
  return Number.isFinite(number) && number > 0 && number <= Number.MAX_SAFE_INTEGER;
};

const isNonNegativeNumber = (value) => {
  if (!(typeof value === "number" || (typeof value === "string" && value.trim()))) {
    return false;
  }
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= Number.MAX_SAFE_INTEGER;
};

const validateRequest = (req, res, next) => {
  const errors = [];
  const body = isPlainObject(req.body) ? req.body : {};
  const path = req.path;
  const addError = (field, message) => errors.push({ field, message });
  const checkEmail = () => {
    if (typeof body.email !== "string" || !EMAIL_PATTERN.test(body.email.trim())) {
      addError("email", "A valid email address is required.");
    }
  };
  const checkPassword = (field = "password", optional = false) => {
    const value = body[field];
    if (optional && (value === undefined || value === "")) return;
    if (typeof value !== "string" || value.length < 6 || value.length > 256) {
      addError(field, "Password must be a string between 6 and 256 characters.");
    }
  };
  const checkExpense = ({ requireTitle = true, requireAmount = true, requireCategory = false } = {}) => {
    const title = body.title ?? body.description;
    if (
      requireTitle &&
      (typeof title !== "string" || !title.trim() || title.length > 300)
    ) {
      addError("title", "A non-empty title of at most 300 characters is required.");
    }
    if (requireAmount && !isPositiveNumber(body.amount)) {
      addError("amount", "Amount must be a finite positive number.");
    }
    if (body.date !== undefined && body.date !== null && body.date !== "" && !isValidDate(body.date)) {
      addError("date", "Date must be a valid date.");
    }
    if (
      requireCategory &&
      (typeof body.category !== "string" || !EXPENSE_CATEGORIES.has(body.category))
    ) {
      addError("category", "Please provide a valid expense category.");
    }
  };

  if (req.method === "POST" && path === "/api/auth/register") {
    checkEmail();
    checkPassword();
    if (typeof body.name !== "string" || !body.name.trim() || body.name.length > 100) {
      addError("name", "Name must be a non-empty string of at most 100 characters.");
    }
  } else if (
    req.method === "POST" &&
    (path === "/api/auth/login" || path === "/api/auth/forgot-password")
  ) {
    checkEmail();
    if (path.endsWith("/login")) checkPassword();
  } else if (req.method === "POST" && /^\/api\/auth\/reset-password\/[^/]+$/.test(path)) {
    const token = path.split("/").pop();
    if (!/^[a-f\d]{64}$/i.test(token)) addError("token", "Reset token is invalid.");
    checkPassword();
  } else if (req.method === "PUT" && path === "/api/auth/profile") {
    if (body.name !== undefined && (typeof body.name !== "string" || !body.name.trim() || body.name.length > 100)) {
      addError("name", "Name must be a non-empty string of at most 100 characters.");
    }
    checkPassword("currentPassword", true);
    checkPassword("newPassword", true);
    if (body.preferences !== undefined && !isPlainObject(body.preferences)) {
      addError("preferences", "Preferences must be an object.");
    }
  } else if (
    (path === "/api/salary" || /^\/api\/salary\/[^/]+$/.test(path)) &&
    ["POST", "PUT"].includes(req.method)
  ) {
    if (!isPositiveNumber(body.salary)) addError("salary", "Salary must be a finite positive number.");
    for (const field of ["needs", "wants", "savings"]) {
      if (body[field] !== undefined && !isNonNegativeNumber(body[field])) {
        addError(field, `${field} must be a finite non-negative number.`);
      }
    }
  } else if (path === "/api/expenses" && req.method === "POST") {
    checkExpense({ requireCategory: false });
    if (body.category !== undefined && !EXPENSE_CATEGORIES.has(body.category)) {
      addError("category", "Please provide a valid expense category.");
    }
  } else if (/^\/api\/expenses\/[^/]+\/category$/.test(path) && req.method === "PATCH") {
    if (typeof body.category !== "string" || !EXPENSE_CATEGORIES.has(body.category)) {
      addError("category", "Please provide a valid expense category.");
    }
  } else if (/^\/api\/expenses\/[^/]+$/.test(path) && req.method === "PATCH") {
    checkExpense({ requireCategory: true });
  } else if (path === "/api/expenses/import/save" && req.method === "POST") {
    if (!Array.isArray(body.transactions) || body.transactions.length === 0) {
      addError("transactions", "At least one imported transaction is required.");
    } else {
      body.transactions.forEach((item, index) => {
        if (!isPlainObject(item)) {
          addError(`transactions.${index}`, "Transaction must be an object.");
          return;
        }
        const title = item.description ?? item.title;
        if (typeof title !== "string" || !title.trim() || title.length > 300) {
          addError(`transactions.${index}.description`, "A valid description is required.");
        }
        if (!isPositiveNumber(item.amount)) {
          addError(`transactions.${index}.amount`, "Amount must be a finite positive number.");
        }
        if (!isValidDate(item.date)) {
          addError(`transactions.${index}.date`, "Date must be a valid date.");
        }
        if (item.category !== undefined && !EXPENSE_CATEGORIES.has(item.category)) {
          addError(`transactions.${index}.category`, "Please provide a valid expense category.");
        }
      });
    }
  } else if (
    (path === "/api/todos" && ["POST", "PUT"].includes(req.method)) ||
    (/^\/api\/todos\/[^/]+$/.test(path) && req.method === "PUT")
  ) {
    if (typeof body.title !== "string" || !body.title.trim() || body.title.length > 300) {
      addError("title", "A non-empty title of at most 300 characters is required.");
    }
    if (body.description !== undefined && (typeof body.description !== "string" || body.description.length > 5000)) {
      addError("description", "Description must be a string of at most 5000 characters.");
    }
    if (body.deadline !== undefined && !isOptionalDate(body.deadline)) {
      addError("deadline", "Deadline must be a valid date.");
    }
    if (body.workDate !== undefined && body.workDate !== "" && !isValidDate(body.workDate)) {
      addError("workDate", "Work date must be a valid date.");
    }
    if (body.progress !== undefined && (!isNonNegativeNumber(body.progress) || Number(body.progress) > 100)) {
      addError("progress", "Progress must be a number from 0 to 100.");
    }
    if (body.priority !== undefined && !["low", "medium", "high"].includes(body.priority)) {
      addError("priority", "Priority must be low, medium, or high.");
    }
    if (body.status !== undefined && !["pending", "in-progress", "completed"].includes(body.status)) {
      addError("status", "Status is invalid.");
    }
  } else if (/^\/api\/todos\/[^/]+\/review$/.test(path) && req.method === "PATCH") {
    if (body.productivityScore !== undefined && (!isNonNegativeNumber(body.productivityScore) || Number(body.productivityScore) > 10)) {
      addError("productivityScore", "Productivity score must be a number from 0 to 10.");
    }
    for (const field of ["review", "focusLevel", "challenges", "improvementPlan"]) {
      if (body[field] !== undefined && typeof body[field] !== "string") {
        addError(field, `${field} must be a string.`);
      }
    }
    if (body.focusLevel !== undefined && !["", "low", "medium", "high"].includes(body.focusLevel)) {
      addError("focusLevel", "Focus level is invalid.");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  return next();
};

module.exports = { isValidDate, validateRequest };
