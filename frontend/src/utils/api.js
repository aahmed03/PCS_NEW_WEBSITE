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
  if (!trimmed) return "";

  // already absolute
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  // host[:port][/path] without protocol
  if (/^[\w.-]+(:\d+)?(\/.*)?$/i.test(trimmed)) {
    // default to https for non-local hostnames, otherwise http
    const host = trimmed.split("/")[0];
    const isLocalHost =
      host.startsWith("localhost") ||
      host.startsWith("127.0.0.1") ||
      host.startsWith("0.0.0.0");
    return `${isLocalHost ? "http" : "https"}://${trimmed}`;
  }

  return trimmed;
}

function stripTrailingSlash(url) {
  return String(url || "").replace(/\/+$/, "");
}

function stripTrailingApi(url) {
  const cleaned = stripTrailingSlash(url);
  return cleaned.replace(/\/api$/i, "");
}

function ensureApiSuffix(url) {
  const base = stripTrailingSlash(url);
  return /\/api$/i.test(base) ? base : `${base}/api`;
}

/**
 * Get deploy environment.
 * You requested:
 * - Local dev/laptop -> "dev"
 * - Azure dev       -> "stage"
 * - Azure prod      -> "production"
 *
 * Priority:
 * 1) runtime injection (optional): window.__ENV__.DEPLOY_ENV
 * 2) build-time: REACT_APP_DEPLOY_ENV
 * 3) heuristic: localhost -> dev
 * 4) default -> production
 */
function getDeployEnv() {
  // Optional runtime injection support (future-proof)
  const runtimeEnv = window?.__ENV__?.DEPLOY_ENV;
  if (runtimeEnv) return String(runtimeEnv).trim().toLowerCase();

  const buildEnv = process.env.REACT_APP_DEPLOY_ENV;
  if (buildEnv) return String(buildEnv).trim().toLowerCase();

  const hostname = window?.location?.hostname || "";
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  if (isLocal) return "dev";

  return "production";
}

/**
 * Resolve API base URL.
 *
 * Priority order:
 * 1) REACT_APP_API_BASE_URL -> explicit full base or backend base (we normalize + ensure /api)
 * 2) Environment-specific URL based on deploy env:
 *    - REACT_APP_API_URL_DEV
 *    - REACT_APP_API_URL_STAGE
 *    - REACT_APP_API_URL_PROD
 * 3) Dev fallback: http://127.0.0.1:8000/api
 * 4) Last resort: same-origin /api  (ONLY useful if you have SWA route proxy configured)
 */
function resolveApiBaseUrl() {
  // 1) explicit override (best practice)
  const apiBaseOverride = normalizeBaseUrl(process.env.REACT_APP_API_BASE_URL);
  if (apiBaseOverride) {
    // If they gave ".../api" keep it, else add it.
    return ensureApiSuffix(apiBaseOverride);
  }

  const env = getDeployEnv();

  // 2) env-specific targets
  const devUrl = normalizeBaseUrl(process.env.REACT_APP_API_URL_DEV);
  const stageUrl = normalizeBaseUrl(process.env.REACT_APP_API_URL_STAGE);
  const prodUrl = normalizeBaseUrl(process.env.REACT_APP_API_URL_PROD);

  if (env === "dev" && devUrl) return ensureApiSuffix(stripTrailingApi(devUrl));
  if (env === "stage" && stageUrl) return ensureApiSuffix(stripTrailingApi(stageUrl));
  if (env === "production" && prodUrl) return ensureApiSuffix(stripTrailingApi(prodUrl));

  // 3) dev fallback
  if (env === "dev") {
    return "http://127.0.0.1:8000/api";
  }

  // 4) last resort: same-origin /api (requires SWA proxy/route to backend)
  return `${stripTrailingSlash(window.location.origin)}/api`;
}

const API_BASE = resolveApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  withCredentials: false,
});

// Log once to help confirm which env/url is being used
if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line no-console
  console.log("[api] deployEnv =", getDeployEnv(), "| baseURL =", API_BASE);
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



