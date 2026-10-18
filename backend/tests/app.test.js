const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const mockUsers = new Map();
const mockExpenses = [];
const mockTodos = [];
const mockSalaries = [];
const mockNotifications = [];
let mockUserSequence = 0;

const mockMatches = (record, filter) =>
  Object.entries(filter).every(([key, expected]) => {
    if (key === "resetPasswordExpires" && expected?.$gt !== undefined) {
      return new Date(record[key]).getTime() > expected.$gt;
    }
    return String(record[key]) === String(expected);
  });

const mockQuery = (records, firstOnly = false) => {
  let maximum = Infinity;
  const values = () =>
    firstOnly ? records[0] || null : records.slice(0, maximum);
  const query = {
    sort() {
      return this;
    },
    limit(value) {
      maximum = value;
      return this;
    },
    lean() {
      return Promise.resolve(values());
    },
    then(resolve, reject) {
      return Promise.resolve(values()).then(resolve, reject);
    },
  };
  return query;
};

jest.mock("../models/User", () => {
  class MockUser {
    constructor(fields = {}) {
      Object.assign(this, fields);
      mockUserSequence += 1;
      this._id = fields._id || String(mockUserSequence).padStart(24, "0");
      this.tokenVersion = Number(fields.tokenVersion || 0);
      this.preferences = fields.preferences || {
        emailNotifications: true,
        whatsappNotifications: false,
        whatsappNumber: "",
        urgentOnlyMode: false,
      };
    }

    async save() {
      mockUsers.set(String(this._id), this);
      return this;
    }

    static async findOne(filter) {
      return [...mockUsers.values()].find((user) => mockMatches(user, filter)) || null;
    }

    static findById(id) {
      const user = mockUsers.get(String(id)) || null;
      return {
        select: async () => user,
        then(resolve, reject) {
          return Promise.resolve(user).then(resolve, reject);
        },
      };
    }
  }

  return MockUser;
});

jest.mock("../models/Expense", () => ({
  find: jest.fn((filter) =>
    mockQuery(mockExpenses.filter((record) => mockMatches(record, filter)))
  ),
  findOneAndDelete: jest.fn(async (filter) => {
    const index = mockExpenses.findIndex((record) => mockMatches(record, filter));
    return index < 0 ? null : mockExpenses.splice(index, 1)[0];
  }),
}));

jest.mock("../models/Todo", () => ({
  find: jest.fn((filter) =>
    mockQuery(mockTodos.filter((record) => mockMatches(record, filter)))
  ),
  findOneAndDelete: jest.fn(async (filter) => {
    const index = mockTodos.findIndex((record) => mockMatches(record, filter));
    return index < 0 ? null : mockTodos.splice(index, 1)[0];
  }),
}));

jest.mock("../models/Salary", () => ({
  findOne: jest.fn((filter) =>
    mockQuery(mockSalaries.filter((record) => mockMatches(record, filter)), true)
  ),
  findOneAndUpdate: jest.fn(async (filter, update) => {
    const record = mockSalaries.find((item) => mockMatches(item, filter));
    if (!record) return null;
    Object.assign(record, update);
    return record;
  }),
}));

jest.mock("../models/Notification", () => ({
  find: jest.fn((filter) =>
    mockQuery(mockNotifications.filter((record) => mockMatches(record, filter)))
  ),
  findOneAndDelete: jest.fn(async (filter) => {
    const index = mockNotifications.findIndex((record) => mockMatches(record, filter));
    return index < 0 ? null : mockNotifications.splice(index, 1)[0];
  }),
}));

jest.mock("pdf-parse", () =>
  jest.fn(() => Promise.reject(new Error("private parser implementation details")))
);

process.env.JWT_SECRET = "trackit-phase-one-test-secret";
process.env.SMTP_HOST = "";
process.env.SMTP_USER = "";

const request = require("supertest");
const User = require("../models/User");
const app = require("../app");

const USER_A_ID = "64b000000000000000000001";
const USER_B_ID = "64b000000000000000000002";
const EXPENSE_A_ID = "64c000000000000000000001";
const EXPENSE_B_ID = "64c000000000000000000002";
const TODO_A_ID = "64d000000000000000000001";
const TODO_B_ID = "64d000000000000000000002";
const SALARY_A_ID = "64e000000000000000000001";
const SALARY_B_ID = "64e000000000000000000002";
const NOTIFICATION_A_ID = "64f000000000000000000001";
const NOTIFICATION_B_ID = "64f000000000000000000002";

const createUser = async (fields) => {
  const user = new User({
    name: "TrackIt Test User",
    email: "test@example.com",
    password: "hashed-test-password",
    ...fields,
  });
  await user.save();
  return user;
};

