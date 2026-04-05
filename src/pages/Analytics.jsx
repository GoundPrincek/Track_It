import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Wallet,
  PiggyBank,
  CheckCircle2,
  Clock3,
  Target,
  Receipt,
  AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { API_BASE } from "../config/api";

function Analytics() {
  const [todos, setTodos] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(true);

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
        console.log("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  const analytics = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthExpenses = expenses.filter(expense => {
      const d = new Date(expense.date || expense.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const currentMonthTodos = todos.filter(todo => {
      const d = new Date(todo.workDate || todo.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalExpenses = currentMonthExpenses.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const needsSpent = currentMonthExpenses
      .filter((item) => item.category === "need")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const wantsSpent = currentMonthExpenses
      .filter((item) => item.category === "want")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const savingsSpent = currentMonthExpenses
      .filter((item) => item.category === "saving")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const uncategorizedSpent = currentMonthExpenses
      .filter(
        (item) =>
          item.category !== "need" &&
          item.category !== "want" &&
          item.category !== "saving"
      )
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const completedGoals = currentMonthTodos.filter((t) => Number(t.progress) >= 100).length;
    const inProgressGoals = currentMonthTodos.filter(
      (t) => Number(t.progress) > 0 && Number(t.progress) < 100
    ).length;
    const pendingGoals = currentMonthTodos.filter((t) => Number(t.progress) === 0).length;

    const completionRate = currentMonthTodos.length
      ? Math.round((completedGoals / currentMonthTodos.length) * 100)
      : 0;

    const averageProgress = currentMonthTodos.length
      ? Math.round(
          currentMonthTodos.reduce((sum, todo) => sum + Number(todo.progress || 0), 0) /
            currentMonthTodos.length
        )
      : 0;

    return {
      totalExpenses,
      needsSpent,
      wantsSpent,
      savingsSpent,
      uncategorizedSpent,
      completedGoals,
      inProgressGoals,
      pendingGoals,
      completionRate,
      averageProgress,
    };
  }, [todos, expenses]);

  const statCards = [
    {
      title: "Total Expenses",
      value: formatCurrency(analytics.totalExpenses),
      subtitle: "Combined saved spending",
      icon: Wallet,
      valueClass: "text-[var(--color-accent)]",
      iconSurface:
        "bg-[var(--status-neutral-bg)] text-[var(--color-accent)]",
    },
    {
      title: "Savings Recorded",
      value: formatCurrency(analytics.savingsSpent),
      subtitle: "Saved under saving category",
      icon: PiggyBank,
      valueClass: "text-[var(--color-savings)]",
      iconSurface:
        "bg-[var(--status-success-bg)] text-[var(--color-savings)]",
    },
    {
      title: "Completion Rate",
      value: `${analytics.completionRate}%`,
      subtitle: "Finished goals ratio",
      icon: CheckCircle2,
      valueClass: "text-[var(--status-success-text)]",
      iconSurface:
        "bg-[var(--status-success-bg)] text-[var(--status-success-text)]",
    },
    {
      title: "In Progress",
      value: analytics.inProgressGoals,
      subtitle: "Goals currently moving",
      icon: Clock3,
      valueClass: "text-[var(--status-warm-text)]",
      iconSurface:
        "bg-[var(--status-warm-bg)] text-[var(--status-warm-text)]",
    },
  ];

  const budgetBars = [
    {
      label: "Needs",
      spent: analytics.needsSpent,
      target: Number(salaryData?.needs || 0),
      textClass: "text-[var(--color-needs)]",
      barClass: "bg-[linear-gradient(90deg,var(--color-needs),var(--accent-2))]",
    },
    {
      label: "Wants",
      spent: analytics.wantsSpent,
      target: Number(salaryData?.wants || 0),
      textClass: "text-[var(--color-wants)]",
      barClass: "bg-[linear-gradient(90deg,var(--color-wants),var(--accent-warm))]",
    },
    {
      label: "Savings",
      spent: analytics.savingsSpent,
      target: Number(salaryData?.savings || 0),
      textClass: "text-[var(--color-savings)]",
      barClass:
        "bg-[linear-gradient(90deg,var(--color-savings),var(--status-success-text))]",
    },
  ];

  const expenseCategoryChartData = [
    { name: "Needs", value: analytics.needsSpent, color: "var(--color-needs)" },
    { name: "Wants", value: analytics.wantsSpent, color: "var(--color-wants)" },
    { name: "Savings", value: analytics.savingsSpent, color: "var(--color-savings)" },
    { name: "Other", value: analytics.uncategorizedSpent, color: "var(--text-muted)" },
  ].filter((item) => item.value > 0);

  const goalProgressChartData = [
    { name: "Completed", value: analytics.completedGoals, color: "var(--status-success-text)" },
    { name: "In Progress", value: analytics.inProgressGoals, color: "var(--status-warm-text)" },
    { name: "Pending", value: analytics.pendingGoals, color: "var(--color-accent)" },
  ];

  const budgetComparisonChartData = [
    {
      name: "Needs",
      Allocation: Number(salaryData?.needs || 0),
      Spent: analytics.needsSpent,
    },
    {
      name: "Wants",
      Allocation: Number(salaryData?.wants || 0),
      Spent: analytics.wantsSpent,
    },
    {
      name: "Savings",
      Allocation: Number(salaryData?.savings || 0),
      Spent: analytics.savingsSpent,
    },
  ];

  const insightCards = useMemo(() => {
    const insights = [];

    if (!salaryData?.salary) {
      insights.push({
        title: "Add salary for deeper analytics",
        description:
          "Save your salary to unlock stronger allocation comparison and budget insights.",
        icon: Wallet,
        iconSurface:
          "bg-[var(--status-neutral-bg)] text-[var(--color-accent)]",
      });
    }

    if (analytics.wantsSpent > Number(salaryData?.wants || 0) && salaryData?.wants) {
      insights.push({
        title: "Wants are above target",
        description: `Lifestyle spending is above allocation by ${formatCurrency(
          analytics.wantsSpent - Number(salaryData?.wants || 0)
        )}.`,
        icon: AlertTriangle,
        iconSurface: "bg-[var(--danger-bg)] text-[var(--danger-text)]",
      });
    }

    if (
      salaryData?.savings &&
      analytics.savingsSpent < Number(salaryData?.savings || 0)
    ) {
      insights.push({
        title: "Savings target can improve",
        description: `You are currently below the suggested savings target by ${formatCurrency(
          Number(salaryData?.savings || 0) - analytics.savingsSpent
        )}.`,
        icon: PiggyBank,
        iconSurface:
          "bg-[var(--status-success-bg)] text-[var(--color-savings)]",
      });
    }

    if (analytics.averageProgress >= 70) {
      insights.push({
        title: "Goal momentum looks strong",
        description:
          "Your average task progress is high, which suggests consistent execution.",
        icon: TrendingUp,
        iconSurface:
          "bg-[var(--status-success-bg)] text-[var(--status-success-text)]",
      });
    } else if (todos.length > 0) {
      insights.push({
        title: "Goal execution has room to improve",
        description:
          "A few focused completions can lift your overall progress quickly.",
        icon: Target,
        iconSurface:
          "bg-[var(--status-warm-bg)] text-[var(--status-warm-text)]",
      });
    }

    if (expenses.length === 0) {
      insights.push({
        title: "No expense data yet",
        description:
          "Add or import expenses to unlock category and spending trend insights.",
        icon: Receipt,
        iconSurface:
          "bg-[var(--status-neutral-bg)] text-[var(--color-accent)]",
      });
    }

    return insights.slice(0, 4);
  }, [analytics, salaryData, expenses.length, todos.length]);

  const topExpenseCategory = useMemo(() => {
    const items = [
      { label: "Needs", value: analytics.needsSpent },
      { label: "Wants", value: analytics.wantsSpent },
      { label: "Savings", value: analytics.savingsSpent },
      { label: "Other", value: analytics.uncategorizedSpent },
    ];

    return items.sort((a, b) => b.value - a.value)[0];
  }, [analytics]);

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
              <span className="truncate">Track money flow and goal momentum</span>
            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
              Analytics
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] md:text-[15px]">
              View a combined summary of salary allocation, spending behavior, and
              task execution using your current TrackIt data.
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
              <TrendingUp size={14} />
              Overview
            </div>

            <h2 className="break-words text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
              {loading ? "Loading..." : `${todos.length} goals · ${expenses.length} expenses`}
            </h2>

            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {loading
                ? "Preparing your analytics view."
                : `Top expense category: ${topExpenseCategory?.label || "Not available"} · Average goal progress: ${analytics.averageProgress}%`}
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
        className="grid gap-4 xl:grid-cols-[1fr_1fr]"
      >
        <div className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5">
          <div className="mb-5 flex items-start gap-3">
            <div className="rounded-2xl bg-[var(--status-neutral-bg)] p-2.5 text-[var(--color-accent)]">
              <BarChart3 size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Expense Category Distribution
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Visual split of where your money is going
              </p>
            </div>
          </div>

          <div className="h-[320px]">
            {loading ? (
              <div className="flex h-[290px] w-full flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--border-soft)] bg-[var(--panel-3)] text-center">
                <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[var(--border-soft)] border-t-[var(--accent)]"></div>
                <p className="mt-3 text-sm text-[var(--text-muted)]">Loading chart...</p>
              </div>
            ) : expenseCategoryChartData.length === 0 ? (
              <div className="flex h-[290px] w-full flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--border-soft)] bg-[var(--panel-3)] text-center">
                <div className="mb-3 rounded-full bg-[var(--panel-4)] p-3 text-[var(--text-muted)]">
                  <BarChart3 size={24} />
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)]">No category data</p>
                <p className="mt-1 max-w-[200px] text-xs text-[var(--text-muted)]">Add expenses this month to see the category chart.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategoryChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                  >
                    {expenseCategoryChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      background: "var(--panel-2)",
                      border: "1px solid var(--border-soft)",
                      borderRadius: "16px",
                      color: "var(--text-primary)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5">
          <div className="mb-5 flex items-start gap-3">
            <div className="rounded-2xl bg-[var(--status-success-bg)] p-2.5 text-[var(--status-success-text)]">
              <CheckCircle2 size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Goal Status Chart
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Compare completed, active, and pending goals
              </p>
            </div>
          </div>

          <div className="h-[320px]">
            {loading ? (
              <div className="flex h-[290px] w-full flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--border-soft)] bg-[var(--panel-3)] text-center">
                <p className="mt-3 text-sm text-[var(--text-muted)]">Loading chart...</p>
              </div>
            ) : todos.length === 0 ? (
              <div className="flex h-[290px] w-full flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--border-soft)] bg-[var(--panel-3)] text-center">
                <div className="mb-3 rounded-full bg-[var(--panel-4)] p-3 text-[var(--text-muted)]">
                  <Target size={24} />
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)]">No goal data</p>
                <p className="mt-1 max-w-[200px] text-xs text-[var(--text-muted)]">Add goals this month to see progress charts.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={goalProgressChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                  >
                    {goalProgressChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => value}
                    contentStyle={{
                      background: "var(--panel-2)",
                      border: "1px solid var(--border-soft)",
                      borderRadius: "16px",
                      color: "var(--text-primary)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
        className="grid gap-4 xl:grid-cols-[1fr_1fr]"
      >
        <div className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5">
          <div className="mb-5 flex items-start gap-3">
            <div className="rounded-2xl bg-[var(--status-neutral-bg)] p-2.5 text-[var(--color-accent)]">
              <Target size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Budget Comparison Chart
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Allocation vs actual amount by category
              </p>
            </div>
          </div>

          <div className="h-[340px]">
            {loading ? (
              <div className="flex h-[290px] w-full flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--border-soft)] bg-[var(--panel-3)] text-center">
                <p className="mt-3 text-sm text-[var(--text-muted)]">Loading chart...</p>
              </div>
            ) : !salaryData?.salary ? (
              <div className="flex h-[290px] w-full flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--border-soft)] bg-[var(--panel-3)] text-center">
                <div className="mb-3 rounded-full bg-[var(--panel-4)] p-3 text-[var(--text-muted)]">
                  <Wallet size={24} />
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)]">No budget set</p>
                <p className="mt-1 max-w-[200px] text-xs text-[var(--text-muted)]">Save your salary to unlock allocation comparison.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetComparisonChartData}>
                  <CartesianGrid stroke="var(--border-soft)" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      background: "var(--panel-2)",
                      border: "1px solid var(--border-soft)",
                      borderRadius: "16px",
                      color: "var(--text-primary)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Allocation" radius={[10, 10, 0, 0]} fill="var(--color-accent)" />
                  <Bar dataKey="Spent" radius={[10, 10, 0, 0]} fill="var(--color-wants)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5">
          <div className="mb-5 flex items-start gap-3">
            <div className="rounded-2xl bg-[var(--status-warm-bg)] p-2.5 text-[var(--status-warm-text)]">
              <TrendingUp size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Smart Insights
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Useful highlights generated from your current data
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {loading ? (
              <div className="rounded-[20px] border border-dashed border-[var(--border-soft)] bg-[var(--panel-3)] p-5 text-sm text-[var(--text-muted)]">
                Building insights...
              </div>
            ) : (
              insightCards.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: 0.22 + index * 0.06,
                      ease: "easeOut",
                    }}
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
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.26, ease: "easeOut" }}
        className="grid gap-4 xl:grid-cols-[1fr_1fr]"
      >
        <div className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5">
          <div className="mb-5 flex items-start gap-3">
            <div className="rounded-2xl bg-[var(--status-neutral-bg)] p-2.5 text-[var(--color-accent)]">
              <BarChart3 size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Budget Performance
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Compare saved spending against salary allocation
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {budgetBars.map((item, index) => {
              const percent = item.target
                ? Math.min(100, Math.round((item.spent / item.target) * 100))
                : 0;

              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.2 + index * 0.07,
                    ease: "easeOut",
                  }}
                  className="theme-surface-3 rounded-[20px] p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm text-[var(--text-secondary)]">
                      {item.label}
                    </p>
                    <p className={`text-sm font-medium ${item.textClass}`}>
                      {formatCurrency(item.spent)} / {formatCurrency(item.target)}
                    </p>
                  </div>

                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--panel-4)]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.7, delay: 0.28 + index * 0.08 }}
                      className={`h-2.5 rounded-full ${item.barClass}`}
                    />
                  </div>

                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    {item.target
                      ? `${percent}% of allocation used`
                      : "Save salary data to unlock allocation comparison"}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5">
          <div className="mb-5 flex items-start gap-3">
            <div className="rounded-2xl bg-[var(--status-success-bg)] p-2.5 text-[var(--status-success-text)]">
              <CheckCircle2 size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Goal Execution
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Current progress breakdown from your todo list
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {[
              {
                title: "Completed Goals",
                value: analytics.completedGoals,
                subtitle: "Reached 100% progress",
                valueClass: "text-[var(--status-success-text)]",
              },
              {
                title: "In Progress Goals",
                value: analytics.inProgressGoals,
                subtitle: "Moving but not finished",
                valueClass: "text-[var(--status-warm-text)]",
              },
              {
                title: "Pending Goals",
                value: analytics.pendingGoals,
                subtitle: "Not started yet",
                valueClass: "text-[var(--color-accent)]",
              },
              {
                title: "Average Progress",
                value: `${analytics.averageProgress}%`,
                subtitle: "Average across all goals",
                valueClass: "text-[var(--text-primary)]",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  delay: 0.18 + index * 0.07,
                  ease: "easeOut",
                }}
                className="theme-surface-3 rounded-[20px] p-4"
              >
                <p className="text-sm text-[var(--text-secondary)]">
                  {item.title}
                </p>
                <h3 className={`mt-1 text-2xl font-semibold ${item.valueClass}`}>
                  {loading ? "--" : item.value}
                </h3>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {item.subtitle}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export default Analytics;