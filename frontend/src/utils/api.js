// api.js
// Central API client used by the entire frontend.
//
// Handles:
// - Local development API
// - Azure production API
// - Environment overrides
// - Axios configuration
// - API helpers for providers, services, locations, etc.

import axios from "axios";

/**
 * Remove trailing slashes from URLs
 */
function stripTrailingSlash(url) {
  return String(url || "").replace(/\/+$/, "");
}

/**
 * Ensure base URL ends with /api
 */
function ensureApiSuffix(url) {
  const base = stripTrailingSlash(url);
  return /\/api$/i.test(base) ? base : `${base}/api`;
}

/**
 * Detect localhost
 */
function isLocalHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

/**
 * Resolve API base URL safely
 *
 * Priority order:
 * 1️⃣ Environment override
 * 2️⃣ Local dev fallback
 * 3️⃣ Production default
 */
function resolveApiBaseUrl() {
  const hostname = window?.location?.hostname || "";

  // Safely check Vite env
  const viteEnv =
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL;

  // Safely check CRA env
  const craEnv =
    typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_API_BASE_URL;

  const override = viteEnv || craEnv;

  if (override && override.trim()) {
    return ensureApiSuffix(override.trim());
  }

  // Local development
  if (isLocalHost(hostname)) {
    return "http://127.0.0.1:8000/api";
  }

  // Production fallback
  return "https://api.my-primarycare.com/api";
}

/**
 * Final API base URL
 */
const API_BASE = resolveApiBaseUrl();

/**
 * Axios instance
 */
export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  withCredentials: false,
});

/**
 * Log API base during development
 */
if (typeof console !== "undefined") {
  console.log("[api] baseURL =", API_BASE);
}

/**
 * Axios request interceptor
 */
api.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  config.headers["X-Requested-With"] = "XMLHttpRequest";
  return config;
});

/**
 * Axios response interceptor
 */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("[api] error", {
      baseURL: err?.config?.baseURL,
      url: err?.config?.url,
      status: err?.response?.status,
      data: err?.response?.data,
      message: err?.message,
    });

    return Promise.reject(err);
  }
);

/**
 * ------------------------------------------------
 * PROVIDERS API
 * ------------------------------------------------
 */

export const providersApi = {
  getAll: () => api.get("/providers"),
  getById: (id) => api.get(`/providers/${encodeURIComponent(id)}`),
};

/**
 * ------------------------------------------------
 * SERVICES API
 * ------------------------------------------------
 */

export const servicesApi = {
  getAll: () => api.get("/services"),
  getById: (id) => api.get(`/services/${encodeURIComponent(id)}`),
};

/**
 * ------------------------------------------------
 * LOCATIONS API
 * ------------------------------------------------
 */

export const locationsApi = {
  getAll: () => api.get("/locations"),
  getById: (id) => api.get(`/locations/${encodeURIComponent(id)}`),
};

/**
 * ------------------------------------------------
 * CONTACT API
 * ------------------------------------------------
 */

export const contactApi = {
  submit: (data) =>
    api.post("/contact", data, {
      headers: {
        "Content-Type": "application/json",
      },
    }),
};

/**
 * ------------------------------------------------
 * RESOURCES API
 * ------------------------------------------------
 */

export const resourcesApi = {
  getAll: () => api.get("/resources"),
};




