import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  Clock3,
  Wallet,
  AlertTriangle,
  Receipt,
  CalendarDays,
  Filter,
  Target,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";
import { API_BASE } from "../config/api";

function Notifications() {
  const [todos, setTodos] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentTime, setCurrentTime] = useState(new Date());

  const todayDate = useMemo(
    () => currentTime.toISOString().split("T")[0],
    [currentTime]
  );

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const [todoRes, expenseRes, salaryRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/todos`),
          axios.get(`${API_BASE}/expenses`),
          axios.get(`${API_BASE}/salary`),
        ]);

        setTodos(
          todoRes.status === "fulfilled" && Array.isArray(todoRes.value.data)
            ? todoRes.value.data
            : []
        );

        setExpenses(
          expenseRes.status === "fulfilled" && Array.isArray(expenseRes.value.data)
            ? expenseRes.value.data
            : []
        );

        setSalaryData(
          salaryRes.status === "fulfilled" ? salaryRes.value.data : null
        );
      } catch (err) {
        console.log("Notifications fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  const formatTimeLabel = (dateValue) => {
    try {
      return new Date(dateValue).toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "Recently";
    }
  };

  const getTodoSessionStart = (todo) => {
    if (todo?.sessionStartedAt) {
      const storedStart = new Date(todo.sessionStartedAt);
      if (!Number.isNaN(storedStart.getTime())) {
        return storedStart;
      }
    }

    if (!todo?.workDate || !todo?.startTime) return null;

    const scheduledStart = new Date(`${todo.workDate}T${todo.startTime}`);
    if (Number.isNaN(scheduledStart.getTime())) return null;

    return scheduledStart;
  };

  const getSeverityMeta = (severity) => {
    if (severity === "high") {
      return {
        badgeClass:
          "border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)]",
        iconSurface: "bg-[var(--danger-bg)] text-[var(--danger-text)]",
      };
    }

    if (severity === "medium") {
      return {
        badgeClass:
          "border-[var(--border-soft)] bg-[var(--status-warm-bg)] text-[var(--status-warm-text)]",
        iconSurface:
          "bg-[var(--status-warm-bg)] text-[var(--status-warm-text)]",
      };
    }

    return {
      badgeClass:
        "border-[var(--border-soft)] bg-[var(--status-neutral-bg)] text-[var(--text-primary)]",
      iconSurface:
        "bg-[var(--status-neutral-bg)] text-[var(--text-primary)]",
    };
  };

  const summary = useMemo(() => {
    const totalGoals = todos.length;
    const completedGoals = todos.filter((t) => Number(t.progress) >= 100).length;
    const pendingToday = todos.filter(
      (t) => t.workDate === todayDate && Number(t.progress) < 100
    );
    const overdueGoals = todos.filter(
      (t) =>
        t.deadline &&
        new Date(t.deadline).getTime() < new Date(todayDate).getTime() &&
        Number(t.progress) < 100
    );

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

    const generated = [];

    if (pendingToday.length > 0) {
      const severity = pendingToday.length >= 3 ? "medium" : "low";
      const severityMeta = getSeverityMeta(severity);

      generated.push({
        id: "today-pending",
        type: "todo",
        group: "todo",
        severity,
        title: "Tasks planned for today",
        message: `${pendingToday.length} goal(s) are still pending for today.`,
        detail: "Stay on track with your planned work blocks.",
        icon: CalendarDays,
        iconSurface: severityMeta.iconSurface,
        badgeClass: severityMeta.badgeClass,
        timeLabel: "Today",
      });
    }

    if (overdueGoals.length > 0) {
      const severityMeta = getSeverityMeta("high");

      generated.push({
        id: "overdue-goals",
        type: "warning",
        group: "warnings",
        severity: "high",
        title: "Overdue goals detected",
        message: `${overdueGoals.length} goal(s) missed their deadline and are not complete yet.`,
        detail: "Review the delayed tasks and update their progress.",
        icon: AlertTriangle,
        iconSurface: severityMeta.iconSurface,
        badgeClass: severityMeta.badgeClass,
        timeLabel: "Needs attention",
      });
    }

    const activeHourlyTodoReminders = todos
      .filter((todo) => Number(todo.progress) < 100)
      .map((todo) => {
        const sessionStart = getTodoSessionStart(todo);
        if (!sessionStart) return null;

        const diffMs = currentTime.getTime() - sessionStart.getTime();
        if (diffMs < 60 * 60 * 1000) return null;

        const elapsedHours = Math.floor(diffMs / (60 * 60 * 1000));
        if (elapsedHours < 1) return null;

        return {
          todo,
          elapsedHours,
          sessionStart,
        };
      })
      .filter(Boolean);

    activeHourlyTodoReminders.forEach((entry) => {
      const { todo, elapsedHours, sessionStart } = entry;
      const severity = elapsedHours >= 2 ? "high" : "medium";
      const severityMeta = getSeverityMeta(severity);

      generated.push({
        id: `todo-hourly-${todo._id}`,
        type: "todo",
        group: elapsedHours >= 2 ? "warnings" : "todo",
        severity,
        title:
          elapsedHours === 1
            ? "1-hour progress check"
            : `${elapsedHours}-hour progress check`,
        message: `"${todo.title}" session started at ${formatTimeLabel(
          sessionStart
        )}. Check how much work is done and update progress.`,
        detail:
          Number(todo.progress || 0) > 0
            ? `Current saved progress is ${Number(todo.progress || 0)}%.`
            : "This task still has 0% saved progress.",
        icon: Clock3,
        iconSurface: severityMeta.iconSurface,
        badgeClass: severityMeta.badgeClass,
        timeLabel:
          elapsedHours === 1
            ? "1 hour since start"
            : `${elapsedHours} hours since start`,
      });
    });

    if (wantsLimit > 0 && wantsSpent > wantsLimit) {
      const overBy = wantsSpent - wantsLimit;
      const severity = overBy >= wantsLimit * 0.25 ? "high" : "medium";
      const severityMeta = getSeverityMeta(severity);

      generated.push({
        id: "wants-limit",
        type: "finance",
        group: "warnings",
        severity,
        title: "Expense warning: wants spending is out of hand",
        message: `Your wants spending is above the 30% allocation by ${formatCurrency(
          overBy
        )}.`,
        detail: `Spent ${formatCurrency(wantsSpent)} out of ${formatCurrency(
          wantsLimit
        )}.`,
        icon: Wallet,
        iconSurface: severityMeta.iconSurface,
        badgeClass: severityMeta.badgeClass,
        timeLabel: "Finance alert",
      });
    }

    if (needsLimit > 0 && needsSpent > needsLimit) {
      const overBy = needsSpent - needsLimit;
      const severity = overBy >= needsLimit * 0.2 ? "high" : "medium";
      const severityMeta = getSeverityMeta(severity);

      generated.push({
        id: "needs-limit",
        type: "finance",
        group: "warnings",
        severity,
        title: "Expense warning: needs budget exceeded",
        message: `Your needs spending is above the 50% allocation by ${formatCurrency(
          overBy
        )}.`,
        detail: `Spent ${formatCurrency(needsSpent)} out of ${formatCurrency(
          needsLimit
        )}.`,
        icon: Receipt,
        iconSurface: severityMeta.iconSurface,
        badgeClass: severityMeta.badgeClass,
        timeLabel: "Finance alert",
      });
    }

    if (savingsTarget > 0 && savingsSpent < savingsTarget) {
      const gap = savingsTarget - savingsSpent;
      const severity = gap >= savingsTarget * 0.4 ? "medium" : "low";
      const severityMeta = getSeverityMeta(severity);

      generated.push({
        id: "savings-target",
        type: "finance",
        group: "finance",
        severity,
        title: "Savings target not reached",
        message: `You are below the savings target by ${formatCurrency(gap)}.`,
        detail: `Saved ${formatCurrency(savingsSpent)} out of ${formatCurrency(
          savingsTarget
        )}.`,
        icon: CheckCircle2,
        iconSurface: severityMeta.iconSurface,
        badgeClass: severityMeta.badgeClass,
        timeLabel: "Finance summary",
      });
    }

    if (salaryAmount > 0 && totalSpent > salaryAmount) {
      const severityMeta = getSeverityMeta("high");

      generated.push({
        id: "overall-spending-over-salary",
        type: "finance",
        group: "warnings",
        severity: "high",
        title: "Expense warning: total spending crossed salary",
        message: `Your total tracked expenses are ${formatCurrency(
          totalSpent - salaryAmount
        )} above your saved salary.`,
        detail: `Total spent ${formatCurrency(totalSpent)} vs salary ${formatCurrency(
          salaryAmount
        )}.`,
        icon: ShieldAlert,
        iconSurface: severityMeta.iconSurface,
        badgeClass: severityMeta.badgeClass,
        timeLabel: "Critical finance alert",
      });
    }

    const inProgressTodos = todos.filter(
      (t) => Number(t.progress) > 0 && Number(t.progress) < 100
    );

    if (inProgressTodos.length > 0) {
      const severityMeta = getSeverityMeta("low");

      generated.push({
        id: "in-progress-update",
        type: "update",
        group: "updates",
        severity: "low",
        title: "Goals in progress",
        message: `${inProgressTodos.length} goal(s) already have progress saved.`,
        detail: "Keep updating progress to maintain momentum.",
        icon: TrendingUp,
        iconSurface: severityMeta.iconSurface,
        badgeClass: severityMeta.badgeClass,
        timeLabel: "Progress update",
      });
    }

    if (completedGoals > 0) {
      const severityMeta = getSeverityMeta("low");

      generated.push({
        id: "completed-goals-update",
        type: "update",
        group: "updates",
        severity: "low",
        title: "Completed goals update",
        message: `${completedGoals} goal(s) have already been completed.`,
        detail: "Nice work. Keep your momentum going.",
        icon: Target,
        iconSurface: severityMeta.iconSurface,
        badgeClass: severityMeta.badgeClass,
        timeLabel: "Achievement",
      });
    }

    generated.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
    });

    if (generated.length === 0) {
      const severityMeta = getSeverityMeta("low");

      generated.push({
        id: "all-good",
        type: "status",
        group: "updates",
        severity: "low",
        title: "Everything looks healthy",
        message:
          "No active warnings right now. Your tasks and finance summary look stable.",
        detail: "You are within the safe range based on your current saved data.",
        icon: Bell,
        iconSurface: severityMeta.iconSurface,
        badgeClass: severityMeta.badgeClass,
        timeLabel: "Stable now",
      });
    }

    return {
      totalGoals,
      completedGoals,
      pendingTodayCount: pendingToday.length,
      overdueGoalsCount: overdueGoals.length,
      totalExpenses: expenses.length,
      totalSpent,
      activeTodoReminderCount: activeHourlyTodoReminders.length,
      notifications: generated,
    };
  }, [todos, expenses, salaryData, todayDate, currentTime]);

  const filterTabs = [
    { key: "all", label: "All" },
    { key: "finance", label: "Finance" },
    { key: "todo", label: "Todo" },
    { key: "warnings", label: "Warnings" },
    { key: "updates", label: "Updates" },
  ];

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return summary.notifications;

    if (activeFilter === "warnings") {
      return summary.notifications.filter((item) => item.group === "warnings");
    }

    if (activeFilter === "finance") {
      return summary.notifications.filter((item) => item.type === "finance");
    }

    if (activeFilter === "todo") {
      return summary.notifications.filter((item) => item.type === "todo");
    }

    if (activeFilter === "updates") {
      return summary.notifications.filter(
        (item) => item.group === "updates" || item.type === "status"
      );
    }

    return summary.notifications;
  }, [activeFilter, summary.notifications]);

  const highPriorityCount = useMemo(() => {
    return summary.notifications.filter((item) => item.severity === "high").length;
  }, [summary.notifications]);

  const statCards = [
    {
      title: "Active Notifications",
      value: summary.notifications.length,
      subtitle: "Generated from live app data",
      icon: Bell,
      valueClass: "text-[var(--text-primary)]",
      iconSurface:
        "bg-[var(--status-neutral-bg)] text-[var(--text-primary)]",
    },
    {
      title: "High Priority",
      value: highPriorityCount,
      subtitle: "Need quick attention",
      icon: AlertTriangle,
      valueClass: "text-[var(--danger-text)]",
      iconSurface: "bg-[var(--danger-bg)] text-[var(--danger-text)]",
    },
    {
      title: "Todo Check Reminders",
      value: summary.activeTodoReminderCount,
      subtitle: "Hourly progress reminders",
      icon: Clock3,
      valueClass: "text-[var(--status-warm-text)]",
      iconSurface:
        "bg-[var(--status-warm-bg)] text-[var(--status-warm-text)]",
    },
    {
      title: "Tracked Expenses",
      value: summary.totalExpenses,
      subtitle: "Saved expense entries",
      icon: Receipt,
      valueClass: "text-[var(--text-primary)]",
      iconSurface:
        "bg-[var(--status-neutral-bg)] text-[var(--text-primary)]",
    },
  ];

  const sectionMotion = {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: "easeOut" },
  };

  return (
    <div className="space-y-5">
      <motion.section
        {...sectionMotion}
        className="theme-hero overflow-hidden rounded-[24px] p-4 sm:rounded-[26px] sm:p-5 md:p-6"
      >
        <div className="grid items-start gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--panel-3)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              <span className="truncate">
                Live reminders from goals and money flow
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
              Notifications
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] md:text-[15px]">
              This section reads your current Todo, Expenses, and Salary data to
              generate real warnings and progress reminders.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
            whileHover={{ y: -3 }}
            className="theme-surface rounded-[22px] p-4 sm:rounded-[24px] sm:p-5"
          >
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              <Bell size={14} />
              Live Status
            </div>

            <h2 className="break-words text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
              {loading ? "Loading..." : `${summary.notifications.length} alerts`}
            </h2>

            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Todo time reminders refresh automatically, and finance alerts react
              to your latest saved data.
            </p>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {statCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: 0.12 + index * 0.08,
                ease: "easeOut",
              }}
              whileHover={{ y: -5, scale: 1.01 }}
              className="theme-surface-2 rounded-[22px] p-4 transition hover:border-[var(--border-strong)] hover:bg-[var(--panel-3)]"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-[var(--text-secondary)]">
                    {card.title}
                  </p>
                  <h2
                    className={`mt-2 break-words text-xl font-semibold sm:text-2xl ${card.valueClass}`}
                  >
                    {loading ? "--" : card.value}
                  </h2>
                </div>

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${card.iconSurface}`}
                >
                  <Icon size={18} />
                </div>
              </div>

              <p className="text-xs leading-5 text-[var(--text-muted)]">
                {card.subtitle}
              </p>
            </motion.div>
          );
        })}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.14, ease: "easeOut" }}
        className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              <Filter size={14} />
              Filter Feed
            </div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Notification Filters
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Switch between finance alerts, todo reminders, warnings, and updates
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.key;

              return (
                <motion.button
                  key={tab.key}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setActiveFilter(tab.key)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "border-transparent bg-[var(--accent)] text-white shadow-[0_12px_30px_rgba(0,0,0,0.16)]"
                      : "border-[var(--border-soft)] bg-[var(--panel-3)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {tab.label}
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.18, ease: "easeOut" }}
        className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5"
      >
        <div className="mb-5 flex items-start gap-3">
          <div className="rounded-2xl bg-[var(--status-neutral-bg)] p-2.5 text-[var(--text-primary)]">
            <Bell size={18} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Notification Feed
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Built from current salary, expenses, and todo activity
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[20px] border border-dashed border-[var(--border-soft)] bg-[var(--panel-3)] p-5 text-sm text-[var(--text-muted)] sm:p-6">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-[var(--border-soft)] bg-[var(--panel-3)] p-5 text-sm text-[var(--text-muted)] sm:p-6">
            No notifications match the current filter.
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredNotifications.map((item, index) => {
                const Icon = item.icon;
                const severityLabel =
                  item.severity === "high"
                    ? "High"
                    : item.severity === "medium"
                    ? "Medium"
                    : "Info";

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 18 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                      ease: "easeOut",
                    }}
                    whileHover={{ y: -2 }}
                    className="theme-surface-3 rounded-[20px] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.iconSurface}`}
                      >
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                          <h3 className="text-base font-semibold text-[var(--text-primary)]">
                            {item.title}
                          </h3>

                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${item.badgeClass}`}
                            >
                              {severityLabel}
                            </span>

                            <span className="inline-flex rounded-full border border-[var(--border-soft)] bg-[var(--panel-4)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                              {item.timeLabel}
                            </span>
                          </div>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                          {item.message}
                        </p>

                        <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.section>
    </div>
  );
}

export default Notifications;