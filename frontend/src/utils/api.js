import axios from "axios";

/**
 * Normalize a URL-like value into an absolute URL (http/https) where possible.
 * Examples:
 *  - "127.0.0.1:8000"        -> "http://127.0.0.1:8000"
 *  - "http://127.0.0.1:8000" -> unchanged
 *  - "https://api.site.com"  -> unchanged
 */
function normalizeBaseUrl(raw) {
  if (!raw) return "";

  const trimmed = String(raw).trim();

  // If already absolute (http/https), keep it
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  // If user provided host[:port][/path] without protocol, assume https in prod, http in local
  // BUT we don't know environment here reliably; default to http for simplicity.
  // If you want https by default, set REACT_APP_API_BASE_URL explicitly.
  if (/^[\w.-]+(:\d+)?(\/.*)?$/i.test(trimmed)) {
    return `http://${trimmed}`;
  }

  return trimmed;
}

/**
 * Remove trailing slash
 */
function stripTrailingSlash(url) {
  return String(url || "").replace(/\/+$/, "");
}

/**
 * Remove any trailing "/api" segment so we can add it once consistently.
 */
function stripTrailingApi(url) {
  const cleaned = stripTrailingSlash(url);
  return cleaned.replace(/\/api$/i, "");
}

/**
 * Resolve API base URL.
 *
 * Priority order:
 * 1) REACT_APP_API_BASE_URL   -> full API base (e.g. "http://127.0.0.1:8000/api" OR "https://site.com/api")
 * 2) REACT_APP_BACKEND_URL    -> backend base (e.g. "http://127.0.0.1:8000" OR "https://api.site.com")
 * 3) Local dev fallback       -> "http://127.0.0.1:8000/api"
 * 4) Production fallback      -> same-origin "/api" (reverse proxy / single-app deployment)
 */
function resolveApiBaseUrl() {
  // 1) If REACT_APP_API_BASE_URL is set, trust it exactly (after normalization)
  const apiBaseEnv = normalizeBaseUrl(process.env.REACT_APP_API_BASE_URL);
  if (apiBaseEnv) {
    // Ensure it ends with /api
    const base = stripTrailingSlash(apiBaseEnv);
    return /\/api$/i.test(base) ? base : `${base}/api`;
  }

  // 2) If REACT_APP_BACKEND_URL is set, append /api
  const backendEnv = normalizeBaseUrl(process.env.REACT_APP_BACKEND_URL);
  if (backendEnv) {
    const backendBase = stripTrailingApi(backendEnv);
    return `${backendBase}/api`;
  }

  // 3) If local, use 127.0.0.1:8000/api by default
  const hostname = window?.location?.hostname || "";
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  if (isLocal) {
    return "http://127.0.0.1:8000/api";
  }

  // 4) Production fallback: same origin + /api (works with reverse proxy)
  return `${stripTrailingSlash(window.location.origin)}/api`;
}

const API_BASE = resolveApiBaseUrl();

/**
 * Axios instance.
 * - withCredentials: helpful if later you use cookie-based auth.
 *   If you do not use cookies, it won't hurt, but can be removed.
 */
export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  withCredentials: false,
});

/**
 * Log base URL once in dev for debugging
 */
if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line no-console
  console.log("[api] baseURL =", API_BASE);
}

/**
 * Request interceptor:
 * - Adds Bearer token if present
 * - Adds a request id for easier backend log correlation
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers = config.headers || {};
  config.headers["X-Requested-With"] = "XMLHttpRequest";

  return config;
});

/**
 * Response interceptor: show helpful diagnostics without breaking callers.
 */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const method = err?.config?.method?.toUpperCase?.() || "";
    const url = err?.config?.url || "";
    const baseURL = err?.config?.baseURL || API_BASE;

    // eslint-disable-next-line no-console
    console.error("[api] error:", {
      status,
      method,
      url,
      baseURL,
      message: err?.message,
      data: err?.response?.data,
    });

    return Promise.reject(err);
  }
);

/**
 * API helpers
 */
export const providersApi = {
  getAll: () => api.get("/providers"),
  getById: (id) => api.get(`/providers/${encodeURIComponent(id)}`),
};

export const servicesApi = {
  getAll: () => api.get("/services"),
  getById: (id) => api.get(`/services/${encodeURIComponent(id)}`),
};

export const locationsApi = {
  getAll: () => api.get("/locations"),
  getById: (id) => api.get(`/locations/${encodeURIComponent(id)}`),
};

/**
 * Contact form submission:
 * Backend must implement POST /api/contact and actually send email.
 */
export const contactApi = {
  submit: (data) =>
    api.post("/contact", data, {
      headers: { "Content-Type": "application/json" },
    }),
};

export const resourcesApi = {
  getAll: () => api.get("/resources"),
};


