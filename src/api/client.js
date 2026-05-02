import axios from "axios";

const DEFAULT_REMOTE_API_BASE_URL = "https://muhura-backend-web.onrender.com";
const LOCAL_API_BASE_URL = "http://localhost:5000";
const LOCAL_API_ORIGINS = new Set(["http://localhost:5000", "http://127.0.0.1:5000"]);

const trimTrailingSlash = (value = "") => String(value).replace(/\/+$/, "");
const isLocalValue = (value = "") => LOCAL_API_ORIGINS.has(trimTrailingSlash(value));
const isLocalFrontend = () => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(window.location.origin);

const resolveApiBaseUrl = () => {
  const configured = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || "");
  if (configured && (!isLocalValue(configured) || isLocalFrontend())) return configured;
  return isLocalFrontend() ? LOCAL_API_BASE_URL : DEFAULT_REMOTE_API_BASE_URL;
};

const resolveAssetsBaseUrl = (apiBaseUrl) => {
  const configured = trimTrailingSlash(import.meta.env.VITE_ASSETS_BASE_URL || "");
  if (configured && (!isLocalValue(configured) || isLocalFrontend())) return configured;
  return isLocalFrontend() ? "" : apiBaseUrl;
};

export const API_BASE_URL = resolveApiBaseUrl();
export const ASSETS_BASE_URL = resolveAssetsBaseUrl(API_BASE_URL);

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
  if (/^https?:\/\//i.test(inputPath)) {
    if (!isLocalFrontend()) {
      return inputPath.replace(/^https?:\/\/(localhost|127\.0\.0\.1):5000/i, API_BASE_URL);
    }
    return inputPath;
  }
  if (inputPath.startsWith("/uploads")) return `${API_BASE_URL}${inputPath}`;
  if (inputPath.startsWith("/assets")) return `${ASSETS_BASE_URL}${inputPath}`;
  if (inputPath.startsWith("assets/")) return `${ASSETS_BASE_URL}/${inputPath}`;
  return inputPath;
};
