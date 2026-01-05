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

function hostEndsWith(hostname, suffix) {
  return String(hostname || "").toLowerCase().endsWith(String(suffix || "").toLowerCase());
}

function hostEquals(hostname, exact) {
  return String(hostname || "").toLowerCase() === String(exact || "").toLowerCase();
}

/**
 * Resolve API base URL.
 *
 * Priority:
 * 1) REACT_APP_API_BASE_URL override (explicit)
 * 2) Localhost -> http://127.0.0.1:8000/api
 * 3) If running on PROD Static Web App host -> PROD API
 * 4) Otherwise (SWA staging/preview) -> DEV API
 *
 * Optional:
 * - REACT_APP_API_URL_PROD can override the PROD API host in CI/build
 */
function resolveApiBaseUrl() {
  const hostname = window?.location?.hostname || "";

  // 1) Explicit override (useful for local builds or controlled CI)
  const override = process.env.REACT_APP_API_BASE_URL;
  if (override && override.trim()) {
    return ensureApiSuffix(override.trim());
  }

  // 2) Local dev
  if (isLocalHost(hostname)) {
    return "http://127.0.0.1:8000/api";
  }

  // Known API endpoints
  const devApiHost = "https://pcs-api-dev-fdacbseyd9audvfg.centralus-01.azurewebsites.net";
  const prodApiHostDefault =
    "https://pcs-api-prod-d7bdb9bfbta5d5b2.centralus-01.azurewebsites.net";

  // Optional: allow CI/build to supply a different prod API host
  const prodApiFromEnv = process.env.REACT_APP_API_URL_PROD;
  const prodApiHost = (prodApiFromEnv && prodApiFromEnv.trim())
    ? prodApiFromEnv.trim()
    : prodApiHostDefault;

  // 3) Detect PROD Static Web App host and route to PROD API
  // Your current prod SWA URL:
  const prodSwaHostExact = "ashy-smoke-0f1273010.2.azurestaticapps.net";

  // Also treat any custom domain you later add as PROD by suffix match (optional)
  // Example: if you later use www.my-primarycare.com or my-primarycare.com
  // add those here if needed.
  const isProdFrontend =
    hostEquals(hostname, prodSwaHostExact);

  if (isProdFrontend) {
    return ensureApiSuffix(prodApiHost);
  }

  // 4) For all other non-local hosts (SWA preview/stage), default to DEV API
  return ensureApiSuffix(devApiHost);
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






