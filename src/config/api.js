import axios from "axios";

const DEV_API_BASE = "http://127.0.0.1:5000/api";

export const API_BASE = import.meta.env.VITE_API_BASE || DEV_API_BASE;

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