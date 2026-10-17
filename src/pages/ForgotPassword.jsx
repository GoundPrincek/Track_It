import { useState } from "react";
import { MoveLeft, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../config/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      await axios.post(`${API_BASE}/auth/forgot-password`, { email });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to process your request. Please try again."
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
        <Link
          to="/login"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
        >
          <MoveLeft size={16} />
          Back to login
        </Link>

        <h1 className="mb-2 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
          Reset Password
        </h1>
        
        {!success ? (
          <>
            <p className="mb-8 text-sm leading-6 text-[var(--text-secondary)]">
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--text-muted)]">
                    <Mail size={18} />
                  </div>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-[18px] border border-[var(--border-strong)] bg-[var(--shell-bg)] py-3.5 pl-11 pr-4 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
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
                {loading ? "Processing..." : "Send Reset Link"}
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
              <Mail size={32} />
            </div>
            <h2 className="mb-2 text-xl font-bold text-[var(--text-primary)]">Check your inbox</h2>
            <p className="mb-8 text-sm leading-6 text-[var(--text-secondary)]">
              We've sent password reset instructions to <b>{email}</b>. Please check your spam folder if you don't see it.
            </p>
            <Link
              to="/login"
              className="theme-muted-btn w-full rounded-[18px] py-3.5 text-center text-sm font-semibold transition"
            >
              Return to Login
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default ForgotPassword;
