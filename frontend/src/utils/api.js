import axios from "axios";

function stripTrailingSlash(url) {
  return String(url || "").replace(/\/+$/, "");
}

function ensureApiSuffix(url) {
  const base = stripTrailingSlash(url);
  return /\/api$/i.test(base) ? base : `${base}/api`;
}

function isLocalHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

/**
 * Production: https://api.my-primarycare.com/api
 * Local dev: http://127.0.0.1:8000/api
 *
 * Optional override:
 * - VITE_API_BASE_URL or REACT_APP_API_BASE_URL (depending on your build tool)
 */
function resolveApiBaseUrl() {
  const hostname = window?.location?.hostname || "";

  // Support both common env styles
  const override =
    process.env.REACT_APP_API_BASE_URL ||
    process.env.VITE_API_BASE_URL;

  if (override && override.trim()) {
    return ensureApiSuffix(override.trim());
  }

  // Local dev
  if (isLocalHost(hostname)) {
    return "http://127.0.0.1:8000/api";
  }

  // Default production API domain
  return "https://api.my-primarycare.com/api";
}

const API_BASE = resolveApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  withCredentials: false,
});

if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line no-console
  console.log("[api] baseURL =", API_BASE);
}

api.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  config.headers["X-Requested-With"] = "XMLHttpRequest";
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // eslint-disable-next-line no-console
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






