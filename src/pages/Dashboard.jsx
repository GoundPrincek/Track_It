import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  IndianRupee,
  Wallet,
  Target,
  CheckCircle2,
  Clock3,
  TrendingUp,
  CalendarDays,
  RefreshCw,
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { API_BASE } from "../config/api";

function Dashboard() {
  const [salaryData, setSalaryData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartPalette, setChartPalette] = useState({
    needs: "#2563EB",
    wants: "#D97706",
    savings: "#059669",
    needsShadow: "rgba(37, 99, 235, 0.28)",
    wantsShadow: "rgba(217, 119, 6, 0.28)",
    savingsShadow: "rgba(5, 150, 105, 0.28)",
    depth: "rgba(15, 23, 42, 0.22)",
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  useEffect(() => {
    const syncChartPaletteFromTheme = () => {
      const styles = getComputedStyle(document.documentElement);

      const readVar = (name, fallback) => {
        const value = styles.getPropertyValue(name).trim();
        return value || fallback;
      };

      const needs = readVar("--color-needs", "#2563EB");
      const wants = readVar("--color-wants", "#D97706");
      const savings = readVar("--color-savings", "#059669");

      setChartPalette({
        needs,
        wants,
        savings,
        needsShadow:
          needs === "#60A5FA"
            ? "rgba(96, 165, 250, 0.30)"
            : "rgba(37, 99, 235, 0.28)",
        wantsShadow:
          wants === "#FBBF24"
            ? "rgba(251, 191, 36, 0.30)"
            : "rgba(217, 119, 6, 0.28)",
        savingsShadow:
          savings === "#34D399"
            ? "rgba(52, 211, 153, 0.30)"
            : "rgba(5, 150, 105, 0.28)",
        depth:
          readVar("--bg-primary", "#0F172A") === "#0F172A"
            ? "rgba(2, 6, 23, 0.30)"
            : "rgba(15, 23, 42, 0.18)",
      });
    };

    syncChartPaletteFromTheme();

    const observer = new MutationObserver(syncChartPaletteFromTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const results = await Promise.allSettled([
          axios.get(`${API_BASE}/salary`),
          axios.get(`${API_BASE}/expenses`),
          axios.get(`${API_BASE}/todos`),
        ]);

        const salaryRes = results[0];
        const expenseRes = results[1];
        const todoRes = results[2];

        setSalaryData(
          salaryRes.status === "fulfilled" ? salaryRes.value.data || null : null
        );

        setExpenses(
          expenseRes.status === "fulfilled" &&
            Array.isArray(expenseRes.value.data)
            ? expenseRes.value.data
            : []
        );

        setTodos(
          todoRes.status === "fulfilled" && Array.isArray(todoRes.value.data)
            ? todoRes.value.data
            : []
        );
      } catch (err) {
        console.log("Dashboard fetch error:", err);
        setSalaryData(null);
        setExpenses([]);
        setTodos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const salaryAmount = Number(salaryData?.salary || 0);
  const needs = Number(salaryData?.needs || 0);
  const wants = Number(salaryData?.wants || 0);
  const savings = Number(salaryData?.savings || 0);

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [expenses]
  );

  const categorizedSummary = useMemo(() => {
    return expenses.reduce(
      (acc, item) => {
        const category = String(item.category || "").toLowerCase();
        const amount = Number(item.amount || 0);

        if (category === "want") {
          acc.want += amount;
        } else if (category === "need") {
          acc.need += amount;
        } else if (category === "saving") {
          acc.saving += amount;
        }

        return acc;
      },
      {
        want: 0,
        need: 0,
        saving: 0,
      }
    );
  }, [expenses]);

  const chartData = useMemo(() => {
    return [
      {
        name: "Needs",
        value: Number(categorizedSummary.need || 0),
        color: chartPalette.needs,
        shadowColor: chartPalette.needsShadow,
      },
      {
        name: "Wants",
        value: Number(categorizedSummary.want || 0),
        color: chartPalette.wants,
        shadowColor: chartPalette.wantsShadow,
      },
      {
        name: "Savings",
        value: Number(categorizedSummary.saving || 0),
        color: chartPalette.savings,
        shadowColor: chartPalette.savingsShadow,
      },
    ].filter((item) => item.value > 0);
  }, [categorizedSummary, chartPalette]);

  const chartDepthLayers = useMemo(() => {
    return [18, 14, 10, 6].map((offset, index) => ({
      id: `depth-${offset}-${chartData.length}-${chartData
        .map((item) => item.value)
        .join("-")}-${index}`,
      offset,
    }));
  }, [chartData]);

  const hasChartData = chartData.length > 0;
  const chartTotal = chartData.reduce(
    (sum, item) => sum + Number(item.value || 0),
    0
  );

  const remainingBalance = salaryAmount - totalExpenses;

  const completedGoals = todos.filter((t) => Number(t.progress) >= 100).length;
  const pendingGoals = todos.filter((t) => Number(t.progress) === 0).length;
  const inProgressGoals = todos.filter(
    (t) => Number(t.progress) > 0 && Number(t.progress) < 100
  ).length;

  const today = new Date().toISOString().split("T")[0];
  const todayGoals = todos.filter((t) => t.workDate === today);
  const recentExpenses = expenses.slice(0, 5);

  const averageProductivity =
    todos.filter((t) => Number(t.productivityScore) > 0).length === 0
      ? 0
      : (
          todos.reduce((sum, t) => sum + Number(t.productivityScore || 0), 0) /
          todos.filter((t) => Number(t.productivityScore) > 0).length
        ).toFixed(1);

  const topCategory = useMemo(() => {
    if (!expenses.length) return "No data";

    const categoryTotals = {};
    expenses.forEach((item) => {
      const category = item.category || "General";
      categoryTotals[category] =
        (categoryTotals[category] || 0) + Number(item.amount || 0);
    });

    let maxCategory = "No data";
    let maxAmount = 0;

    for (const category in categoryTotals) {
      if (categoryTotals[category] > maxAmount) {
        maxAmount = categoryTotals[category];
        maxCategory = category;
      }
    }

    return maxCategory;
  }, [expenses]);

  const smartInsight = useMemo(() => {
    if (!salaryAmount)
      return "Add your salary to unlock full dashboard insights.";
    if (totalExpenses > salaryAmount)
      return "You are overspending compared to your salary.";
    if (pendingGoals > completedGoals)
      return "You have many pending goals. Focus on your highest-priority task.";
    if (Number(averageProductivity) >= 8)
      return "Excellent productivity trend. Keep following your daily timeline.";
    if (remainingBalance > 0)
      return "Your balance is healthy. Try to protect your savings target.";
    return "Track daily activity to get smarter finance and productivity insights.";
  }, [
    salaryAmount,
    totalExpenses,
    pendingGoals,
    completedGoals,
    averageProductivity,
    remainingBalance,
  ]);

  const completionRate = todos.length
    ? Math.round((completedGoals / todos.length) * 100)
    : 0;

  const savingsHealth =
    remainingBalance > savings
      ? "Healthy"
      : remainingBalance > 0
      ? "Moderate"
      : "Needs Attention";

  const statCards = [
    {
      title: "Salary",
      value: formatCurrency(salaryAmount),
      subtitle: "Monthly income",
      icon: IndianRupee,
      valueClass: "text-[var(--color-accent)]",
      iconSurface:
        "bg-[var(--status-neutral-bg)] text-[var(--color-accent)]",
    },
    {
      title: "Expenses",
      value: formatCurrency(totalExpenses),
      subtitle: "Tracked spending",
      icon: Wallet,
      valueClass: "text-[var(--color-wants)]",
      iconSurface:
        "bg-[var(--status-warm-bg)] text-[var(--status-warm-text)]",
    },
    {
      title: "Balance",
      value: formatCurrency(remainingBalance),
      subtitle: "Available after spending",
      icon: TrendingUp,
      valueClass:
        remainingBalance >= 0
          ? "text-[var(--color-savings)]"
          : "text-[var(--danger-text)]",
      iconSurface:
        remainingBalance >= 0
          ? "bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
          : "bg-[var(--danger-bg)] text-[var(--danger-text)]",
    },
    {
      title: "Today Goals",
      value: todayGoals.length,
      subtitle: "Tasks scheduled today",
      icon: CalendarDays,
      valueClass: "text-[var(--text-primary)]",
      iconSurface:
        "bg-[var(--status-neutral-bg)] text-[var(--text-primary)]",
    },
    {
      title: "Avg Score",
      value: `${averageProductivity}/10`,
      subtitle: "Productivity average",
      icon: CheckCircle2,
      valueClass: "text-[var(--status-warm-text)]",
      iconSurface:
        "bg-[var(--status-warm-bg)] text-[var(--status-warm-text)]",
    },
  ];

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 18,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: "easeOut",
      },
    },
  };

  const cardHover = {
    y: -4,
    scale: 1.01,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const item = payload[0]?.payload;
    if (!item) return null;

    return (
      <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-2)] px-4 py-3 shadow-xl">
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          {item.name}
        </p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {formatCurrency(item.value)}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <div className="theme-hero rounded-[24px] p-4 sm:p-5">
          <div className="animate-pulse space-y-4">
            <div className="h-7 w-40 rounded-lg bg-[var(--panel-3)] sm:w-48" />
            <div className="h-4 w-full max-w-[18rem] rounded-lg bg-[var(--panel-4)] sm:max-w-[20rem]" />
            <div className="h-24 rounded-2xl bg-[var(--panel-3)]" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="theme-surface-2 h-32 animate-pulse rounded-[22px] sm:rounded-[24px]"
            />
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="theme-surface-2 h-72 animate-pulse rounded-[24px]" />
          <div className="theme-surface-2 h-72 animate-pulse rounded-[24px]" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-5"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.section
        variants={itemVariants}
        className="theme-hero overflow-hidden rounded-[24px] p-4 sm:rounded-[26px] sm:p-5 md:p-6"
      >
        <div className="grid items-start gap-4 xl:grid-cols-[1.35fr_0.85fr]">
          <div>
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--panel-3)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              <span className="truncate">
                Personal productivity + finance overview
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl md:text-4xl">
              Welcome back to TrackIt
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:leading-7 md:text-[15px]">
              Manage your salary, expenses, daily goals, and execution momentum
              in one cleaner theme-aware workspace.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <motion.div
                whileHover={{ y: -2, scale: 1.01 }}
                className="theme-pill inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm sm:w-auto sm:justify-start"
              >
                <TrendingUp size={16} className="text-[var(--accent)]" />
                Completion rate: {completionRate}%
              </motion.div>

              <motion.button
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.reload()}
                className="theme-muted-btn inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition hover:bg-[var(--panel-3)] sm:w-auto"
              >
                <RefreshCw size={16} />
                Refresh
              </motion.button>
            </div>
          </div>

          <motion.div
            whileHover={cardHover}
            className="theme-surface rounded-[22px] p-4 sm:rounded-[24px] sm:p-5"
          >
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              <Sparkles size={14} />
              Smart Insight
            </div>

            <h2 className="text-base font-semibold leading-7 text-[var(--text-primary)] sm:text-lg md:text-xl">
              {smartInsight}
            </h2>

            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Insight updates automatically based on your salary, expenses, and
              task activity.
            </p>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        variants={containerVariants}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5"
      >
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.title}
              variants={itemVariants}
              whileHover={cardHover}
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
                    {card.value}
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
        variants={itemVariants}
        className="grid gap-4 lg:grid-cols-3"
      >
        <motion.div
          whileHover={cardHover}
          className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-2xl bg-[var(--status-neutral-bg)] p-2.5 text-[var(--color-accent)]">
              <Target size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                50-30-20 Budget
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Recommended allocation
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <motion.div
              whileHover={{ x: 4 }}
              className="theme-surface-3 rounded-[20px] p-4"
            >
              <p className="text-sm text-[var(--text-secondary)]">Needs Budget</p>
              <h3 className="mt-1 text-lg font-semibold text-[var(--color-needs)] sm:text-xl">
                {formatCurrency(needs)}
              </h3>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                50% essential spending
              </p>
            </motion.div>

            <motion.div
              whileHover={{ x: 4 }}
              className="theme-surface-3 rounded-[20px] p-4"
            >
              <p className="text-sm text-[var(--text-secondary)]">Wants Budget</p>
              <h3 className="mt-1 text-lg font-semibold text-[var(--color-wants)] sm:text-xl">
                {formatCurrency(wants)}
              </h3>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                30% lifestyle spending
              </p>
            </motion.div>

            <motion.div
              whileHover={{ x: 4 }}
              className="theme-surface-3 rounded-[20px] p-4"
            >
              <p className="text-sm text-[var(--text-secondary)]">
                Savings Target
              </p>
              <h3 className="mt-1 text-lg font-semibold text-[var(--color-savings)] sm:text-xl">
                {formatCurrency(savings)}
              </h3>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                20% future savings
              </p>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          whileHover={cardHover}
          className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5 lg:col-span-2"
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Goal Progress
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Status of your tracked tasks and goals
              </p>
            </div>

            <div className="theme-pill inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-medium">
              {todos.length} total goals
            </div>
          </div>

          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <motion.div
              whileHover={{ y: -3 }}
              className="theme-surface-3 rounded-[20px] p-4"
            >
              <p className="text-sm text-[var(--text-secondary)]">Completed</p>
              <h3 className="mt-1 text-lg font-semibold text-[var(--status-success-text)]">
                {completedGoals}
              </h3>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className="theme-surface-3 rounded-[20px] p-4"
            >
              <p className="text-sm text-[var(--text-secondary)]">In Progress</p>
              <h3 className="mt-1 text-lg font-semibold text-[var(--status-warm-text)]">
                {inProgressGoals}
              </h3>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className="theme-surface-3 rounded-[20px] p-4"
            >
              <p className="text-sm text-[var(--text-secondary)]">Pending</p>
              <h3 className="mt-1 text-lg font-semibold text-[var(--color-accent)]">
                {pendingGoals}
              </h3>
            </motion.div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <motion.div
              whileHover={{ y: -3 }}
              className="theme-surface-3 rounded-[20px] p-4"
            >
              <p className="text-sm text-[var(--text-secondary)]">Top Category</p>
              <h3 className="mt-1 break-words text-lg font-semibold text-[var(--text-primary)]">
                {topCategory}
              </h3>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className="theme-surface-3 rounded-[20px] p-4"
            >
              <p className="text-sm text-[var(--text-secondary)]">
                Current Balance
              </p>
              <h3
                className={`mt-1 break-words text-lg font-semibold ${
                  remainingBalance >= 0
                    ? "text-[var(--color-savings)]"
                    : "text-[var(--danger-text)]"
                }`}
              >
                {formatCurrency(remainingBalance)}
              </h3>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className="theme-surface-3 rounded-[20px] p-4"
            >
              <p className="text-sm text-[var(--text-secondary)]">
                Savings Health
              </p>
              <h3
                className={`mt-1 text-lg font-semibold ${
                  savingsHealth === "Healthy"
                    ? "text-[var(--color-savings)]"
                    : savingsHealth === "Moderate"
                    ? "text-[var(--status-warm-text)]"
                    : "text-[var(--danger-text)]"
                }`}
              >
                {savingsHealth}
              </h3>
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

      <motion.section
        variants={itemVariants}
        className="grid gap-4 xl:grid-cols-2"
      >
        <motion.div
          whileHover={cardHover}
          className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-2xl bg-[var(--status-warm-bg)] p-2.5 text-[var(--status-warm-text)]">
              <Wallet size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Recent Expenses
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Latest spending activity
              </p>
            </div>
          </div>

          {recentExpenses.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-[var(--border-soft)] bg-[var(--panel-3)] p-5 text-sm text-[var(--text-muted)] sm:p-6">
              No expenses added yet.
            </div>
          ) : (
            <motion.div variants={containerVariants} className="space-y-3">
              {recentExpenses.map((item) => {
                const expenseCategory = String(item.category || "").toLowerCase();

                const amountColorClass =
                  expenseCategory === "need"
                    ? "text-[var(--color-needs)]"
                    : expenseCategory === "want"
                    ? "text-[var(--color-wants)]"
                    : expenseCategory === "saving"
                    ? "text-[var(--color-savings)]"
                    : "text-[var(--text-primary)]";

                return (
                  <motion.div
                    key={item._id}
                    variants={itemVariants}
                    whileHover={{ x: 4, scale: 1.01 }}
                    className="theme-surface-3 rounded-[20px] p-4 transition hover:border-[var(--border-strong)]"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[var(--text-primary)]">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                          {item.category || "General"}
                        </p>
                      </div>

                      <div
                        className={`flex items-center gap-2 text-sm font-semibold sm:ml-4 sm:whitespace-nowrap ${amountColorClass}`}
                      >
                        {formatCurrency(item.amount || 0)}
                        <ArrowUpRight size={15} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>

        <motion.div
          whileHover={cardHover}
          className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-2xl bg-[var(--status-neutral-bg)] p-2.5 text-[var(--color-accent)]">
              <Target size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Needs / Wants / Savings
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Live 3D-style rotating expense chart
              </p>
            </div>
          </div>

          {!hasChartData ? (
            <div className="rounded-[20px] border border-dashed border-[var(--border-soft)] bg-[var(--panel-3)] p-5 text-sm text-[var(--text-muted)] sm:p-6">
              No needs, wants, or savings expenses available for the chart yet.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="relative h-[290px] w-full overflow-hidden rounded-[24px] border border-[var(--border-soft)] bg-[radial-gradient(circle_at_top,var(--panel-3),var(--panel-2))]">
                <div className="absolute inset-x-8 top-5 h-16 rounded-full bg-white/8 blur-2xl" />
                <div className="absolute inset-x-8 bottom-4 h-8 rounded-full bg-black/10 blur-xl" />

                <motion.div
                  key={`${chartData.map((item) => item.value).join("-")}-${chartTotal}`}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 14,
                    ease: "linear",
                    repeat: Infinity,
                  }}
                  className="absolute inset-0"
                  style={{
                    transform: "perspective(1200px) rotateX(58deg) scaleY(0.78)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CustomTooltip />} />

                      {chartDepthLayers.map((layer) => (
                        <Pie
                          key={layer.id}
                          data={chartData}
                          dataKey="value"
                          cx="50%"
                          cy={`${50 + layer.offset / 10}%`}
                          innerRadius={58}
                          outerRadius={102}
                          paddingAngle={2}
                          stroke="none"
                          isAnimationActive={false}
                        >
                          {chartData.map((entry) => (
                            <Cell
                              key={`${layer.id}-${entry.name}`}
                              fill={chartPalette.depth}
                            />
                          ))}
                        </Pie>
                      ))}

                      <Pie
                        key={`top-${chartData.map((item) => item.value).join("-")}`}
                        data={chartData}
                        dataKey="value"
                        cx="50%"
                        cy="43%"
                        innerRadius={56}
                        outerRadius={100}
                        paddingAngle={3}
                        stroke="rgba(255,255,255,0.16)"
                        strokeWidth={2}
                        isAnimationActive
                        animationDuration={900}
                      >
                        {chartData.map((entry) => (
                          <Cell
                            key={`top-${entry.name}-${entry.value}`}
                            fill={entry.color}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>

              <div className="space-y-3">
                <div className="theme-surface-3 rounded-[20px] p-4">
                  <p className="text-sm text-[var(--text-secondary)]">
                    Total categorized amount
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)] sm:text-xl">
                    {formatCurrency(chartTotal)}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Based on saved final categories in expenses
                  </p>
                </div>

                {chartData.map((item) => {
                  const percent =
                    chartTotal > 0
                      ? Math.round((Number(item.value || 0) / chartTotal) * 100)
                      : 0;

                  return (
                    <motion.div
                      key={item.name}
                      whileHover={{ x: 4 }}
                      className="theme-surface-3 rounded-[20px] p-4"
                      style={{
                        boxShadow: `0 10px 28px ${item.shadowColor}`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[var(--text-primary)]">
                              {item.name}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">
                              {percent}% of categorized total
                            </p>
                          </div>
                        </div>

                        <p className="shrink-0 text-sm font-semibold text-[var(--text-primary)]">
                          {formatCurrency(item.value)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </motion.section>

      <motion.section
        variants={itemVariants}
        className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5"
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-2xl bg-[var(--status-warm-bg)] p-2.5 text-[var(--status-warm-text)]">
            <Clock3 size={18} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Today Schedule
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Tasks planned for today
            </p>
          </div>
        </div>

        {todayGoals.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-[var(--border-soft)] bg-[var(--panel-3)] p-5 text-sm text-[var(--text-muted)] sm:p-6">
            No goals planned for today.
          </div>
        ) : (
          <motion.div variants={containerVariants} className="space-y-3">
            {todayGoals.slice(0, 5).map((goal) => (
              <motion.div
                key={goal._id}
                variants={itemVariants}
                whileHover={{ x: 4, scale: 1.01 }}
                className="theme-surface-3 rounded-[20px] p-4 transition hover:border-[var(--border-strong)]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[var(--text-primary)]">
                      {goal.title}
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      {goal.startTime || "--:--"} to {goal.endTime || "--:--"}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold sm:ml-4 ${
                      Number(goal.progress || 0) >= 100
                        ? "border-[var(--border-soft)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
                        : Number(goal.progress || 0) > 0
                        ? "border-[var(--border-soft)] bg-[var(--status-warm-bg)] text-[var(--status-warm-text)]"
                        : "border-[var(--border-soft)] bg-[var(--status-neutral-bg)] text-[var(--text-primary)]"
                    }`}
                  >
                    {goal.progress || 0}%
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.section>

      <motion.section
        variants={containerVariants}
        className="grid gap-3 md:grid-cols-3"
      >
        <motion.div
          variants={itemVariants}
          whileHover={cardHover}
          className="theme-surface-2 rounded-[22px] p-4 sm:p-5"
        >
          <div className="mb-3 flex items-center gap-2 text-[var(--text-primary)]">
            <CheckCircle2 size={18} />
            <h3 className="font-semibold">Completed Focus</h3>
          </div>
          <p className="text-3xl font-semibold text-[var(--status-success-text)]">
            {completedGoals}
          </p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Goals fully completed across your workflow.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={cardHover}
          className="theme-surface-2 rounded-[22px] p-4 sm:p-5"
        >
          <div className="mb-3 flex items-center gap-2 text-[var(--text-primary)]">
            <CalendarDays size={18} />
            <h3 className="font-semibold">Today Queue</h3>
          </div>
          <p className="text-3xl font-semibold text-[var(--color-accent)]">
            {todayGoals.length}
          </p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Scheduled tasks lined up for today.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={cardHover}
          className="theme-surface-2 rounded-[22px] p-4 sm:p-5"
        >
          <div className="mb-3 flex items-center gap-2 text-[var(--text-primary)]">
            <TrendingUp size={18} />
            <h3 className="font-semibold">Productivity Trend</h3>
          </div>
          <p className="text-3xl font-semibold text-[var(--status-warm-text)]">
            {averageProductivity}/10
          </p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Average score from your reviewed task sessions.
          </p>
        </motion.div>
      </motion.section>

      {salaryAmount > 0 && totalExpenses > salaryAmount ? (
        <motion.section
          variants={itemVariants}
          className="rounded-[22px] border border-[var(--danger-border)] bg-[var(--danger-bg)] p-4 sm:rounded-[24px] sm:p-5"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-[var(--danger-bg)] p-2.5 text-[var(--danger-text)]">
              <AlertTriangle size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-[var(--danger-text)]">
                Expense warning
              </h2>
              <p className="mt-1 text-sm leading-6 text-[var(--danger-text)]">
                Your total tracked expenses are{" "}
                {formatCurrency(totalExpenses - salaryAmount)} above your saved
                salary.
              </p>
            </div>
          </div>
        </motion.section>
      ) : null}
    </motion.div>
  );
}

export default Dashboard;