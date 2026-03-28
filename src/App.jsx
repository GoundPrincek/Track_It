import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Salary from "./pages/Salary";
import Expenses from "./pages/Expenses";
import Todo from "./pages/Todo";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Analytics from "./pages/Analytics";

import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

function AppLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isLandingPage = location.pathname === "/";

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("trackit-theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("trackit-theme", theme);
  }, [theme]);

  const hideNavbar = isLoginPage || isLandingPage;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--bg-glow-1),transparent_28%),radial-gradient(circle_at_top_right,var(--bg-glow-2),transparent_22%),radial-gradient(circle_at_bottom_center,var(--bg-glow-3),transparent_30%)]" />
      </div>

      {!hideNavbar && <Navbar theme={theme} setTheme={setTheme} />}

      {hideNavbar ? (
        <div className="relative">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      ) : (
        <main className="relative w-full px-2 py-3 sm:px-3 sm:py-4 md:px-5 md:py-6 xl:px-6">
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