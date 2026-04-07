import axios from "axios";
import { API_BASE } from "../config/api";

const DASHBOARD_CACHE_TTL_MS = 15000;
let inflightRequest = null;

let dashboardCache = {
  value: null,
  fetchedAt: 0,
};

const isFresh = () => {
  if (!dashboardCache.value) return false;
  return Date.now() - dashboardCache.fetchedAt < DASHBOARD_CACHE_TTL_MS;
};

export const clearDashboardDataCache = () => {
  dashboardCache = {
    value: null,
    fetchedAt: 0,
  };
  inflightRequest = null;
};

export const fetchDashboardData = async ({ force = false } = {}) => {
  if (!force && isFresh()) {
    return dashboardCache.value;
  }

  if (!force && inflightRequest) {
    return inflightRequest;
  }

  inflightRequest = (async () => {
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

    dashboardCache = {
      value: payload,
      fetchedAt,
    };

    return payload;
  })();

  try {
    return await inflightRequest;
  } finally {
    inflightRequest = null;
  }
};
