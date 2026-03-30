import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock3,
  CalendarDays,
  Target,
  Plus,
  ListTodo,
  TrendingUp,
  Save,
  Trash2,
  PlayCircle,
} from "lucide-react";
import { API_BASE } from "../config/api";

function Todo() {
  const API = `${API_BASE}/todos`;

  const emptyForm = {
    title: "",
    description: "",
    deadline: "",
    workDate: "",
    startTime: "",
    endTime: "",
    progress: 0,
    priority: "medium",
    category: "productivity",
  };

  const [todos, setTodos] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [savingId, setSavingId] = useState(null);
  const [startingSessionId, setStartingSessionId] = useState(null);
  const [progressDrafts, setProgressDrafts] = useState({});

  const fetchTodos = async () => {
    try {
      const res = await axios.get(API);
      const todoList = Array.isArray(res.data) ? res.data : [];
      setTodos(todoList);

      const drafts = {};
      todoList.forEach((todo) => {
        drafts[todo._id] = Number(todo.progress || 0);
      });
      setProgressDrafts(drafts);
    } catch (err) {
      console.log(err);
      setTodos([]);
      setProgressDrafts({});
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.name === "progress" ? Number(e.target.value) : e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    try {
      await axios.post(API, form);
      setForm(emptyForm);
      fetchTodos();
    } catch (err) {
      console.log(err);
    }
  };

  const handleProgressDraftChange = (id, value) => {
    const safeValue = Math.max(0, Math.min(100, Number(value || 0)));
    setProgressDrafts((prev) => ({
      ...prev,
      [id]: safeValue,
    }));
  };

  const handleUpdateProgress = async (todo) => {
    try {
      setSavingId(todo._id);

      await axios.put(`${API}/${todo._id}`, {
        title: todo.title,
        description: todo.description || "",
        deadline: todo.deadline || "",
        workDate: todo.workDate || "",
        startTime: todo.startTime || "",
        endTime: todo.endTime || "",
        progress: Number(progressDrafts[todo._id] ?? todo.progress ?? 0),
        priority: todo.priority || "medium",
        category: todo.category || "productivity",
      });

      fetchTodos();
    } catch (err) {
      console.log("Update progress error:", err);
      alert(err.response?.data?.message || "Failed to update progress");
    } finally {
      setSavingId(null);
    }
  };

  const handleStartSession = async (id) => {
    try {
      setStartingSessionId(id);
      await axios.patch(`${API}/${id}/start-session`);
      fetchTodos();
    } catch (err) {
      console.log("Start session error:", err);
      alert(err.response?.data?.message || "Failed to start session");
    } finally {
      setStartingSessionId(null);
    }
  };

  const handleMarkComplete = async (id) => {
    try {
      setSavingId(id);
      await axios.patch(`${API}/${id}/complete`);
      fetchTodos();
    } catch (err) {
      console.log("Complete todo error:", err);
      alert(err.response?.data?.message || "Failed to complete todo");
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await axios.delete(`${API}/${id}`);
      fetchTodos();
    } catch (err) {
      console.log("Delete todo error:", err);
      alert(err.response?.data?.message || "Failed to delete todo");
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const todayTimelineTodos = useMemo(() => {
    return todos
      .filter((t) => t.workDate === today)
      .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
  }, [todos, today]);

  const totalGoals = todos.length;
  const completedGoals = todos.filter((t) => Number(t.progress) >= 100).length;
  const pendingGoals = todos.filter((t) => Number(t.progress) === 0).length;
  const inProgressGoals = todos.filter(
    (t) => Number(t.progress) > 0 && Number(t.progress) < 100
  ).length;

  const completionRate = totalGoals
    ? Math.round((completedGoals / totalGoals) * 100)
    : 0;

  const formatDate = (value) => {
    if (!value) return "Not set";
    try {
      return new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return value;
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "Not started";
    try {
      return new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "Not started";
    }
  };

  const getElapsedSessionLabel = (value) => {
    if (!value) return "";
    const started = new Date(value);
    const diffMs = currentTime.getTime() - started.getTime();

    if (Number.isNaN(started.getTime()) || diffMs < 0) return "";

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours <= 0) {
      return `${minutes} min active`;
    }

    if (minutes === 0) {
      return `${hours} hr active`;
    }

    return `${hours} hr ${minutes} min active`;
  };

  const getPriorityStyle = (priority) => {
    if (priority === "high") {
      return "border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)]";
    }
    if (priority === "low") {
      return "border-[var(--border-soft)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]";
    }
    return "border-[var(--border-soft)] bg-[var(--status-warm-bg)] text-[var(--status-warm-text)]";
  };

  const getProgressState = (progress) => {
    const safeProgress = Number(progress || 0);

    if (safeProgress >= 100) {
      return {
        label: "Completed",
        badgeClass:
          "border-[var(--border-soft)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]",
        valueClass: "text-[var(--status-success-text)]",
        barClass:
          "bg-[linear-gradient(90deg,var(--color-savings),var(--status-success-text))]",
      };
    }

    if (safeProgress > 0) {
      return {
        label: "In Progress",
        badgeClass:
          "border-[var(--border-soft)] bg-[var(--status-warm-bg)] text-[var(--status-warm-text)]",
        valueClass: "text-[var(--status-warm-text)]",
        barClass:
          "bg-[linear-gradient(90deg,var(--status-warm-text),var(--accent-warm))]",
      };
    }

    return {
      label: "Pending",
      badgeClass:
        "border-[var(--border-soft)] bg-[var(--status-neutral-bg)] text-[var(--color-accent)]",
      valueClass: "text-[var(--color-accent)]",
      barClass:
        "bg-[linear-gradient(90deg,var(--accent),var(--accent-2))]",
    };
  };

  const statCards = [
    {
      title: "Total Goals",
      value: totalGoals,
      subtitle: "All tracked tasks",
      icon: ListTodo,
      valueClass: "text-[var(--text-primary)]",
      iconSurface:
        "bg-[var(--status-neutral-bg)] text-[var(--color-accent)]",
    },
    {
      title: "Completed",
      value: completedGoals,
      subtitle: "Finished goals",
      icon: CheckCircle2,
      valueClass: "text-[var(--status-success-text)]",
      iconSurface:
        "bg-[var(--status-success-bg)] text-[var(--status-success-text)]",
    },
    {
      title: "In Progress",
      value: inProgressGoals,
      subtitle: "Currently moving",
      icon: Clock3,
      valueClass: "text-[var(--status-warm-text)]",
      iconSurface:
        "bg-[var(--status-warm-bg)] text-[var(--status-warm-text)]",
    },
    {
      title: "Pending",
      value: pendingGoals,
      subtitle: "Waiting to be done",
      icon: Target,
      valueClass: "text-[var(--color-accent)]",
      iconSurface:
        "bg-[var(--status-neutral-bg)] text-[var(--color-accent)]",
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
        <div className="grid items-start gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--panel-3)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              <span className="truncate">
                Smart planning with daily time blocks
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
              Smart Goal Tracker
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] md:text-[15px]">
              Plan your day with structured time slots, track progress clearly,
              and keep your workflow organized.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <motion.div
                whileHover={{ y: -2 }}
                className="theme-pill inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm sm:w-auto sm:justify-start"
              >
                <TrendingUp size={16} className="text-[var(--accent)]" />
                Completion rate: {completionRate}%
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                className="theme-pill inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm sm:w-auto sm:justify-start"
              >
                <CalendarDays size={16} className="text-[var(--accent)]" />
                Today tasks: {todayTimelineTodos.length}
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
            whileHover={{ y: -3 }}
            className="theme-surface rounded-[22px] p-4 text-center sm:rounded-[24px] sm:p-5"
          >
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Live Clock
            </div>
            <h2 className="break-words text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl md:text-4xl">
              {currentTime.toLocaleTimeString()}
            </h2>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              {currentTime.toLocaleDateString("en-IN", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {statCards.map((card, index) => {
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
        transition={{ duration: 0.45, delay: 0.16, ease: "easeOut" }}
        className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]"
      >
        <motion.div
          whileHover={{ y: -4 }}
          className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5"
        >
          <div className="mb-5 flex items-start gap-3">
            <div className="rounded-2xl bg-[var(--status-success-bg)] p-2.5 text-[var(--status-success-text)]">
              <Plus size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Add Goal
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Create a goal with date, time, priority, and progress
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-[var(--text-soft)]">
                Title
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="text"
                name="title"
                placeholder="Goal title"
                value={form.title}
                onChange={handleChange}
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-[var(--text-soft)]">
                Description
              </label>
              <motion.textarea
                whileFocus={{ scale: 1.01 }}
                name="description"
                rows="4"
                placeholder="Add a short description"
                value={form.description}
                onChange={handleChange}
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-[var(--text-soft)]">
                Deadline
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-[var(--text-soft)]">
                Work Date
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="date"
                name="workDate"
                value={form.workDate}
                onChange={handleChange}
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-[var(--text-soft)]">
                Start Time
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-[var(--text-soft)]">
                End Time
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-[var(--text-soft)]">
                Priority
              </label>
              <motion.select
                whileFocus={{ scale: 1.01 }}
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </motion.select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-[var(--text-soft)]">
                Category
              </label>
              <motion.select
                whileFocus={{ scale: 1.01 }}
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              >
                <option value="productivity">Productivity</option>
                <option value="study">Study</option>
                <option value="work">Work</option>
                <option value="health">Health</option>
                <option value="personal">Personal</option>
              </motion.select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-[var(--text-soft)]">
                Initial Progress
              </label>
              <input
                type="range"
                name="progress"
                min="0"
                max="100"
                value={form.progress}
                onChange={handleChange}
                className="w-full"
              />
              <div className="mt-2 text-sm text-[var(--text-secondary)]">
                {form.progress}% progress
              </div>
            </div>

            <div className="md:col-span-2 pt-1">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="theme-primary-btn inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition sm:w-auto"
              >
                <Plus size={16} />
                Add Goal
              </motion.button>
            </div>
          </form>
        </motion.div>

        <div className="space-y-4">
          <motion.div
            whileHover={{ y: -4 }}
            className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5"
          >
            <div className="mb-5 flex items-start gap-3">
              <div className="rounded-2xl bg-[var(--status-neutral-bg)] p-2.5 text-[var(--color-accent)]">
                <Clock3 size={18} />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Today Timeline
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Your tasks scheduled for today
                </p>
              </div>
            </div>

            {todayTimelineTodos.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-[var(--border-soft)] bg-[var(--panel-3)] p-5 text-sm text-[var(--text-muted)] sm:p-6">
                No tasks planned for today.
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {todayTimelineTodos.map((todo, index) => {
                    const progressMeta = getProgressState(todo.progress);

                    return (
                      <motion.div
                        key={todo._id}
                        initial={{ opacity: 0, x: -18 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 18 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.05,
                          ease: "easeOut",
                        }}
                        whileHover={{ y: -2 }}
                        className="theme-surface-3 rounded-[20px] p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h3 className="break-words text-base font-semibold text-[var(--text-primary)]">
                              {todo.title}
                            </h3>
                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                              {todo.startTime || "--:--"} to {todo.endTime || "--:--"}
                            </p>

                            {todo.sessionStartedAt ? (
                              <p className="mt-2 text-xs text-[var(--text-muted)]">
                                Session started: {formatDateTime(todo.sessionStartedAt)} ·{" "}
                                {getElapsedSessionLabel(todo.sessionStartedAt)}
                              </p>
                            ) : null}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getPriorityStyle(
                                todo.priority
                              )}`}
                            >
                              {todo.priority || "medium"}
                            </span>

                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${progressMeta.badgeClass}`}
                            >
                              {Number(todo.progress || 0)}%
                            </span>

                            {todo.sessionStartedAt && Number(todo.progress || 0) < 100 ? (
                              <span className="inline-flex rounded-full border border-[var(--border-soft)] bg-[var(--status-warm-bg)] px-3 py-1 text-xs font-semibold text-[var(--status-warm-text)]">
                                Session Active
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5"
          >
            <div className="mb-5 flex items-start gap-3">
              <div className="rounded-2xl bg-[var(--status-warm-bg)] p-2.5 text-[var(--status-warm-text)]">
                <Target size={18} />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Quick Summary
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  A compact overview of your current task status
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {[
                {
                  label: "Completion Rate",
                  value: `${completionRate}%`,
                  valueClass: "text-[var(--status-success-text)]",
                },
                {
                  label: "Today Planned",
                  value: todayTimelineTodos.length,
                  valueClass: "text-[var(--color-accent)]",
                },
                {
                  label: "Active Goals",
                  value: inProgressGoals,
                  valueClass: "text-[var(--status-warm-text)]",
                  wrapperClass: "sm:col-span-2 xl:col-span-1",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.18 + index * 0.08 }}
                  className={`theme-surface-3 rounded-[20px] p-4 ${item.wrapperClass || ""}`}
                >
                  <p className="text-sm text-[var(--text-secondary)]">
                    {item.label}
                  </p>
                  <h3 className={`mt-1 text-xl font-semibold ${item.valueClass}`}>
                    {item.value}
                  </h3>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.24, ease: "easeOut" }}
        className="theme-surface-2 rounded-[22px] p-4 sm:rounded-[24px] sm:p-5"
      >
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              All Goals
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Update progress, start sessions, complete tasks, or remove finished items
            </p>
          </div>

          <motion.div
            whileHover={{ y: -2 }}
            className="theme-pill w-fit rounded-full px-3 py-1.5 text-xs font-medium"
          >
            {totalGoals} total goals
          </motion.div>
        </div>

        {todos.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-[var(--border-soft)] bg-[var(--panel-3)] p-5 text-sm text-[var(--text-muted)] sm:p-6">
            No goals added yet.
          </div>
        ) : (
          <div className="grid gap-3">
            <AnimatePresence>
              {todos.map((todo, index) => {
                const progressValue = Number(
                  progressDrafts[todo._id] ?? todo.progress ?? 0
                );

                const isSessionActive =
                  Boolean(todo.sessionStartedAt) && Number(todo.progress || 0) < 100;

                const progressMeta = getProgressState(progressValue);

                return (
                  <motion.div
                    key={todo._id}
                    layout
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -18, scale: 0.98 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.04,
                      ease: "easeOut",
                    }}
                    whileHover={{ y: -3 }}
                    className="theme-surface-3 rounded-[20px] p-4"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="break-words text-base font-semibold text-[var(--text-primary)] sm:text-lg">
                              {todo.title}
                            </h3>

                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getPriorityStyle(
                                todo.priority
                              )}`}
                            >
                              {todo.priority || "medium"}
                            </span>

                            <span className="inline-flex rounded-full border border-[var(--border-soft)] bg-[var(--panel-4)] px-2.5 py-1 text-xs font-semibold capitalize text-[var(--text-primary)]">
                              {todo.category || "productivity"}
                            </span>

                            {isSessionActive ? (
                              <span className="inline-flex rounded-full border border-[var(--border-soft)] bg-[var(--status-warm-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--status-warm-text)]">
                                Session Active
                              </span>
                            ) : null}
                          </div>

                          {todo.description ? (
                            <p className="mt-3 break-words text-sm leading-6 text-[var(--text-secondary)]">
                              {todo.description}
                            </p>
                          ) : null}

                          <div className="mt-3 flex flex-wrap gap-2 text-sm text-[var(--text-soft)]">
                            <span className="rounded-xl bg-[var(--panel-4)] px-3 py-1.5">
                              <b>Deadline:</b> {formatDate(todo.deadline)}
                            </span>
                            <span className="rounded-xl bg-[var(--panel-4)] px-3 py-1.5">
                              <b>Work Date:</b> {formatDate(todo.workDate)}
                            </span>
                            <span className="rounded-xl bg-[var(--panel-4)] px-3 py-1.5">
                              <b>Time:</b> {todo.startTime || "--:--"} -{" "}
                              {todo.endTime || "--:--"}
                            </span>

                            {todo.sessionStartedAt ? (
                              <span className="rounded-xl bg-[var(--panel-4)] px-3 py-1.5">
                                <b>Session:</b> {formatDateTime(todo.sessionStartedAt)}
                              </span>
                            ) : null}

                            {todo.sessionStartedAt ? (
                              <span className="rounded-xl bg-[var(--panel-4)] px-3 py-1.5">
                                <b>Elapsed:</b> {getElapsedSessionLabel(todo.sessionStartedAt)}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${progressMeta.badgeClass}`}
                          >
                            {progressMeta.label}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="text-sm text-[var(--text-secondary)]">
                            Progress
                          </p>
                          <motion.p
                            key={progressValue}
                            initial={{ scale: 0.92, opacity: 0.7 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`text-sm font-medium ${progressMeta.valueClass}`}
                          >
                            {progressValue}%
                          </motion.p>
                        </div>

                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={progressValue}
                          onChange={(e) =>
                            handleProgressDraftChange(todo._id, e.target.value)
                          }
                          className="w-full"
                        />

                        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--panel-4)]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressValue}%` }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            className={`h-2.5 rounded-full ${progressMeta.barClass}`}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        <motion.button
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => handleStartSession(todo._id)}
                          disabled={
                            startingSessionId === todo._id ||
                            Number(progressValue) >= 100
                          }
                          className="theme-muted-btn inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                          <PlayCircle size={16} />
                          {startingSessionId === todo._id
                            ? "Starting..."
                            : isSessionActive
                            ? "Restart Session"
                            : "Start Session"}
                        </motion.button>

                        <motion.button
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => handleUpdateProgress(todo)}
                          disabled={savingId === todo._id}
                          className="theme-primary-btn inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                          <motion.span
                            animate={
                              savingId === todo._id
                                ? { rotate: [0, -8, 8, 0] }
                                : { rotate: 0 }
                            }
                            transition={
                              savingId === todo._id
                                ? {
                                    repeat: Infinity,
                                    duration: 0.8,
                                    ease: "easeInOut",
                                  }
                                : { duration: 0.2 }
                            }
                            className="inline-flex"
                          >
                            <Save size={16} />
                          </motion.span>
                          {savingId === todo._id ? "Saving..." : "Save Progress"}
                        </motion.button>

                        <motion.button
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => handleMarkComplete(todo._id)}
                          disabled={savingId === todo._id || progressValue >= 100}
                          className="theme-muted-btn inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                          <CheckCircle2 size={16} />
                          Mark Complete
                        </motion.button>

                        <motion.button
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => handleDeleteTodo(todo._id)}
                          className="theme-danger-btn inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition sm:w-auto"
                        >
                          <Trash2 size={16} />
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.section>
    </div>
  );
}

export default Todo;