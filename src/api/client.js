import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
export const ASSETS_BASE_URL =
  import.meta.env.VITE_ASSETS_BASE_URL || "";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
});

const IDEMPOTENT_METHODS = new Set(["get", "head", "options"]);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config;
    const method = String(config?.method || "").toLowerCase();
    const status = error?.response?.status || 0;
    const isNetworkError = !error?.response;
    const shouldRetry = config && IDEMPOTENT_METHODS.has(method) && (isNetworkError || status >= 500);

    if (shouldRetry && !config.__retry) {
      config.__retry = true;
      return api(config);
    }

    return Promise.reject(error);
  }
);

export const getApiError = (error, fallback = "Request failed") =>
  error?.response?.data?.error || fallback;

export const mediaUrl = (inputPath) => {
  if (!inputPath) return "";
  if (/^https?:\/\//i.test(inputPath)) return inputPath;
  if (inputPath.startsWith("/uploads")) return `${API_BASE_URL}${inputPath}`;
  if (inputPath.startsWith("/assets")) return `${ASSETS_BASE_URL}${inputPath}`;
  if (inputPath.startsWith("assets/")) return `${ASSETS_BASE_URL}/${inputPath}`;
  return inputPath;
};
