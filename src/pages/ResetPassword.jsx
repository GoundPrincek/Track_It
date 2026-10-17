import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../config/api";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    
    try {
      await axios.post(`${API_BASE}/auth/reset-password/${token}`, { password });
      setSuccess(true);
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to reset password. The link may be expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="theme-surface w-full max-w-md rounded-[28px] p-6 shadow-[var(--shadow-shell)] sm:p-10 border border-[var(--border-soft)]"
      >
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
          Set New Password
        </h1>
        
        {!success ? (
          <>
            <p className="mb-8 text-sm leading-6 text-[var(--text-secondary)]">
              Your new password must be different from previous used passwords and at least 6 characters long.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--text-muted)]">
                    <Lock size={18} />
                  </div>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-[18px] border border-[var(--border-strong)] bg-[var(--shell-bg)] py-3.5 pl-11 pr-11 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--text-muted)]">
                    <Lock size={18} />
                  </div>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-[18px] border border-[var(--border-strong)] bg-[var(--shell-bg)] py-3.5 pl-11 pr-11 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-[16px] border border-[var(--danger-border)] bg-[var(--danger-bg)] p-4 text-sm font-medium text-[var(--danger-text)]">
                  {error}
                </div>
              )}

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="theme-primary-btn w-full rounded-[18px] py-3.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Updating..." : "Reset Password"}
              </motion.button>
            </form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-6 text-center"
          >
            <div className="mb-6 rounded-full bg-[var(--status-success-bg)] p-4 text-[var(--status-success-text)]">
              <Lock size={32} />
            </div>
            <h2 className="mb-2 text-xl font-bold text-[var(--text-primary)]">Password Reset!</h2>
            <p className="mb-8 text-sm leading-6 text-[var(--text-secondary)]">
              Your password has been successfully reset. You can now use your new password to log in to your account.
            </p>
            <Link
              to="/login"
              className="theme-primary-btn inline-flex w-full items-center justify-center rounded-[18px] py-3.5 text-center text-sm font-semibold transition"
            >
              Go to Login
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default ResetPassword;
