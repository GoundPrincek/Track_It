import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { API_BASE, clearStoredAuth } from "../config/api";

function Login() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formMessage, setFormMessage] = useState({
    type: "",
    text: "",
  });
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (!formMessage.text) return;

    const timer = setTimeout(() => {
      setFormMessage({ type: "", text: "" });
    }, 2800);

    return () => clearTimeout(timer);
  }, [formMessage]);

  const handleSubmit = async () => {
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password.trim(),
      };

      if (!payload.email || !payload.password) {
        setFormMessage({
          type: "error",
          text: "Please fill in email and password",
        });
        return;
      }

      if (isRegister && !payload.name) {
        setFormMessage({
          type: "error",
          text: "Please enter your name",
        });
        return;
      }

      setLoading(true);
      setFormMessage({ type: "", text: "" });

      if (isRegister) {
        const res = await axios.post(`${API_BASE}/auth/register`, {
          name: payload.name,
          email: payload.email,
          password: payload.password,
        });

        setFormMessage({
          type: "success",
          text: res.data.message || "Account created successfully",
        });
        setIsRegister(false);
      } else {
        clearStoredAuth();

        const res = await axios.post(`${API_BASE}/auth/login`, {
          email: payload.email,
          password: payload.password,
        });

        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("token", res.data.token);

        navigate("/dashboard");
      }

      setForm({
        name: "",
        email: "",
        password: "",
      });
    } catch (err) {
      if (!isRegister) {
        clearStoredAuth();
      }

      setFormMessage({
        type: "error",
        text: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <div className="grid min-h-screen lg:grid-cols-[1fr_0.94fr]">
        <div className="theme-hero hidden border-r border-[var(--border-soft)] p-8 lg:flex lg:flex-col lg:justify-between xl:p-10">
          <div>
            <div className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border-soft)] bg-[var(--status-success-bg)] text-[var(--text-primary)]">
                <span className="text-sm font-bold tracking-wide">T</span>
              </div>

              <div>
                <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                  TrackIt
                </h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  Productivity + finance workspace
                </p>
              </div>
            </div>

            <div className="mt-14 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--panel-3)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
                <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                Smart daily planning
              </div>

              <h2 className="mt-4 text-4xl font-semibold leading-tight text-[var(--text-primary)]">
                Organize salary, expenses, and goals in one calm dashboard.
              </h2>

              <p className="mt-5 text-base leading-7 text-[var(--text-secondary)]">
                TrackIt helps you manage your monthly budget, plan focused tasks,
                and keep your daily system simple and clear.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="theme-surface-2 rounded-[22px] p-5">
              <p className="text-sm text-[var(--text-secondary)]">
                Track salary with rule-based planning
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[var(--status-success-text)]">
                50-30-20 split
              </h3>
            </div>

            <div className="theme-surface-2 rounded-[22px] p-5">
              <p className="text-sm text-[var(--text-secondary)]">
                Stay focused on daily work blocks
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                Smart todo timeline
              </h3>
            </div>
          </div>
        </div>

        <div className="flex min-h-screen items-center justify-center px-3 py-6 sm:px-4 sm:py-8 md:px-5 lg:px-6">
          <div className="w-full max-w-md">
            <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
              <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
                <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--brand-bg)] px-3 py-2.5 text-sm font-semibold text-[var(--text-primary)] shadow-[var(--shadow-soft)]">
                  TrackIt
                </div>
                <span className="hidden text-sm text-[var(--text-muted)] sm:block">
                  Back to home
                </span>
              </Link>
            </div>

            <div className="theme-surface rounded-[24px] p-4 shadow-[var(--shadow-shell)] sm:rounded-[26px] sm:p-5 md:p-7">
              <div className="mb-7">
                <div className="inline-flex items-center rounded-full border border-[var(--border-soft)] bg-[var(--panel-3)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
                  {isRegister ? "Create your account" : "Welcome back"}
                </div>

                <h1 className="mt-3 text-2xl font-semibold text-[var(--text-primary)] md:text-3xl">
                  {isRegister ? "Register" : "Login"}
                </h1>

                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {isRegister
                    ? "Start using TrackIt with your personal account."
                    : "Sign in to continue to your dashboard."}
                </p>
              </div>

              {formMessage.text ? (
                <div
                  className={`mb-4 flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm ${
                    formMessage.type === "error"
                      ? "border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)]"
                      : "border-[var(--border-soft)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
                  }`}
                >
                  {formMessage.type === "error" ? (
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  ) : (
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                  )}
                  <span>{formMessage.text}</span>
                </div>
              ) : null}

              <div className="space-y-4">
                {isRegister && (
                  <div>
                    <label className="mb-2 block text-sm text-[var(--text-soft)]">
                      Name
                    </label>
                    <div className="flex items-center gap-3 rounded-2xl border bg-[var(--input-bg)] px-4 py-3">
                      <User size={18} className="shrink-0 text-[var(--text-muted)]" />
                      <input
                        type="text"
                        placeholder="Enter your name"
                        className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--input-placeholder)] outline-none"
                        value={form.name}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm text-[var(--text-soft)]">
                    Email
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border bg-[var(--input-bg)] px-4 py-3">
                    <Mail size={18} className="shrink-0 text-[var(--text-muted)]" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--input-placeholder)] outline-none"
                      value={form.email}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-[var(--text-soft)]">
                    Password
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border bg-[var(--input-bg)] px-4 py-3">
                    <Lock size={18} className="shrink-0 text-[var(--text-muted)]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--input-placeholder)] outline-none"
                      value={form.password}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSubmit();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="shrink-0 text-[var(--text-muted)]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="theme-primary-btn inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span>
                    {loading
                      ? "Please wait..."
                      : isRegister
                      ? "Register"
                      : "Login"}
                  </span>
                  {!loading && <ArrowRight size={16} />}
                </button>
              </div>

              <div className="mt-6 border-t border-[var(--border-soft)] pt-5 text-center">
                <p className="text-sm text-[var(--text-secondary)]">
                  {isRegister
                    ? "Already have an account?"
                    : "Don’t have an account?"}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setIsRegister((prev) => !prev);
                    setFormMessage({ type: "", text: "" });
                    setForm({
                      name: "",
                      email: "",
                      password: "",
                    });
                  }}
                  className="mt-3 text-sm font-medium text-[var(--accent)] transition hover:opacity-80"
                >
                  {isRegister ? "Login instead" : "Create an account"}
                </button>

                <div className="mt-5">
                  <Link
                    to="/"
                    className="theme-muted-btn inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition sm:w-auto"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-xs leading-6 text-[var(--text-muted)] sm:text-sm">
              Your dashboard, salary planner, expenses, and goals stay in one
              connected TrackIt workspace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;