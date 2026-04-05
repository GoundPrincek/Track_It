import axios from "axios";

// Fully softcoded: read from environment, fallback to relative path for production/same-origin proxies
export const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export const clearStoredAuth = () => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch (err) {
    console.log("Failed to clear stored auth:", err);
  }
};

const getStoredToken = () => {
  try {
    return localStorage.getItem("token") || "";
  } catch (err) {
    console.log("Failed to read stored token:", err);
    return "";
  }
};

axios.interceptors.request.use(
  (config) => {
    const token = getStoredToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = String(error?.config?.url || "");
    const isAuthRequest = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");

    if (status === 401 && !isAuthRequest) {
      clearStoredAuth();

      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);