// AuthContext.js
// ✅ FIXES APPLIED:
// 1) Removes reliance on REACT_APP_BACKEND_URL (was becoming "undefined" in prod builds)
// 2) Uses the same API base resolver as utils/api.js (single source of truth)
// 3) Supports local dev, staging, and production cleanly
// 4) Adds safer error handling + token bootstrap + loading state consistency

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";

/** ---------- URL helpers (same approach as utils/api.js) ---------- */
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
 * ✅ Single resolver for Auth API base.
 * Priority:
 *  1) REACT_APP_API_BASE_URL (optional override)
 *  2) Local dev => http://127.0.0.1:8000/api
 *  3) Prod API => https://api.my-primarycare.com/api (recommended)
 *  4) Fallback to your existing stage/dev API if needed
 */
function resolveAuthApiBaseUrl() {
  const hostname = window?.location?.hostname || "";

  // Optional override (if you *do* set this in build env later)
  const override = process.env.REACT_APP_API_BASE_URL;
  if (override && override.trim()) return ensureApiSuffix(override.trim());

  // Local dev
  if (isLocalHost(hostname)) return "http://127.0.0.1:8000/api";

  // ✅ Recommended production API domain
  const prodApi = "https://api.my-primarycare.com";

  // Fallback (only if prod domain not ready)
  const stageApi = "https://pcs-api-dev-fdacbseyd9audvfg.centralus-01.azurewebsites.net";

  // If you are on my-primarycare.com or www.my-primarycare.com => use prod API
  if (hostname.endsWith("my-primarycare.com")) return ensureApiSuffix(prodApi);

  // Otherwise use stage
  return ensureApiSuffix(stageApi);
}

/** ---------- Context ---------- */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const API_URL = useMemo(() => resolveAuthApiBaseUrl(), []);
  const tokenKey = "token";

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(tokenKey));
  const [loading, setLoading] = useState(true);

  // One axios instance for auth calls
  const authHttp = useMemo(() => {
    return axios.create({
      baseURL: API_URL,
      timeout: 30000,
      withCredentials: false,
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    });
  }, [API_URL]);

  const logout = useCallback(() => {
    localStorage.removeItem(tokenKey);
    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authHttp.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (error) {
      // Token invalid/expired -> force logout
      console.error("[auth] /auth/me failed:", error?.response?.status, error?.response?.data || error?.message);
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, authHttp, logout]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = useCallback(
    async (email, password) => {
      setLoading(true);
      try {
        const res = await authHttp.post("/auth/login", { email, password });
        const { access_token, user: userData } = res.data || {};

        if (!access_token) {
          throw new Error("Login response missing access_token");
        }

        localStorage.setItem(tokenKey, access_token);
        setToken(access_token);
        setUser(userData || null);

        return userData || null;
      } catch (error) {
        console.error("[auth] login failed:", error?.response?.status, error?.response?.data || error?.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [authHttp]
  );

  const register = useCallback(
    async (email, password, full_name) => {
      setLoading(true);
      try {
        const res = await authHttp.post("/auth/register", { email, password, full_name });
        const { access_token, user: userData } = res.data || {};

        if (!access_token) {
          throw new Error("Register response missing access_token");
        }

        localStorage.setItem(tokenKey, access_token);
        setToken(access_token);
        setUser(userData || null);

        return userData || null;
      } catch (error) {
        console.error("[auth] register failed:", error?.response?.status, error?.response?.data || error?.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [authHttp]
  );

  // Optional: make it easy to inspect base URL in dev
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log("[auth] API baseURL =", API_URL);
    }
  }, [API_URL]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, apiBaseUrl: API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

