import axios from "axios";

/**
 * Option A (recommended): SWA proxies `/api/*` to your backend.
 *
 * ✅ Local dev/laptop:
 *   - Frontend runs on localhost
 *   - Backend runs on http://127.0.0.1:8000
 *   - API base => http://127.0.0.1:8000/api
 *
 * ✅ Azure (Stage/Prod):
 *   - Frontend hosted on Azure Static Web Apps
 *   - SWA routes proxy `/api/*` to your backend (per staticwebapp.config.json)
 *   - API base => /api  (same-origin)
 *
 * NOTE: With SWA proxy, you do NOT need REACT_APP_API_URL_* in the frontend.
 *       Those env vars are only needed if you want to bypass proxy (Option B).
 */

function stripTrailingSlash(url) {
  return String(url || "").replace(/\/+$/, "");
}

function getHostname() {
  return (window?.location?.hostname || "").toLowerCase();
}

function isLocalHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0";
}

/**
 * Resolve API base URL for Option A:
 * - Local: direct to backend (127.0.0.1:8000/api)
 * - Azure: use same-origin /api (SWA proxy)
 */
function resolveApiBaseUrl() {
  const hostname = getHostname();

  // Local dev: call local backend directly
  if (isLocalHost(hostname)) {
    return "http://127.0.0.1:8000/api";
  }

  // Azure SWA: proxy /api/* using staticwebapp.config.json routes
  return `${stripTrailingSlash(window.location.origin)}/api`;
}

const API_BASE = resolveApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  withCredentials: false,
});

// Helpful log (no secrets)
if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line no-console
  console.log("[api] hostname =", getHostname());
  // eslint-disable-next-line no-console
  console.log("[api] baseURL  =", API_BASE);
  // eslint-disable-next-line no-console
  console.log("[api] mode     =", isLocalHost(getHostname()) ? "local-direct" : "swa-proxy");
}

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
 * (These become: /api/providers, /api/services, /api/locations, etc.)
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

export const contactApi = {
  submit: (data) =>
    api.post("/contact", data, {
      headers: { "Content-Type": "application/json" },
    }),
};

export const resourcesApi = {
  getAll: () => api.get("/resources"),
};





