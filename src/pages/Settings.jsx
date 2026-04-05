import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings as SettingsIcon,
  Palette,
  ShieldCheck,
  MonitorSmartphone,
  Save,
  CheckCircle2,
  AlertTriangle,
  Moon,
  Sun,
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Bell,
  Mail as MailIcon,
  MessageSquare,
  Phone,
} from "lucide-react";
import { API_BASE } from "../config/api";

function Settings({ theme = "dark", setTheme = () => {} }) {
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Notification Preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [urgentOnlyMode, setUrgentOnlyMode] = useState(false);

  const [autoOpenDashboard, setAutoOpenDashboard] = useState(() => {
    return localStorage.getItem("trackit-auto-dashboard") === "true";
  });
  const [compactCards, setCompactCards] = useState(() => {
    return localStorage.getItem("trackit-compact-cards") === "true";
  });

  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    try {
      const parsed = savedUser ? JSON.parse(savedUser) : null;
      setName(parsed?.name || "");
      
      const prefs = parsed?.preferences || {};
      setEmailNotifications(prefs.emailNotifications ?? true);
      setWhatsappNotifications(prefs.whatsappNotifications ?? false);
      setWhatsappNumber(prefs.whatsappNumber || "");
      setUrgentOnlyMode(prefs.urgentOnlyMode ?? false);
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
    if (!formMessage.text) return;
    const timer = setTimeout(() => setFormMessage({ type: "", text: "" }), 3000);
    return () => clearTimeout(timer);
  }, [formMessage]);

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

  const handleSaveSettings = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setFormMessage({ type: "error", text: "Name cannot be empty" });
      return;
    }

    // Validate password fields if user is trying to change password
    if (newPassword && !currentPassword) {
      setFormMessage({
        type: "error",
        text: "Please enter your current password to set a new one",
      });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setFormMessage({
        type: "error",
        text: "New password must be at least 6 characters",
      });
      return;
    }

    try {
      setSaving(true);
      setFormMessage({ type: "", text: "" });

      const payload = { 
        name: trimmedName,
        preferences: {
          emailNotifications,
          whatsappNotifications,
          whatsappNumber: whatsappNumber.trim(),
          urgentOnlyMode
        }
      };
      
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await axios.put(`${API_BASE}/auth/profile`, payload);

      // Update localStorage with new name
      try {
        const savedUser = localStorage.getItem("user");
        const parsed = savedUser ? JSON.parse(savedUser) : {};
        localStorage.setItem(
          "user",
          JSON.stringify({ 
            ...parsed, 
            name: res.data.user.name,
            preferences: res.data.user.preferences 
          })
        );
      } catch {
        // ignore localStorage errors
      }

      // Clear password fields on success
      setCurrentPassword("");
      setNewPassword("");

      setFormMessage({ type: "success", text: res.data.message || "Settings saved successfully" });
    } catch (err) {
      setFormMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
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
              Changes to your profile are saved to your account in the database.
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
            {/* Display Name */}
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

            {/* Current Password */}
            <div>
              <label className="mb-2 block text-sm text-[var(--text-soft)]">
                Current Password{" "}
                <span className="text-[var(--text-muted)]">(only if changing password)</span>
              </label>
              <div className="flex items-center gap-3 rounded-2xl border bg-[var(--input-bg)] px-4 py-3">
                <Lock size={18} className="shrink-0 text-[var(--text-muted)]" />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--input-placeholder)] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((p) => !p)}
                  className="shrink-0 text-[var(--text-muted)]"
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="mb-2 block text-sm text-[var(--text-soft)]">
                New Password{" "}
                <span className="text-[var(--text-muted)]">(leave blank to keep current)</span>
              </label>
              <div className="flex items-center gap-3 rounded-2xl border bg-[var(--input-bg)] px-4 py-3">
                <Lock size={18} className="shrink-0 text-[var(--text-muted)]" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--input-placeholder)] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((p) => !p)}
                  className="shrink-0 text-[var(--text-muted)]"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Theme Toggle */}
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

            {/* Auto Dashboard Toggle */}
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

            {/* Compact Cards Toggle */}
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

            {/* Save Button */}
            <div>
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={saving}
                className="theme-primary-btn inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Settings
                  </>
                )}
              </button>
            </div>

            {/* Success / Error Message */}
            <AnimatePresence>
              {formMessage.text && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm ${
                    formMessage.type === "error"
                      ? "border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)]"
                      : "border-[var(--border-soft)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
                  }`}
                >
                  {formMessage.type === "error" ? (
                    <AlertTriangle size={16} />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  {formMessage.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="theme-surface-2 mt-4 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5"
        >
          <div className="mb-5 flex items-start gap-3">
            <div className="rounded-2xl bg-[var(--status-neutral-bg)] p-2.5 text-[var(--accent)]">
              <Bell size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Notification Preferences
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Control how and where TrackIt sends you updates
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--panel-2)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="hidden shrink-0 sm:block">
                    <MailIcon size={20} className="text-[var(--text-muted)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      Email Reports
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Receive weekly and monthly summary reports
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEmailNotifications((prev) => !prev)}
                  className={`inline-flex min-w-[86px] items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition ${
                    emailNotifications
                      ? "bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
                      : "bg-[var(--panel-3)] text-[var(--text-secondary)]"
                  }`}
                >
                  {emailNotifications ? "On" : "Off"}
                </button>
              </div>
            </div>

            <div className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--panel-2)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="hidden shrink-0 sm:block">
                    <MessageSquare size={20} className="text-[var(--text-muted)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      WhatsApp Alerts
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Instant high-priority alerts for budgets and tasks
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setWhatsappNotifications((prev) => !prev)}
                  className={`inline-flex min-w-[86px] items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition ${
                    whatsappNotifications
                      ? "bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
                      : "bg-[var(--panel-3)] text-[var(--text-secondary)]"
                  }`}
                >
                  {whatsappNotifications ? "On" : "Off"}
                </button>
              </div>

              <AnimatePresence>
                {whatsappNotifications && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-3 rounded-2xl border bg-[var(--input-bg)] px-4 py-3">
                      <Phone size={18} className="shrink-0 text-[var(--status-success-text)]" />
                      <input
                        type="tel"
                        placeholder="e.g. +1234567890"
                        className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--input-placeholder)] outline-none"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--panel-2)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Urgent-Only Mode
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Suppress low-priority tips; only trigger on strict limits
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setUrgentOnlyMode((prev) => !prev)}
                  className={`inline-flex min-w-[86px] items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition ${
                    urgentOnlyMode
                      ? "bg-[var(--danger-bg)] text-[var(--danger-text)] border border-[var(--danger-border)]"
                      : "bg-[var(--panel-3)] text-[var(--text-secondary)]"
                  }`}
                >
                  {urgentOnlyMode ? "On" : "Off"}
                </button>
              </div>
            </div>
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