const tokenFor = (user, options = {}) => {
  const claims = {
    userId: String(user._id),
    email: user.email,
  };
  if (options.includeVersion !== false) {
    claims.tokenVersion = Number(user.tokenVersion || 0);
  }
  return jwt.sign(claims, process.env.JWT_SECRET, options.jwt || {});
};

beforeEach(() => {
  mockUsers.clear();
  mockExpenses.splice(0);
  mockTodos.splice(0);
  mockSalaries.splice(0);
  mockNotifications.splice(0);
  mockUserSequence = 0;
  jest.clearAllMocks();
});

describe("authentication and input validation", () => {
  test("registers and logs in a user, then serves the protected profile", async () => {
    const registration = await request(app).post("/api/auth/register").send({
      name: "A TrackIt User",
      email: "new-user@example.com",
      password: "secure-pass-123",
    });

    expect(registration.status).toBe(201);
    expect(registration.body.user.password).toBeUndefined();

    const invalidLogin = await request(app).post("/api/auth/login").send({
      email: "new-user@example.com",
      password: "incorrect-password",
    });
    expect(invalidLogin.status).toBe(400);
    expect(invalidLogin.body.message).toBe("Invalid credentials");

    const login = await request(app).post("/api/auth/login").send({
      email: "new-user@example.com",
      password: "secure-pass-123",
    });

    expect(login.status).toBe(200);
    expect(login.body.token).toEqual(expect.any(String));

    const profile = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${login.body.token}`);

    expect(profile.status).toBe(200);
    expect(profile.body.user.email).toBe("new-user@example.com");
    expect(profile.body.user.password).toBeUndefined();
  });

  test("rejects missing, invalid, and expired JWTs on protected routes", async () => {
    const user = await createUser({ _id: USER_A_ID });
    const expiredToken = tokenFor(user, { jwt: { expiresIn: -1 } });

    const missing = await request(app).get("/api/todos");
    const invalid = await request(app)
      .get("/api/todos")
      .set("Authorization", "Bearer not-a-jwt");
    const expired = await request(app)
      .get("/api/todos")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(missing.status).toBe(401);
    expect(invalid.status).toBe(401);
    expect(expired.status).toBe(401);
  });

  test("accepts an existing seven-day token without a tokenVersion claim", async () => {
    const user = await createUser({ _id: USER_A_ID });
    const legacyToken = tokenFor(user, { includeVersion: false, jwt: { expiresIn: "7d" } });

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${legacyToken}`);

    expect(response.status).toBe(200);
  });

  test("rejects invalid registration email, password, expense amount/date, salary, and todo title", async () => {
    const invalidEmail = await request(app).post("/api/auth/register").send({
      name: "A User",
      email: "not-an-email",
      password: "secure-pass-123",
    });
    const shortPassword = await request(app).post("/api/auth/register").send({
      name: "A User",
      email: "valid@example.com",
      password: "short",
    });
    const invalidAmount = await request(app).post("/api/expenses").send({
      title: "Groceries",
      amount: -10,
      category: "Food",
    });
    const invalidDate = await request(app).post("/api/expenses").send({
      title: "Groceries",
      amount: 10,
      category: "Food",
      date: "2026-02-31",
    });
    const invalidSalary = await request(app).post("/api/salary").send({ salary: -1 });
    const invalidTodo = await request(app).post("/api/todos").send({ title: 42 });

    for (const response of [invalidEmail, shortPassword, invalidAmount, invalidDate, invalidSalary, invalidTodo]) {
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation failed");
      expect(response.body.errors.length).toBeGreaterThan(0);
    }
  });

  test("password changes invalidate old JWTs and return a replacement for the active session", async () => {
    const user = await createUser({
      _id: USER_A_ID,
      email: "password-change@example.com",
      password: await require("bcryptjs").hash("current-password", 10),
    });
    const oldToken = tokenFor(user, { jwt: { expiresIn: "7d" } });

    const update = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${oldToken}`)
      .send({
        name: user.name,
        currentPassword: "current-password",
        newPassword: "replacement-password",
      });

    expect(update.status).toBe(200);
    expect(update.body.token).toEqual(expect.any(String));
    expect(user.tokenVersion).toBe(1);

    const oldSession = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${oldToken}`);
    const newSession = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${update.body.token}`);

    expect(oldSession.status).toBe(401);
    expect(newSession.status).toBe(200);
  });

  test("forgot-password gives the same generic response and never logs a reset token", async () => {
    await createUser({ email: "known@example.com" });
    const infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});

    const known = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "known@example.com" });
    const unknown = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "unknown@example.com" });

    expect(known.status).toBe(200);
    expect(unknown.status).toBe(200);
    expect(known.body).toEqual(unknown.body);
    expect(known.body.message).toMatch(/if an account exists/i);
    expect(known.body.token).toBeUndefined();
    expect(infoSpy.mock.calls.flat().join(" ")).not.toMatch(/[a-f\d]{64}/i);

    infoSpy.mockRestore();
  });

  test("successful password reset invalidates previously issued tokens", async () => {
    const user = await createUser({
      _id: USER_A_ID,
      email: "reset@example.com",
      password: await require("bcryptjs").hash("current-password", 10),
    });
    const rawResetToken = "a".repeat(64);
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(rawResetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 60_000;
    await user.save();
    const oldToken = tokenFor(user);

    const reset = await request(app)
      .post(`/api/auth/reset-password/${rawResetToken}`)
      .send({ password: "new-password-123" });

    expect(reset.status).toBe(200);
    expect(reset.body.message).toMatch(/successfully reset/i);
    expect(user.tokenVersion).toBe(1);

    const oldSession = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${oldToken}`);
    expect(oldSession.status).toBe(401);
  });
});

