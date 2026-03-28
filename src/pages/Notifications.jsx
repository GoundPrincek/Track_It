import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  Clock3,
  Wallet,
  AlertTriangle,
  Receipt,
  CalendarDays,
} from "lucide-react";
import { API_BASE } from "../config/api";

function Notifications() {
  const [todos, setTodos] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const todayDate = today.toISOString().split("T")[0];

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

    const generated = [];

    if (pendingToday.length > 0) {
      generated.push({
        id: "today-pending",
        type: "reminder",
        title: "Tasks planned for today",
        message: `${pendingToday.length} goal(s) are still pending for today.`,
        icon: CalendarDays,
        iconSurface:
          "bg-[var(--status-neutral-bg)] text-[var(--text-primary)]",
      });
    }

    if (overdueGoals.length > 0) {
      generated.push({
        id: "overdue-goals",
        type: "warning",
        title: "Overdue goals detected",
        message: `${overdueGoals.length} goal(s) missed their deadline and are not complete yet.`,
        icon: AlertTriangle,
        iconSurface: "bg-[var(--danger-bg)] text-[var(--danger-text)]",
      });
    }

    if (salaryData?.wants && wantsSpent > Number(salaryData.wants || 0)) {
      generated.push({
        id: "wants-limit",
        type: "budget",
        title: "Wants budget exceeded",
        message: `Your wants spending is above the 30% allocation by ₹${Math.round(
          wantsSpent - Number(salaryData.wants || 0)
        )}.`,
        icon: Wallet,
        iconSurface:
          "bg-[var(--status-warm-bg)] text-[var(--status-warm-text)]",
      });
    }

    if (salaryData?.needs && needsSpent > Number(salaryData.needs || 0)) {
      generated.push({
        id: "needs-limit",
        type: "budget",
        title: "Needs budget exceeded",
        message: `Your needs spending is above the 50% allocation by ₹${Math.round(
          needsSpent - Number(salaryData.needs || 0)
        )}.`,
        icon: Receipt,
        iconSurface: "bg-[var(--danger-bg)] text-[var(--danger-text)]",
      });
    }

    if (salaryData?.savings && savingsSpent < Number(salaryData.savings || 0)) {
      generated.push({
        id: "savings-target",
        type: "goal",
        title: "Savings target not reached",
        message: `You are below the savings target by ₹${Math.round(
          Number(salaryData.savings || 0) - savingsSpent
        )}.`,
        icon: CheckCircle2,
        iconSurface:
          "bg-[var(--status-success-bg)] text-[var(--status-success-text)]",
      });
    }

    if (generated.length === 0) {
      generated.push({
        id: "all-good",
        type: "status",
        title: "Everything looks healthy",
        message:
          "No active warnings right now. Your tasks and finance summary look stable.",
        icon: Bell,
        iconSurface:
          "bg-[var(--status-success-bg)] text-[var(--status-success-text)]",
      });
    }

    return {
      totalGoals,
      completedGoals,
      pendingTodayCount: pendingToday.length,
      overdueGoalsCount: overdueGoals.length,
      totalExpenses: expenses.length,
      notifications: generated,
    };
  }, [todos, expenses, salaryData, todayDate]);

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
      title: "Pending Today",
      value: summary.pendingTodayCount,
      subtitle: "Goals still open today",
      icon: Clock3,
      valueClass: "text-[var(--status-warm-text)]",
      iconSurface:
        "bg-[var(--status-warm-bg)] text-[var(--status-warm-text)]",
    },
    {
      title: "Completed Goals",
      value: summary.completedGoals,
      subtitle: "Tasks marked done",
      icon: CheckCircle2,
      valueClass: "text-[var(--status-success-text)]",
      iconSurface:
        "bg-[var(--status-success-bg)] text-[var(--status-success-text)]",
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

  return (
    <div className="space-y-5">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="theme-hero overflow-hidden rounded-[24px] p-4 sm:rounded-[26px] sm:p-5 md:p-6"
      >
        <div className="grid items-start gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--panel-3)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              <span className="truncate">Live reminders from goals and money flow</span>
            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
              Notifications
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] md:text-[15px]">
              This section now works by reading your current Todo, Expenses, and
              Salary data and generating useful alerts.
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
              Status
            </div>

            <h2 className="break-words text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
              {loading ? "Loading..." : `${summary.notifications.length} alerts`}
            </h2>

            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Alerts refresh from your saved app data and help you react faster.
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
        transition={{ duration: 0.45, delay: 0.16, ease: "easeOut" }}
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
        ) : (
          <div className="space-y-3">
            {summary.notifications.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
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

                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-[var(--text-primary)]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                        {item.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.section>
    </div>
  );
}

export default Notifications;