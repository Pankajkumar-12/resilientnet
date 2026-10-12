import axios from "axios";

const getApiBaseUrl = () => {
    if (typeof window !== "undefined") {
        const host = window.location.hostname;
        if (host && host !== "localhost" && host !== "127.0.0.1") {
            return `${window.location.protocol}//${host}:5000/api`;
        }
    }
    return import.meta.env.VITE_API_URL || "http://localhost:5000/api";
};

const api = axios.create({
    baseURL: getApiBaseUrl(),
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // If unauthorized on admin page, redirect to login
      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;