describe("user-scoped resources and safe failures", () => {
  test("lists only the authenticated user's expenses, todos, salary, and notifications", async () => {
    const userA = await createUser({ _id: USER_A_ID, email: "a@example.com" });
    await createUser({ _id: USER_B_ID, email: "b@example.com" });
    mockExpenses.push(
      { _id: EXPENSE_A_ID, user: USER_A_ID, title: "A expense" },
      { _id: EXPENSE_B_ID, user: USER_B_ID, title: "B expense" }
    );
    mockTodos.push(
      { _id: TODO_A_ID, user: USER_A_ID, title: "A todo" },
      { _id: TODO_B_ID, user: USER_B_ID, title: "B todo" }
    );
    mockSalaries.push(
      { _id: SALARY_A_ID, user: USER_A_ID, salary: 1000 },
      { _id: SALARY_B_ID, user: USER_B_ID, salary: 2000 }
    );
    mockNotifications.push(
      { _id: NOTIFICATION_A_ID, user: USER_A_ID, title: "A notification" },
      { _id: NOTIFICATION_B_ID, user: USER_B_ID, title: "B notification" }
    );
    const token = tokenFor(userA);

    const expenses = await request(app).get("/api/expenses").set("Authorization", `Bearer ${token}`);
    const todos = await request(app).get("/api/todos").set("Authorization", `Bearer ${token}`);
    const salary = await request(app).get("/api/salary").set("Authorization", `Bearer ${token}`);
    const notifications = await request(app).get("/api/notifications").set("Authorization", `Bearer ${token}`);

    expect(expenses.body.map((item) => item.title)).toEqual(["A expense"]);
    expect(todos.body.map((item) => item.title)).toEqual(["A todo"]);
    expect(salary.body.salary).toBe(1000);
    expect(notifications.body.map((item) => item.title)).toEqual(["A notification"]);
  });

  test("a user cannot mutate another user's expense, todo, salary, or notification", async () => {
    const userA = await createUser({ _id: USER_A_ID, email: "a@example.com" });
    await createUser({ _id: USER_B_ID, email: "b@example.com" });
    mockExpenses.push({ _id: EXPENSE_B_ID, user: USER_B_ID, title: "B expense" });
    mockTodos.push({ _id: TODO_B_ID, user: USER_B_ID, title: "B todo" });
    mockSalaries.push({ _id: SALARY_B_ID, user: USER_B_ID, salary: 2000 });
    mockNotifications.push({ _id: NOTIFICATION_B_ID, user: USER_B_ID, title: "B notification" });
    const token = tokenFor(userA);

    const headers = { Authorization: `Bearer ${token}` };
    const expense = await request(app).delete(`/api/expenses/${EXPENSE_B_ID}`).set(headers);
    const todo = await request(app).delete(`/api/todos/${TODO_B_ID}`).set(headers);
    const salary = await request(app).put(`/api/salary/${SALARY_B_ID}`).set(headers).send({ salary: 3000 });
    const notification = await request(app).delete(`/api/notifications/${NOTIFICATION_B_ID}`).set(headers);

    expect(expense.status).toBe(404);
    expect(todo.status).toBe(404);
    expect(salary.status).toBe(404);
    expect(notification.status).toBe(404);
    expect(mockSalaries[0].salary).toBe(2000);
  });

  test("upload parser failures return a safe message without parser details", async () => {
    const user = await createUser({ _id: USER_A_ID });
    const token = tokenFor(user);
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const response = await request(app)
      .post("/api/upload/pdf")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("not a real PDF"), {
        filename: "statement.pdf",
        contentType: "application/pdf",
      });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Unable to process the uploaded file.");
    expect(JSON.stringify(response.body)).not.toContain("private parser implementation details");
    errorSpy.mockRestore();
  });

  test("unknown routes use the centralized JSON error format", async () => {
    const response = await request(app).get("/api/not-a-route");
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ success: false, message: "Route not found" });
  });
});
