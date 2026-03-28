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

const Navbar = ({ theme = "dark", setTheme = () => {} }) => {
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
    `flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
      isActive
        ? "border border-[var(--border-strong)] bg-[var(--nav-active-bg)] text-[var(--text-primary)] shadow-[var(--shadow-soft)]"
        : "border border-transparent text-[var(--text-secondary)] hover:border-[var(--border-soft)] hover:bg-[var(--panel-2)] hover:text-[var(--text-primary)]"
    }`;

  const mobileNavLinkClasses = ({ isActive }) =>
    `inline-flex min-w-fit items-center gap-2 whitespace-nowrap rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
      isActive
        ? "border border-[var(--border-strong)] bg-[var(--nav-active-bg)] text-[var(--text-primary)] shadow-[var(--shadow-soft)]"
        : "border border-transparent bg-[var(--panel-1)] text-[var(--text-secondary)] hover:border-[var(--border-soft)] hover:bg-[var(--panel-2)] hover:text-[var(--text-primary)]"
    }`;

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="sticky top-0 z-50 border-b border-[var(--border-soft)] bg-[var(--header-bg)]/92 backdrop-blur-xl"
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
                <span className="hidden truncate text-sm text-[var(--text-muted)] sm:block">
                  Productivity dashboard
                </span>
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
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-1)] px-2.5 py-2.5 text-sm font-medium text-[var(--text-primary)] shadow-[var(--shadow-soft)] transition hover:bg-[var(--panel-2)] sm:px-3"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ opacity: 0, rotate: -12, scale: 0.92 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 12, scale: 0.92 }}
                  transition={{ duration: 0.2 }}
                  className="inline-flex items-center gap-2"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="h-4 w-4" />
                      <span className="hidden sm:inline">Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      <span className="hidden sm:inline">Dark</span>
                    </>
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={handleLogout}
              aria-label="Logout"
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-bg)] px-2.5 py-2.5 text-sm font-medium text-[var(--danger-text)] transition hover:brightness-110 sm:px-3"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          </div>
        </div>

        <div className="border-t border-[var(--border-soft)] lg:hidden">
          <div className="flex w-full gap-2 overflow-x-auto px-3 py-3 sm:px-4 md:px-5 xl:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.26,
                    delay: 0.05 + index * 0.05,
                    ease: "easeOut",
                  }}
                  whileHover={{ y: -2 }}
                >
                  <NavLink to={item.path} className={mobileNavLinkClasses}>
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </NavLink>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[2px]"
              onClick={closeSidebar}
              aria-hidden="true"
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="fixed left-0 top-0 z-[70] flex h-screen w-[320px] max-w-[90vw] flex-col border-r border-[var(--border-soft)] bg-[var(--sidebar-bg)] shadow-[var(--shadow-sidebar)]"
              aria-hidden={!sidebarOpen}
            >
              <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-4 py-4 sm:px-5">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: 0.08 }}
                  className="min-w-0"
                >
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    More Options
                  </h2>
                  <p className="truncate text-xs text-[var(--text-muted)]">
                    Settings and future features
                  </p>
                </motion.div>

                <motion.button
                  whileHover={{ rotate: 90, scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={closeSidebar}
                  aria-label="Close sidebar"
                  className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-1)] p-2 text-[var(--text-secondary)] transition hover:bg-[var(--panel-2)] hover:text-[var(--text-primary)]"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: 0.1 }}
                  className="rounded-3xl border border-[var(--border-soft)] bg-[var(--panel-1)] p-4 shadow-[var(--shadow-soft)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                    Appearance
                  </p>

                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={toggleTheme}
                    className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-2)] px-4 py-3 text-left text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--panel-3)]"
                  >
                    <motion.div
                      whileHover={{ rotate: -8, scale: 1.04 }}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--panel-3)]"
                    >
                      {theme === "dark" ? (
                        <Sun className="h-4 w-4" />
                      ) : (
                        <Moon className="h-4 w-4" />
                      )}
                    </motion.div>

                    <div className="min-w-0">
                      <p className="truncate">
                        {theme === "dark"
                          ? "Switch to Light Theme"
                          : "Switch to Dark Theme"}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Change app appearance
                      </p>
                    </div>
                  </motion.button>
                </motion.div>

                <div className="mt-6 lg:hidden">
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24, delay: 0.14 }}
                    className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]"
                  >
                    Quick Navigation
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
                            delay: 0.16 + index * 0.05,
                            ease: "easeOut",
                          }}
                          whileHover={{ x: 4 }}
                        >
                          <NavLink
                            to={item.path}
                            onClick={closeSidebar}
                            className={({ isActive }) =>
                              `flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                                isActive
                                  ? "border-[var(--border-strong)] bg-[var(--nav-active-bg)] text-[var(--text-primary)] shadow-[var(--shadow-soft)]"
                                  : "border-[var(--border-soft)] bg-[var(--panel-1)] text-[var(--text-primary)] hover:bg-[var(--panel-2)]"
                              }`
                            }
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--panel-3)]">
                              <Icon className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate">{item.name}</p>
                              <p className="text-xs text-[var(--text-muted)]">
                                Open {item.name.toLowerCase()}
                              </p>
                            </div>
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
                            className="flex w-full items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-1)] px-4 py-3 text-left text-sm font-medium text-[var(--text-primary)] shadow-[var(--shadow-soft)] transition hover:bg-[var(--panel-2)]"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--panel-3)]">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p>{item.title}</p>
                              <p className="text-xs text-[var(--text-muted)]">
                                {item.subtitle}
                              </p>
                            </div>
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