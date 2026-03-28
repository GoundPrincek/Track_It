import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  IndianRupee,
  Target,
  TrendingUp,
  PiggyBank,
  Wallet,
  Save,
  CheckCircle2,
} from "lucide-react";
import { API_BASE } from "../config/api";

function Salary() {
  const [salary, setSalary] = useState("");
  const [latestSalary, setLatestSalary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const API = `${API_BASE}/salary`;

  const fetchLatestSalary = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API);
      setLatestSalary(res.data);
    } catch (err) {
      console.log("Salary fetch error:", err);
      setLatestSalary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestSalary();
  }, []);

  useEffect(() => {
    if (!saveMessage) return;

    const timer = setTimeout(() => {
      setSaveMessage("");
    }, 2600);

    return () => clearTimeout(timer);
  }, [saveMessage]);

  const handleSaveSalary = async () => {
    try {
      if (!salary || Number(salary) <= 0) {
        alert("Please enter a valid salary");
        return;
      }

      setSaving(true);
      setSaveMessage("");

      const res = await axios.post(API, {
        salary: Number(salary),
      });

      setSaveMessage(res.data.message || "Salary saved successfully");
      setSalary("");
      await fetchLatestSalary();
    } catch (err) {
      console.log("Salary save frontend error:", err);
      alert(err.response?.data?.message || "Failed to save salary");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  const salaryAmount = latestSalary?.salary || 0;
  const needs = latestSalary?.needs || 0;
  const wants = latestSalary?.wants || 0;
  const savings = latestSalary?.savings || 0;

  const budgetMessage = useMemo(() => {
    if (!salaryAmount) return "Add salary to unlock budget planning.";
    return "Your income is automatically divided using the 50-30-20 budgeting rule.";
  }, [salaryAmount]);

  const allocationCards = [
    {
      title: "Monthly Salary",
      value: formatCurrency(salaryAmount),
      subtitle: "Current recorded income",
      icon: IndianRupee,
      valueClass: "text-[var(--text-primary)]",
      iconSurface: "bg-[var(--status-neutral-bg)] text-[var(--text-primary)]",
    },
    {
      title: "Needs",
      value: formatCurrency(needs),
      subtitle: "50% essential spending",
      icon: Wallet,
      valueClass: "text-[var(--status-success-text)]",
      iconSurface:
        "bg-[var(--status-success-bg)] text-[var(--status-success-text)]",
    },
    {
      title: "Wants",
      value: formatCurrency(wants),
      subtitle: "30% lifestyle spending",
      icon: TrendingUp,
      valueClass: "text-[var(--status-warm-text)]",
      iconSurface:
        "bg-[var(--status-warm-bg)] text-[var(--status-warm-text)]",
    },
    {
      title: "Savings",
      value: formatCurrency(savings),
      subtitle: "20% future reserve",
      icon: PiggyBank,
      valueClass: "text-[var(--text-primary)]",
      iconSurface: "bg-[var(--status-neutral-bg)] text-[var(--text-primary)]",
    },
  ];

  const allocationDetails = [
    {
      title: "Needs Allocation",
      subtitle: "Essential monthly spending",
      value: formatCurrency(needs),
      description:
        "Recommended for rent, bills, transport, groceries, and other fixed needs.",
      icon: Wallet,
      iconSurface:
        "bg-[var(--status-success-bg)] text-[var(--status-success-text)]",
      valueClass: "text-[var(--status-success-text)]",
      barClass:
        "bg-[linear-gradient(90deg,var(--accent),var(--accent-2))]",
      width: "50%",
    },
    {
      title: "Wants Allocation",
      subtitle: "Flexible lifestyle spending",
      value: formatCurrency(wants),
      description:
        "Useful for entertainment, shopping, dining out, and non-essential choices.",
      icon: TrendingUp,
      iconSurface:
        "bg-[var(--status-warm-bg)] text-[var(--status-warm-text)]",
      valueClass: "text-[var(--status-warm-text)]",
      barClass:
        "bg-[linear-gradient(90deg,var(--status-warm-text),var(--accent-warm))]",
      width: "30%",
    },
    {
      title: "Savings Allocation",
      subtitle: "Future-focused financial reserve",
      value: formatCurrency(savings),
      description:
        "Best reserved for emergency funds, investing, and long-term financial goals.",
      icon: PiggyBank,
      iconSurface: "bg-[var(--status-neutral-bg)] text-[var(--text-primary)]",
      valueClass: "text-[var(--text-primary)]",
      barClass:
        "bg-[linear-gradient(90deg,var(--text-primary),var(--text-secondary))]",
      width: "20%",
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
        <div className="grid items-start gap-4 lg:grid-cols-[1.25fr_0.85fr]">
          <div>
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--panel-3)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              <span className="truncate">
                Budget planning with the 50-30-20 rule
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
              Salary Planner
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] md:text-[15px]">
              Save your monthly salary and instantly split it into needs, wants,
              and savings with a clean budgeting view.
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
              <Target size={14} />
              Budget Insight
            </div>

            <h2 className="break-words text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
              {salaryAmount ? formatCurrency(salaryAmount) : "No salary saved"}
            </h2>

            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {budgetMessage}
            </p>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
        className="grid gap-4 xl:grid-cols-[1fr_1fr]"
      >
        <motion.div
          whileHover={{ y: -4 }}
          className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5"
        >
          <div className="mb-5 flex items-start gap-3">
            <div className="rounded-2xl bg-[var(--status-success-bg)] p-2.5 text-[var(--status-success-text)]">
              <Save size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Add Monthly Salary
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Save or update your latest monthly income
              </p>
            </div>
          </div>

          <div className="theme-surface-3 rounded-[20px] p-4">
            <p className="mb-4 text-sm leading-6 text-[var(--text-secondary)]">
              {budgetMessage}
            </p>

            <div className="flex flex-col gap-3">
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="number"
                placeholder="Enter monthly salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              />

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveSalary}
                disabled={saving}
                className="theme-primary-btn inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-70 lg:w-auto"
              >
                <motion.span
                  animate={saving ? { rotate: [0, -8, 8, 0] } : { rotate: 0 }}
                  transition={
                    saving
                      ? { repeat: Infinity, duration: 0.8, ease: "easeInOut" }
                      : { duration: 0.2 }
                  }
                  className="inline-flex"
                >
                  <Save size={16} />
                </motion.span>
                {saving ? "Saving..." : "Save Salary"}
              </motion.button>
            </div>

            <AnimatePresence>
              {saveMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--status-success-bg)] px-3 py-2 text-sm text-[var(--status-success-text)]"
                >
                  <CheckCircle2 size={16} />
                  <span>{saveMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5"
        >
          <div className="mb-5 flex items-start gap-3">
            <div className="rounded-2xl bg-[var(--status-neutral-bg)] p-2.5 text-[var(--text-primary)]">
              <Target size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Budget Rule
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Simple income allocation reference
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                label: "50% Needs",
                text: "Essentials, bills, fixed costs",
                valueClass: "text-[var(--status-success-text)]",
              },
              {
                label: "30% Wants",
                text: "Lifestyle, fun, flexible spending",
                valueClass: "text-[var(--status-warm-text)]",
              },
              {
                label: "20% Savings",
                text: "Emergency fund and future goals",
                valueClass: "text-[var(--text-primary)]",
              },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.15 + index * 0.08 }}
                className="theme-surface-3 rounded-[20px] p-4"
              >
                <p className="text-sm text-[var(--text-secondary)]">
                  {item.label}
                </p>
                <h3
                  className={`mt-1 text-lg font-semibold sm:text-xl ${item.valueClass}`}
                >
                  {item.text}
                </h3>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {loading ? (
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="theme-surface-2 rounded-[22px] p-5 text-sm text-[var(--text-muted)] sm:rounded-[24px] sm:p-6"
        >
          Loading salary data...
        </motion.section>
      ) : latestSalary ? (
        <>
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18, ease: "easeOut" }}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
          >
            {allocationCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: 0.2 + index * 0.08,
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
                        {card.value}
                      </h2>
                    </div>

                    <motion.div
                      whileHover={{ rotate: -6, scale: 1.06 }}
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${card.iconSurface}`}
                    >
                      <Icon size={18} />
                    </motion.div>
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
            transition={{ duration: 0.45, delay: 0.28, ease: "easeOut" }}
            className="grid gap-4 lg:grid-cols-3"
          >
            {allocationDetails.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: 0.3 + index * 0.1,
                    ease: "easeOut",
                  }}
                  whileHover={{ y: -4 }}
                  className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5"
                >
                  <div className="mb-4 flex items-start gap-2">
                    <div className={`rounded-2xl p-2.5 ${item.iconSurface}`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                        {item.title}
                      </h2>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <h3
                    className={`break-words text-xl font-semibold sm:text-2xl ${item.valueClass}`}
                  >
                    {item.value}
                  </h3>

                  <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--panel-4)]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: item.width }}
                      transition={{
                        duration: 0.8,
                        delay: 0.45 + index * 0.12,
                        ease: "easeOut",
                      }}
                      className={`h-2.5 rounded-full ${item.barClass}`}
                    />
                  </div>

                  <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.section>
        </>
      ) : (
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[22px] border border-dashed border-[var(--border-soft)] bg-[var(--panel-2)] p-6 text-center text-sm text-[var(--text-muted)] sm:rounded-[24px] sm:p-8"
        >
          No salary saved yet.
        </motion.section>
      )}
    </div>
  );
}

export default Salary;