import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CheckSquare,
  Receipt,
  Wallet,
  LogOut,
  Menu,
  X,
  Settings,
  Sun,
  Moon,
  Bell,
  BarChart3,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Todo", path: "/todo", icon: CheckSquare },
  { name: "Expenses", path: "/expenses", icon: Receipt },
  { name: "Salary", path: "/salary", icon: Wallet },
];

const extraFeatureItems = [
  {
    title: "Settings",
    subtitle: "Preferences and user options",
    icon: Settings,
    path: "/settings",
  },
  {
    title: "Notifications",
    subtitle: "Alerts and reminders",
    icon: Bell,
    path: "/notifications",
  },
  {
    title: "Analytics",
    subtitle: "Reports and insights",
    icon: BarChart3,
    path: "/analytics",
  },
];

const Navbar = ({
  theme = "dark",
  setTheme = () => {},
  notificationCount = 0,
  highPriorityCount = 0,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sidebarOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const closeSidebar = () => setSidebarOpen(false);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const desktopLinkClasses = ({ isActive }) =>
    `group flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
      isActive
        ? "border border-[var(--border-strong)] bg-[var(--nav-active-bg)] text-[var(--text-primary)] shadow-[var(--shadow-soft)]"
        : "border border-transparent text-[var(--text-secondary)] hover:border-[var(--border-soft)] hover:bg-[var(--panel-2)] hover:text-[var(--text-primary)]"
    }`;

  const mobileNavLinkClasses = ({ isActive }) =>
    `group inline-flex min-w-fit items-center gap-3 whitespace-nowrap rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
      isActive
        ? "border border-[var(--border-strong)] bg-[var(--nav-active-bg)] text-[var(--text-primary)] shadow-[var(--shadow-soft)]"
        : "border border-transparent bg-[var(--panel-1)] text-[var(--text-secondary)] hover:border-[var(--border-soft)] hover:bg-[var(--panel-2)] hover:text-[var(--text-primary)]"
    }`;

  const badgeLabel =
    notificationCount > 99 ? "99+" : String(notificationCount || 0);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="sticky top-0 z-50 border-b border-[var(--border-soft)] bg-[var(--header-bg)]/88 backdrop-blur-2xl"
      >
        <div className="flex w-full items-center justify-between gap-3 px-3 py-3 sm:px-4 md:px-5 xl:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              aria-expanded={sidebarOpen}
              className="shrink-0 rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-1)] p-2.5 text-[var(--text-secondary)] shadow-[var(--shadow-soft)] transition hover:bg-[var(--panel-2)] hover:text-[var(--text-primary)]"
            >
              <Menu className="h-5 w-5" />
            </motion.button>

            <motion.div whileHover={{ y: -1 }}>
              <Link
                to="/dashboard"
                className="flex min-w-0 items-center gap-2 sm:gap-3"
              >
                <div className="shrink-0 rounded-2xl border border-[var(--border-soft)] bg-[var(--brand-bg)] px-3 py-2.5 text-sm font-semibold text-[var(--text-primary)] shadow-[var(--shadow-soft)] sm:px-3.5">
                  TrackIt
                </div>
                <div className="hidden min-w-0 sm:block">
                  <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                    Finance + productivity
                  </p>
                  <p className="truncate text-xs text-[var(--text-muted)]">
                    One smarter workspace
                  </p>
                </div>
              </Link>
            </motion.div>
          </div>

          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.28,
                    delay: 0.06 + index * 0.05,
                    ease: "easeOut",
                  }}
                  whileHover={{ y: -2 }}
                >
                  <NavLink to={item.path} className={desktopLinkClasses}>
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </NavLink>
                </motion.div>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-1)] px-3 py-2.5 text-sm font-medium text-[var(--text-primary)] shadow-[var(--shadow-soft)] transition hover:bg-[var(--panel-2)]"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {theme === "dark" ? "Light" : "Dark"}
              </span>
            </motion.button>

            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => navigate("/notifications")}
              className="relative inline-flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-1)] px-3 py-2.5 text-sm font-medium text-[var(--text-primary)] shadow-[var(--shadow-soft)] transition hover:bg-[var(--panel-2)]"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden xl:inline">Alerts</span>

              {notificationCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-[22px] items-center justify-center rounded-full border border-white/15 bg-[var(--danger-bg)] px-1.5 py-1 text-[10px] font-bold leading-none text-[var(--danger-text)] shadow-[var(--shadow-soft)]">
                  {badgeLabel}
                </span>
              ) : null}
            </motion.button>

            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={handleLogout}
              className="hidden items-center gap-2 rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-bg)] px-3 py-2.5 text-sm font-medium text-[var(--danger-text)] transition hover:brightness-110 md:inline-flex"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </motion.button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSidebar}
              aria-label="Close sidebar overlay"
              className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-sm"
            />

            <motion.aside
              initial={{ x: -420, opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -420, opacity: 0.8 }}
              transition={{ type: "spring", stiffness: 250, damping: 28 }}
              className="fixed inset-y-0 left-0 z-[80] flex w-full max-w-[340px] flex-col border-r border-[var(--border-soft)] bg-[var(--sidebar-bg)] shadow-[var(--shadow-sidebar)]"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-4 py-4">
                <Link
                  to="/dashboard"
                  onClick={closeSidebar}
                  className="flex min-w-0 items-center gap-3"
                >
                  <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--brand-bg)] px-3.5 py-2.5 text-sm font-semibold text-[var(--text-primary)] shadow-[var(--shadow-soft)]">
                    TrackIt
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                      Smart workspace
                    </p>
                    <p className="truncate text-xs text-[var(--text-muted)]">
                      Budget, tasks, analytics
                    </p>
                  </div>
                </Link>

                <motion.button
                  whileHover={{ rotate: 90, scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={closeSidebar}
                  aria-label="Close sidebar"
                  className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-1)] p-2.5 text-[var(--text-secondary)] shadow-[var(--shadow-soft)] transition hover:text-[var(--text-primary)]"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24 }}
                  className="theme-surface mb-5 rounded-[24px] p-4"
                >
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--panel-3)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                    <Sparkles className="h-3.5 w-3.5" />
                    Quick access
                  </div>
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">
                    Move faster through TrackIt
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    Switch pages, update your preferences, and stay on top of
                    your alerts from one place.
                  </p>
                </motion.div>

                <div>
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24, delay: 0.08 }}
                    className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]"
                  >
                    Main Navigation
                  </motion.p>

                  <div className="space-y-2">
                    {navItems.map((item, index) => {
                      const Icon = item.icon;

                      return (
                        <motion.div
                          key={item.path}
                          initial={{ opacity: 0, x: -18 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.26,
                            delay: 0.1 + index * 0.05,
                            ease: "easeOut",
                          }}
                          whileHover={{ x: 4 }}
                        >
                          <NavLink
                            to={item.path}
                            onClick={closeSidebar}
                            className={mobileNavLinkClasses}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="flex-1">{item.name}</span>
                            <ChevronRight className="h-4 w-4 opacity-55" />
                          </NavLink>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6">
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24, delay: 0.18 }}
                    className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]"
                  >
                    Extra Features
                  </motion.p>

                  <div className="space-y-2">
                    {extraFeatureItems.map((item, index) => {
                      const Icon = item.icon;
                      const isNotificationsItem = item.path === "/notifications";

                      return (
                        <motion.div
                          key={item.path}
                          initial={{ opacity: 0, x: -18 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.26,
                            delay: 0.22 + index * 0.05,
                            ease: "easeOut",
                          }}
                          whileHover={{ x: 4 }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              navigate(item.path);
                              closeSidebar();
                            }}
                            className="relative flex w-full items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-1)] px-4 py-3 text-left text-sm font-medium text-[var(--text-primary)] shadow-[var(--shadow-soft)] transition hover:bg-[var(--panel-2)]"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--panel-3)]">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="flex items-center gap-2">
                                <span>{item.title}</span>
                                {isNotificationsItem && notificationCount > 0 ? (
                                  <span className="inline-flex min-w-[22px] items-center justify-center rounded-full border border-white/15 bg-[var(--danger-bg)] px-1.5 py-1 text-[10px] font-bold leading-none text-[var(--danger-text)]">
                                    {badgeLabel}
                                  </span>
                                ) : null}
                              </p>
                              <p className="text-xs text-[var(--text-muted)]">
                                {isNotificationsItem && notificationCount > 0
                                  ? `${notificationCount} active alert(s)${
                                      highPriorityCount > 0
                                        ? ` · ${highPriorityCount} high priority`
                                        : ""
                                    }`
                                  : item.subtitle}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 opacity-55" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, delay: 0.28 }}
                className="border-t border-[var(--border-soft)] p-4"
              >
                <div className="mb-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="theme-muted-btn inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium"
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                    {theme === "dark" ? "Light" : "Dark"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigate("/notifications");
                      closeSidebar();
                    }}
                    className="relative theme-muted-btn inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium"
                  >
                    <Bell className="h-4 w-4" />
                    Alerts

                    {notificationCount > 0 ? (
                      <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-[22px] items-center justify-center rounded-full border border-white/15 bg-[var(--danger-bg)] px-1.5 py-1 text-[10px] font-bold leading-none text-[var(--danger-text)]">
                        {badgeLabel}
                      </span>
                    ) : null}
                  </button>
                </div>

                <motion.button
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-sm font-medium text-[var(--danger-text)] transition hover:brightness-110"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </motion.button>
              </motion.div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;