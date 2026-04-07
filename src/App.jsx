import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

const Landing = lazy(() => import("./pages/Landing"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Salary = lazy(() => import("./pages/Salary"));
const Expenses = lazy(() => import("./pages/Expenses"));
const Todo = lazy(() => import("./pages/Todo"));
const Login = lazy(() => import("./pages/Login"));
const Settings = lazy(() => import("./pages/Settings"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Analytics = lazy(() => import("./pages/Analytics"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { fetchDashboardData } from "./services/dashboardData";
import { Bell, Clock3, AlertTriangle, Wallet, Receipt } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const REFRESH_INTERVAL_MS = 60000;
const TOAST_DURATION_MS = 5000;

const RouteFallback = () => (
  <div className="relative mx-auto w-full max-w-[1600px]">
    <div className="rounded-[22px] border border-[var(--border-soft)] bg-[var(--shell-bg)] p-4 shadow-[var(--shadow-shell)] sm:rounded-[24px] sm:p-5 md:rounded-[28px] md:p-6">
      <div className="theme-surface-2 h-28 animate-pulse rounded-[20px]" />
    </div>
  </div>
);

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

const getSeverityMeta = (severity) => {
  if (severity === "high") {
    return {
      iconSurface: "bg-[var(--danger-bg)] text-[var(--danger-text)]",
    };
  }

  if (severity === "medium") {
    return {
      iconSurface:
        "bg-[var(--status-warm-bg)] text-[var(--status-warm-text)]",
    };
  }

  return {
    iconSurface:
      "bg-[var(--status-neutral-bg)] text-[var(--text-primary)]",
  };
};

const buildLiveNotifications = ({ todos, expenses, salaryData, now }) => {
  const notifications = [];
  const todayDate = now.toISOString().split("T")[0];

  const needsSpent = expenses
    .filter((item) => item.category === "need")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const wantsSpent = expenses
    .filter((item) => item.category === "want")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const savingsSpent = expenses
    .filter((item) => item.category === "saving")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const totalSpent = expenses.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const salaryAmount = Number(salaryData?.salary || 0);
  const wantsLimit = Number(salaryData?.wants || 0);
  const needsLimit = Number(salaryData?.needs || 0);
  const savingsTarget = Number(salaryData?.savings || 0);

  const overdueGoals = todos.filter(
    (t) =>
      t.deadline &&
      new Date(t.deadline).getTime() < new Date(todayDate).getTime() &&
      Number(t.progress) < 100
  );

  if (overdueGoals.length > 0) {
    notifications.push({
      id: "toast-overdue-goals",
      severity: "high",
      title: "Overdue goals detected",
      message: `${overdueGoals.length} goal(s) missed their deadline and still need progress updates.`,
      icon: AlertTriangle,
    });
  }

  const activeSessionReminders = todos
    .filter((todo) => Number(todo.progress) < 100 && todo.sessionStartedAt)
    .map((todo) => {
      const startedAt = new Date(todo.sessionStartedAt);
      if (Number.isNaN(startedAt.getTime())) return null;

      const diffMs = now.getTime() - startedAt.getTime();
      if (diffMs < 60 * 60 * 1000) return null;

      const elapsedHours = Math.floor(diffMs / (60 * 60 * 1000));
      if (elapsedHours < 1) return null;

      return {
        todo,
        elapsedHours,
      };
    })
    .filter(Boolean);

  activeSessionReminders.forEach(({ todo, elapsedHours }) => {
    notifications.push({
      id: `toast-todo-hourly-${todo._id}-${elapsedHours}`,
      severity: elapsedHours >= 2 ? "high" : "medium",
      title:
        elapsedHours === 1
          ? "1-hour progress check"
          : `${elapsedHours}-hour progress check`,
      message: `Check how much work is done for "${todo.title}" and update progress.`,
      icon: Clock3,
    });
  });

  const pendingToday = todos.filter(
    (t) => t.workDate === todayDate && Number(t.progress) < 100
  );

  if (pendingToday.length > 0) {
    notifications.push({
      id: "toast-pending-today",
      severity: pendingToday.length >= 3 ? "medium" : "low",
      title: "Tasks planned for today",
      message: `${pendingToday.length} goal(s) are still pending today.`,
      icon: Bell,
    });
  }

  if (wantsLimit > 0 && wantsSpent > wantsLimit) {
    const overBy = wantsSpent - wantsLimit;
    notifications.push({
      id: "toast-wants-limit",
      severity: overBy >= wantsLimit * 0.25 ? "high" : "medium",
      title: "Expense warning: wants spending is out of hand",
      message: `Your wants spending is above the limit by ${formatCurrency(overBy)}.`,
      icon: Wallet,
    });
  }

  if (needsLimit > 0 && needsSpent > needsLimit) {
    const overBy = needsSpent - needsLimit;
    notifications.push({
      id: "toast-needs-limit",
      severity: overBy >= needsLimit * 0.2 ? "high" : "medium",
      title: "Expense warning: needs budget exceeded",
      message: `Your needs spending is above the limit by ${formatCurrency(overBy)}.`,
      icon: Receipt,
    });
  }

  if (savingsTarget > 0 && savingsSpent < savingsTarget) {
    const gap = savingsTarget - savingsSpent;
    notifications.push({
      id: "toast-savings-target",
      severity: gap >= savingsTarget * 0.4 ? "medium" : "low",
      title: "Savings target not reached",
      message: `You are below the savings target by ${formatCurrency(gap)}.`,
      icon: Bell,
    });
  }

  if (salaryAmount > 0 && totalSpent > salaryAmount) {
    notifications.push({
      id: "toast-total-over-salary",
      severity: "high",
      title: "Critical finance alert",
      message: `Total expenses crossed your salary by ${formatCurrency(
        totalSpent - salaryAmount
      )}.`,
      icon: AlertTriangle,
    });
  }

  return notifications.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
  });
};

function AppLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isLandingPage = location.pathname === "/";

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("trackit-theme") || "dark";
  });

  const [liveNotifications, setLiveNotifications] = useState([]);
  const [toastQueue, setToastQueue] = useState([]);

  const shownToastIdsRef = useRef(new Set());
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("trackit-theme", theme);
  }, [theme]);

  const hideNavbar = isLoginPage || isLandingPage;

  useEffect(() => {
    if (hideNavbar) return;

    let isMounted = true;

    const fetchLiveNotificationData = async () => {
      try {
        if (!isMounted) return;
        const { todos, expenses, salaryData } = await fetchDashboardData();

        const nextNotifications = buildLiveNotifications({
          todos,
          expenses,
          salaryData,
          now: new Date(),
        });

        setLiveNotifications(nextNotifications);

        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
          nextNotifications.forEach((item) => {
            shownToastIdsRef.current.add(item.id);
          });
          return;
        }

        const newToasts = nextNotifications.filter(
          (item) => !shownToastIdsRef.current.has(item.id)
        );

        if (newToasts.length > 0) {
          newToasts.forEach((item) => {
            shownToastIdsRef.current.add(item.id);
          });

          setToastQueue((prev) => {
            const existingIds = new Set(prev.map((item) => item.id));
            const uniqueNewToasts = newToasts.filter(
              (item) => !existingIds.has(item.id)
            );
            return [...prev, ...uniqueNewToasts].slice(-4);
          });
        }
      } catch (err) {
        console.log("App live notification fetch error:", err);
      }
    };

    fetchLiveNotificationData();

    const interval = setInterval(fetchLiveNotificationData, REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [hideNavbar, location.pathname]);

  useEffect(() => {
    if (!toastQueue.length) return;

    const timers = toastQueue.map((toast) =>
      setTimeout(() => {
        setToastQueue((prev) => prev.filter((item) => item.id !== toast.id));
      }, TOAST_DURATION_MS)
    );

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [toastQueue]);

  const notificationCount = liveNotifications.length;

  const highPriorityCount = useMemo(() => {
    return liveNotifications.filter((item) => item.severity === "high").length;
  }, [liveNotifications]);

  const dismissToast = (id) => {
    setToastQueue((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--bg-glow-1),transparent_28%),radial-gradient(circle_at_top_right,var(--bg-glow-2),transparent_22%),radial-gradient(circle_at_bottom_center,var(--bg-glow-3),transparent_30%)]" />
      </div>

      {!hideNavbar && (
        <Navbar
          theme={theme}
          setTheme={setTheme}
          notificationCount={notificationCount}
          highPriorityCount={highPriorityCount}
        />
      )}

      {!hideNavbar ? (
        <div className="pointer-events-none fixed right-3 top-[84px] z-[90] flex w-[min(92vw,380px)] flex-col gap-3 sm:right-4 md:right-5 xl:right-6">
          <AnimatePresence>
            {toastQueue.map((toast, index) => {
              const Icon = toast.icon || Bell;
              const severityMeta = getSeverityMeta(toast.severity);

              return (
                <motion.div
                  key={toast.id}
                  initial={{ opacity: 0, x: 30, y: -6 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: 30, y: -6 }}
                  transition={{
                    duration: 0.25,
                    delay: index * 0.04,
                    ease: "easeOut",
                  }}
                  className="pointer-events-auto"
                >
                  <div className="theme-surface-2 rounded-[22px] border border-[var(--border-soft)] p-4 shadow-[var(--shadow-shell)] backdrop-blur-xl">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${severityMeta.iconSurface}`}
                      >
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                              {toast.title}
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                              {toast.message}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => dismissToast(toast.id)}
                            className="rounded-xl border border-[var(--border-soft)] bg-[var(--panel-3)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : null}

      {hideNavbar ? (
        <div className="relative">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route
                path="/"
                element={<Landing theme={theme} setTheme={setTheme} />}
              />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      ) : (
        <main className="relative w-full px-2 py-3 sm:px-3 sm:py-4 md:px-5 md:py-6 xl:px-6">
          <Suspense fallback={<RouteFallback />}>
            <div className="mx-auto w-full max-w-[1600px]">
              <div className="rounded-[22px] border border-[var(--border-soft)] bg-[var(--shell-bg)] p-2 shadow-[var(--shadow-shell)] backdrop-blur-xl sm:rounded-[24px] sm:p-3 md:rounded-[28px] md:p-5">
                <Routes>
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/salary"
                    element={
                      <ProtectedRoute>
                        <Salary />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/expenses"
                    element={
                      <ProtectedRoute>
                        <Expenses />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/todo"
                    element={
                      <ProtectedRoute>
                        <Todo />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings theme={theme} setTheme={setTheme} />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <Notifications />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/analytics"
                    element={
                      <ProtectedRoute>
                        <Analytics />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </div>
            </div>
          </Suspense>
        </main>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;