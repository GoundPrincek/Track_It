import axios from "axios";

const DEV_API_BASE = "http://127.0.0.1:5000/api";

export const API_BASE = import.meta.env.VITE_API_BASE || DEV_API_BASE;

const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return null;

    const parsedUser = JSON.parse(rawUser);
    return parsedUser && typeof parsedUser === "object" ? parsedUser : null;
  } catch (err) {
    console.log("Failed to parse stored user:", err);
    return null;
  }
};

axios.interceptors.request.use(
  (config) => {
    const user = getStoredUser();

    if (user?._id) {
      config.headers = config.headers || {};
      config.headers["x-user-id"] = user._id;
    }

    return config;
  },
  (error) => Promise.reject(error)
);