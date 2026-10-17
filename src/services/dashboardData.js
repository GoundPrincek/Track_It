import axios from "axios";
import { API_BASE } from "../config/api";
import { createDashboardCache } from "./dashboardCache";

const DASHBOARD_CACHE_TTL_MS = 15000;
const dashboardCache = createDashboardCache(DASHBOARD_CACHE_TTL_MS);

const getCacheIdentity = () => {
  try {
    const token = localStorage.getItem("token");
    const serializedUser = localStorage.getItem("user");
    if (!token || !serializedUser) return null;

    const user = JSON.parse(serializedUser);
    const userId = user?._id || user?.id;
    return userId ? `${userId}:${token}` : null;
  } catch {
    return null;
  }
};

export const clearDashboardDataCache = (userId) => {
  if (userId) dashboardCache.clearUser(userId);
  else dashboardCache.clear();
};

export const fetchDashboardData = async ({ force = false } = {}) => {
  const identity = getCacheIdentity();

  if (!force && identity) {
    const cached = dashboardCache.get(identity);
    if (cached) return cached;
  }

  if (!force && identity) {
    const existingRequest = dashboardCache.getRequest(identity);
    if (existingRequest) return existingRequest;
  }

  const requestGeneration = identity ? dashboardCache.generation(identity) : null;
  const request = (async () => {
    const [todoRes, expenseRes, salaryRes] = await Promise.allSettled([
      axios.get(`${API_BASE}/todos`),
      axios.get(`${API_BASE}/expenses`),
      axios.get(`${API_BASE}/salary`),
    ]);

    const fetchedAt = Date.now();
    const endpointStatus = {
      todos: todoRes.status === "fulfilled",
      expenses: expenseRes.status === "fulfilled",
      salary: salaryRes.status === "fulfilled",
    };
    const failedEndpoints = Object.entries(endpointStatus)
      .filter(([, ok]) => !ok)
      .map(([name]) => name);

    const payload = {
      todos:
        todoRes.status === "fulfilled" && Array.isArray(todoRes.value.data)
          ? todoRes.value.data
          : [],
      expenses:
        expenseRes.status === "fulfilled" && Array.isArray(expenseRes.value.data)
          ? expenseRes.value.data
          : [],
      salaryData:
        salaryRes.status === "fulfilled" ? salaryRes.value.data || null : null,
      fetchedAt,
      endpointStatus,
      isApiReachable: failedEndpoints.length < 3,
      failedEndpoints,
    };

    if (identity) {
      dashboardCache.setIfCurrentGeneration(
        identity,
        requestGeneration,
        payload,
        fetchedAt
      );
    }

    return payload;
  })();

  if (identity) dashboardCache.setRequest(identity, request);

  try {
    return await request;
  } finally {
    if (identity) dashboardCache.deleteRequest(identity, request);
  }
};

if (typeof window !== "undefined") {
  window.addEventListener("trackit:auth-cleared", () => {
    clearDashboardDataCache();
  });
}
