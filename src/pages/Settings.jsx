import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings as SettingsIcon,
  Palette,
  ShieldCheck,
  MonitorSmartphone,
  Save,
  CheckCircle2,
  Moon,
  Sun,
  User,
} from "lucide-react";

function Settings({ theme = "dark", setTheme = () => {} }) {
  const [name, setName] = useState("");
  const [autoOpenDashboard, setAutoOpenDashboard] = useState(() => {
    return localStorage.getItem("trackit-auto-dashboard") === "true";
  });
  const [compactCards, setCompactCards] = useState(() => {
    return localStorage.getItem("trackit-compact-cards") === "true";
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    try {
      const parsed = savedUser ? JSON.parse(savedUser) : null;
      setName(parsed?.name || "");
    } catch {
      setName("");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("trackit-auto-dashboard", String(autoOpenDashboard));
  }, [autoOpenDashboard]);

  useEffect(() => {
    localStorage.setItem("trackit-compact-cards", String(compactCards));
  }, [compactCards]);

  useEffect(() => {
    if (!showSuccess) return;
    const timer = setTimeout(() => setShowSuccess(false), 2200);
    return () => clearTimeout(timer);
  }, [showSuccess]);

  const sectionMotion = {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: "easeOut" },
  };

  const infoCards = useMemo(
    () => [
      {
        title: "Current Theme",
        value: theme === "dark" ? "Dark Mode" : "Light Mode",
        subtitle: "Stored in your browser preferences",
        icon: theme === "dark" ? Moon : Sun,
      },
      {
        title: "Auto Open Dashboard",
        value: autoOpenDashboard ? "Enabled" : "Disabled",
        subtitle: "Keeps your workflow focused after login",
        icon: MonitorSmartphone,
      },
      {
        title: "Compact Card Mode",
        value: compactCards ? "Enabled" : "Disabled",
        subtitle: "Prepared for future layout preference usage",
        icon: Palette,
      },
    ],
    [theme, autoOpenDashboard, compactCards]
  );

  const handleSaveSettings = () => {
    const savedUser = localStorage.getItem("user");

    try {
      const parsed = savedUser ? JSON.parse(savedUser) : {};
      const nextUser = { ...parsed, name };
      localStorage.setItem("user", JSON.stringify(nextUser));
    } catch {
      localStorage.setItem("user", JSON.stringify({ name }));
    }

    setShowSuccess(true);
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
              <span className="truncate">Personalize your TrackIt workspace</span>
            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
              Settings
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] md:text-[15px]">
              Manage appearance preferences, profile basics, and workspace behavior
              from one place.
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
              <ShieldCheck size={14} />
              Account State
            </div>

            <h2 className="break-words text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
              {name || "TrackIt User"}
            </h2>

            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Your local preferences are saved in the browser so your experience
              stays consistent.
            </p>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
        className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]"
      >
        <motion.div
          whileHover={{ y: -4 }}
          className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5"
        >
          <div className="mb-5 flex items-start gap-3">
            <div className="rounded-2xl bg-[var(--status-success-bg)] p-2.5 text-[var(--status-success-text)]">
              <SettingsIcon size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Workspace Preferences
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Save basic app behavior and personal setup
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="mb-2 block text-sm text-[var(--text-soft)]">
                Display Name
              </label>
              <div className="flex items-center gap-3 rounded-2xl border bg-[var(--input-bg)] px-4 py-3">
                <User size={18} className="shrink-0 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--input-placeholder)] outline-none"
                />
              </div>
            </div>

            <div className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--panel-2)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Theme Mode
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Switch between dark and light appearance
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
                  }
                  className="theme-primary-btn inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium"
                >
                  {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                  {theme === "dark" ? "Light" : "Dark"}
                </button>
              </div>
            </div>

            <div className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--panel-2)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Auto Open Dashboard
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Prepared preference for smoother workflow routing
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAutoOpenDashboard((prev) => !prev)}
                  className={`inline-flex min-w-[86px] items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition ${
                    autoOpenDashboard
                      ? "bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
                      : "bg-[var(--panel-3)] text-[var(--text-secondary)]"
                  }`}
                >
                  {autoOpenDashboard ? "On" : "Off"}
                </button>
              </div>
            </div>

            <div className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--panel-2)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Compact Cards
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Saved now for future density and layout improvements
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setCompactCards((prev) => !prev)}
                  className={`inline-flex min-w-[86px] items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition ${
                    compactCards
                      ? "bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
                      : "bg-[var(--panel-3)] text-[var(--text-secondary)]"
                  }`}
                >
                  {compactCards ? "On" : "Off"}
                </button>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="theme-primary-btn inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium"
              >
                <Save size={16} />
                Save Settings
              </button>
            </div>

            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--status-success-bg)] px-3 py-2 text-sm text-[var(--status-success-text)]"
                >
                  <CheckCircle2 size={16} />
                  Settings saved successfully
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="space-y-4">
          {infoCards.map((card, index) => {
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
                whileHover={{ y: -4 }}
                className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--text-secondary)]">
                      {card.title}
                    </p>
                    <h2 className="mt-2 break-words text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
                      {card.value}
                    </h2>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--status-neutral-bg)] text-[var(--text-primary)]">
                    <Icon size={18} />
                  </div>
                </div>

                <p className="text-xs leading-5 text-[var(--text-muted)]">
                  {card.subtitle}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>
    </div>
  );
}

export default Settings;