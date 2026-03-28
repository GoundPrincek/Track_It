import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Wallet,
  CheckSquare,
  PiggyBank,
  Upload,
  BarChart3,
  ShieldCheck,
  Sparkles,
  CalendarDays,
  Check,
  Star,
  ChevronDown,
  Quote,
  Zap,
  Target,
  BadgeIndianRupee,
} from "lucide-react";

function Landing() {
  const token = localStorage.getItem("token");
  const dashboardPath = token ? "/dashboard" : "/login";
  const [openFaq, setOpenFaq] = useState(0);

  const features = [
    {
      icon: Wallet,
      title: "Smart expense tracking",
      description:
        "Add expenses manually or import bank statements and review categorized spending.",
      iconClass: "bg-[var(--status-warm-bg)] text-[var(--status-warm-text)]",
    },
    {
      icon: PiggyBank,
      title: "Salary planning",
      description:
        "Split income using the 50-30-20 rule and keep your monthly money flow clear.",
      iconClass: "bg-[var(--status-success-bg)] text-[var(--status-success-text)]",
    },
    {
      icon: CheckSquare,
      title: "Focused todo system",
      description:
        "Plan goals with deadlines, work dates, time blocks, and real progress updates.",
      iconClass: "bg-[var(--status-neutral-bg)] text-[var(--text-primary)]",
    },
    {
      icon: Upload,
      title: "Statement import",
      description:
        "Upload CSV or PDF statements and edit suggested categories before finalizing.",
      iconClass: "bg-[var(--status-success-bg)] text-[var(--status-success-text)]",
    },
    {
      icon: BarChart3,
      title: "Actionable dashboard",
      description:
        "See balance, spending, productivity, and budget insights from one place.",
      iconClass: "bg-[var(--status-warm-bg)] text-[var(--status-warm-text)]",
    },
    {
      icon: ShieldCheck,
      title: "Private workspace",
      description:
        "Your personal finance and productivity system stays behind secure login access.",
      iconClass: "bg-[var(--status-neutral-bg)] text-[var(--text-primary)]",
    },
  ];

  const pricingCards = [
    {
      name: "Starter",
      badge: "Best to begin",
      price: "Free",
      description:
        "Start managing daily money flow and personal productivity in one place.",
      icon: Sparkles,
      iconClass:
        "bg-[var(--status-neutral-bg)] text-[var(--text-primary)]",
      features: [
        "Salary planner",
        "Manual expense tracking",
        "Todo timeline",
        "Dashboard overview",
      ],
      cta: token ? "Open Dashboard" : "Start Free",
      path: dashboardPath,
      highlighted: false,
    },
    {
      name: "TrackIt Plus",
      badge: "Most valuable",
      price: "Power mode",
      description:
        "Built for people who want deeper clarity, faster tracking, and smarter routines.",
      icon: Zap,
      iconClass:
        "bg-[var(--status-success-bg)] text-[var(--status-success-text)]",
      features: [
        "Bank statement import",
        "Wants / needs / savings review",
        "Deeper financial visibility",
        "Structured daily planning",
        "Better decision support",
      ],
      cta: token ? "Go to Dashboard" : "Get Started",
      path: dashboardPath,
      highlighted: true,
    },
    {
      name: "Future Pro",
      badge: "Coming next",
      price: "Soon",
      description:
        "For advanced reports, analytics, reminders, and export-friendly workflows.",
      icon: BarChart3,
      iconClass:
        "bg-[var(--status-warm-bg)] text-[var(--status-warm-text)]",
      features: [
        "Advanced analytics",
        "Notifications & reminders",
        "Reports and exports",
        "Custom rules & settings",
      ],
      cta: "Explore TrackIt",
      path: dashboardPath,
      highlighted: false,
    },
  ];

  const testimonials = [
    {
      name: "Aarav",
      role: "Student",
      quote:
        "TrackIt made budgeting feel less stressful. I can finally see where my money goes and still plan my study day properly.",
    },
    {
      name: "Riya",
      role: "Early career user",
      quote:
        "The combination of salary planning and goal tracking is what makes this feel useful every day, not just once a month.",
    },
    {
      name: "Kabir",
      role: "Focused builder",
      quote:
        "Importing statements plus editing wants and needs manually is exactly the control I wanted. It feels practical, not rigid.",
    },
  ];

  const faqs = [
    {
      question: "What is TrackIt mainly used for?",
      answer:
        "TrackIt is designed to help users manage salary planning, expense tracking, bank statement imports, and daily goal execution from one connected workspace.",
    },
    {
      question: "Can I use TrackIt without uploading a bank statement?",
      answer:
        "Yes. You can manually add expenses, save salary details, and manage goals without importing any statement file.",
    },
    {
      question: "How does the statement import work?",
      answer:
        "You upload a CSV or PDF bank statement in the Expenses section. TrackIt extracts transactions, suggests categories like want, need, or saving, and lets you edit them before final review.",
    },
    {
      question: "Are the suggested expense categories final?",
      answer:
        "No. The system only suggests a category. You always have final control and can change a transaction from want to need, or to any other supported category.",
    },
    {
      question: "Is the dashboard protected after login?",
      answer:
        "Yes. Main app pages like Dashboard, Salary, Expenses, and Todo stay behind protected routes, so only logged-in users can access them.",
    },
  ];

  const heroStats = useMemo(
    () => [
      {
        value: "50-30-20",
        label: "salary budgeting rule",
        icon: BadgeIndianRupee,
        iconClass:
          "bg-[var(--status-success-bg)] text-[var(--status-success-text)]",
      },
      {
        value: "CSV + PDF",
        label: "statement import support",
        icon: Upload,
        iconClass:
          "bg-[var(--status-warm-bg)] text-[var(--status-warm-text)]",
      },
      {
        value: "Daily goals",
        label: "timeline-based planning",
        icon: CalendarDays,
        iconClass:
          "bg-[var(--status-neutral-bg)] text-[var(--text-primary)]",
      },
      {
        value: "One place",
        label: "money + productivity",
        icon: Target,
        iconClass:
          "bg-[var(--status-success-bg)] text-[var(--status-success-text)]",
      },
    ],
    []
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--bg-glow-1),transparent_28%),radial-gradient(circle_at_top_right,var(--bg-glow-2),transparent_22%),radial-gradient(circle_at_bottom_center,var(--bg-glow-3),transparent_30%)]" />
      </div>

      <header className="relative z-20">
        <div className="flex items-center justify-between gap-3 px-3 py-4 sm:px-4 md:px-5 xl:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="shrink-0 rounded-2xl border border-[var(--border-soft)] bg-[var(--brand-bg)] px-3 py-2.5 text-sm font-semibold text-[var(--text-primary)] shadow-[var(--shadow-soft)] sm:px-3.5">
              TrackIt
            </div>
            <span className="hidden truncate text-sm text-[var(--text-muted)] sm:block">
              Productivity + finance system
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/login"
              className="theme-muted-btn inline-flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-medium transition sm:px-4"
            >
              Login
            </Link>

            <Link
              to={dashboardPath}
              className="theme-primary-btn inline-flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-medium transition sm:px-4"
            >
              <span className="hidden sm:inline">
                {token ? "Open Dashboard" : "Get Started"}
              </span>
              <span className="sm:hidden">{token ? "Dashboard" : "Start"}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-3 pb-10 pt-4 sm:px-4 md:px-5 md:pb-12 md:pt-6 xl:px-6">
        <section className="grid items-center gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="theme-hero rounded-[24px] p-4 sm:rounded-[28px] sm:p-6 md:p-8">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--panel-3)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] sm:text-xs">
              <Sparkles size={14} className="shrink-0 text-[var(--accent)]" />
              <span className="truncate">
                Finance and productivity in one workspace
              </span>
            </div>

            <h1 className="mt-5 max-w-4xl text-3xl font-semibold leading-tight text-[var(--text-primary)] sm:text-4xl md:text-5xl xl:text-6xl">
              Start your day with a cleaner system for money, goals, and focus.
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base sm:leading-8">
              TrackIt helps you plan salary, manage expenses, import statements,
              organize daily work, and monitor progress from one calm dashboard.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                to={dashboardPath}
                className="theme-primary-btn inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition sm:w-auto"
              >
                {token ? "Go to Dashboard" : "Start with TrackIt"}
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/login"
                className="theme-muted-btn inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition sm:w-auto"
              >
                Login / Register
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {heroStats.map((stat, index) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="theme-surface-2 landing-stat-card rounded-[20px] p-4 sm:rounded-[22px]"
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    <div
                      className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl ${stat.iconClass}`}
                    >
                      <Icon size={18} />
                    </div>

                    <h3 className="text-lg font-semibold text-[var(--text-primary)] sm:text-xl">
                      {stat.value}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="theme-surface rounded-[24px] p-4 sm:rounded-[28px] sm:p-5 md:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-[var(--status-success-bg)] p-2.5 text-[var(--status-success-text)]">
                  <CalendarDays size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-[var(--text-secondary)]">
                    Daily clarity
                  </p>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)] sm:text-xl">
                    Plan, track, adjust
                  </h2>
                </div>
              </div>

              <p className="text-sm leading-7 text-[var(--text-secondary)]">
                Build a routine where your spending, savings, and task flow stay
                connected instead of scattered across separate tools.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5">
                <p className="text-sm text-[var(--text-secondary)]">
                  Expense visibility
                </p>
                <h3 className="mt-2 text-lg font-semibold text-[var(--status-warm-text)]">
                  Review spending patterns
                </h3>
              </div>

              <div className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5">
                <p className="text-sm text-[var(--text-secondary)]">
                  Goal execution
                </p>
                <h3 className="mt-2 text-lg font-semibold text-[var(--status-success-text)]">
                  Focus on daily progress
                </h3>
              </div>
            </div>

            <div className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5">
              <p className="text-sm text-[var(--text-secondary)]">
                Designed for students and focused builders
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                One dashboard. Less chaos. Better decisions.
              </h3>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--panel-3)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
              Feature Plans
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              Compare how the workspace grows with you
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {pricingCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.name}
                  className={`rounded-[24px] border p-4 sm:rounded-[26px] sm:p-5 transition ${
                    card.highlighted
                      ? "border-[var(--border-strong)] bg-[linear-gradient(180deg,var(--panel-2),var(--panel-1))] shadow-[var(--shadow-shell)]"
                      : "theme-surface-2"
                  }`}
                >
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="theme-pill inline-flex rounded-full px-3 py-1 text-xs font-medium">
                        {card.badge}
                      </div>
                      <h3 className="mt-3 text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
                        {card.name}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                        {card.description}
                      </p>
                    </div>

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${card.iconClass}`}
                    >
                      <Icon size={18} />
                    </div>
                  </div>

                  <div className="mb-5">
                    <p className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
                      {card.price}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {card.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--status-success-bg)] text-[var(--status-success-text)]">
                          <Check size={12} />
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {feature}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Link
                    to={card.path}
                    className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      card.highlighted ? "theme-primary-btn" : "theme-muted-btn"
                    }`}
                  >
                    {card.cta}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--panel-3)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
              Core Features
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="theme-surface-2 rounded-[22px] p-4 transition hover:border-[var(--border-strong)] hover:bg-[var(--panel-3)] sm:rounded-[24px] sm:p-5"
                >
                  <div
                    className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${feature.iconClass}`}
                  >
                    <Icon size={18} />
                  </div>

                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--panel-3)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
              Testimonials
            </div>
            <div className="hidden items-center gap-1 md:flex">
              {[1, 2, 3, 4, 5].map((item) => (
                <Star
                  key={item}
                  size={15}
                  className="fill-[var(--status-warm-text)] text-[var(--status-warm-text)]"
                />
              ))}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {testimonials.map((item) => (
              <div
                key={item.name}
                className="theme-surface rounded-[22px] p-4 sm:rounded-[24px] sm:p-5"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--status-neutral-bg)] text-[var(--text-primary)]">
                  <Quote size={18} />
                </div>

                <p className="text-sm leading-7 text-[var(--text-secondary)]">
                  “{item.quote}”
                </p>

                <div className="mt-5 border-t border-[var(--border-soft)] pt-4">
                  <h3 className="font-semibold text-[var(--text-primary)]">
                    {item.name}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    {item.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[0.95fr_1.05fr] xl:gap-6">
          <div className="theme-surface rounded-[24px] p-4 sm:rounded-[28px] sm:p-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--panel-3)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
              FAQ
            </div>

            <h2 className="mt-4 text-2xl font-semibold text-[var(--text-primary)] md:text-3xl">
              Common questions about TrackIt
            </h2>

            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
              Everything a new user usually wants to know before starting with
              the platform.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={faq.question}
                  className="theme-surface-2 overflow-hidden rounded-[20px] sm:rounded-[22px]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-5"
                  >
                    <span className="pr-2 text-sm font-medium text-[var(--text-primary)] sm:text-base">
                      {faq.question}
                    </span>

                    <ChevronDown
                      size={18}
                      className={`shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen ? (
                    <div className="border-t border-[var(--border-soft)] px-4 py-4 sm:px-5">
                      <p className="text-sm leading-7 text-[var(--text-secondary)]">
                        {faq.answer}
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-6">
          <div className="theme-surface rounded-[24px] p-5 text-center sm:rounded-[28px] sm:p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] md:text-3xl">
              Ready to start with TrackIt?
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] md:text-base">
              Create your account, log in, and begin organizing salary,
              expenses, and daily work from one place.
            </p>

            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
              <Link
                to="/login"
                className="theme-primary-btn inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition sm:w-auto"
              >
                Get Started
                <ArrowRight size={16} />
              </Link>

              <Link
                to={token ? "/dashboard" : "/login"}
                className="theme-muted-btn inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition sm:w-auto"
              >
                {token ? "Open Dashboard" : "Login"}
              </Link>
            </div>
          </div>
        </section>

        <footer className="mt-6 border-t border-[var(--border-soft)] pt-6">
          <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="inline-flex flex-wrap items-center gap-3">
                <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--brand-bg)] px-3.5 py-2.5 text-sm font-semibold text-[var(--text-primary)] shadow-[var(--shadow-soft)]">
                  TrackIt
                </div>
                <span className="text-sm text-[var(--text-muted)]">
                  Productivity + finance workspace
                </span>
              </div>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">
                TrackIt is built to help users manage money and execution in one
                practical system — from salary planning to expenses to focused
                daily progress.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Product
                </h3>
                <div className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
                  <p>Dashboard</p>
                  <p>Expenses</p>
                  <p>Salary</p>
                  <p>Todo</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Use Cases
                </h3>
                <div className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
                  <p>Students</p>
                  <p>Personal budgeting</p>
                  <p>Daily planning</p>
                  <p>Routine building</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Access
                </h3>
                <div className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
                  <p>Login</p>
                  <p>Register</p>
                  <p>Protected dashboard</p>
                  <p>Private workflow</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-[var(--border-soft)] pt-4 text-sm text-[var(--text-muted)]">
            © 2026 TrackIt. Built for smarter money and focused execution.
          </div>
        </footer>
      </main>
    </div>
  );
}

export default Landing;