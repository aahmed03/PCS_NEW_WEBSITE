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
 * Resolve API base URL WITHOUT relying on GitHub Action env vars.
 *
 * Rules:
 * - Local dev/laptop => http://127.0.0.1:8000/api
 * - Azure SWA (stage) => pcs-api-dev.../api   (your current dev API)
 * - Azure prod => use REACT_APP_API_URL_PROD if provided, else fall back to stage URL
 *
 * Optional override:
 * - REACT_APP_API_BASE_URL can still override everything if present (local builds)
 */
function resolveApiBaseUrl() {
  const hostname = window?.location?.hostname || "";

  // Optional build-time override (local builds / future)
  const override = process.env.REACT_APP_API_BASE_URL;
  if (override && override.trim()) {
    return ensureApiSuffix(override.trim());
  }

  // Local dev
  if (isLocalHost(hostname)) {
    return "http://127.0.0.1:8000/api";
  }

  // If running on Azure Static Web Apps (stage/dev), call the API directly
  // (THIS is your current setup)
  const stageApi = "https://pcs-api-dev-fdacbseyd9audvfg.centralus-01.azurewebsites.net";
  const prodApi = process.env.REACT_APP_API_URL_PROD; // optional for later

  // If you later deploy a prod API, set REACT_APP_API_URL_PROD in the build pipeline.
  if (prodApi && prodApi.trim()) {
    return ensureApiSuffix(prodApi.trim());
  }

  return ensureApiSuffix(stageApi);
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





