import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { createApiClient } from "../api/client";

const AuthContext = createContext(null);

const TOKEN_STORAGE_KEY = "gourmet_token";

/**
 * Decode JWT payload (non-verified) for convenience only.
 */
function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

/**
 * Best-effort derive role from JWT payload.
 * Backend token payload shape can vary; we support common fields.
 */
function deriveRoleFromToken(token) {
  const payload = decodeJwt(token);
  return payload?.role || payload?.user_role || payload?.user?.role || null;
}

/**
 * PUBLIC_INTERFACE
 */
export function AuthProvider({ children, onAuthError }) {
  /** This is a public function. */
  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || "");
  const [role, setRole] = useState(() => (token ? deriveRoleFromToken(token) : null));

  const setToken = useCallback((newToken) => {
    setTokenState(newToken || "");
    if (newToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
      setRole(deriveRoleFromToken(newToken));
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setRole(null);
    }
  }, []);

  const logout = useCallback(() => setToken(""), [setToken]);

  const api = useMemo(() => {
    return createApiClient({
      getToken: () => token,
      onAuthError: (status) => {
        // If token expired/invalid, clear it and allow router to redirect.
        setToken("");
        if (onAuthError) onAuthError(status);
      }
    });
  }, [token, setToken, onAuthError]);

  const login = useCallback(
    async ({ email, password }) => {
      const data = await api.login({ email, password });
      setToken(data.access_token);
      return data;
    },
    [api, setToken]
  );

  const register = useCallback(
    async ({ email, full_name, password, role: userRole }) => {
      // Backend expects: email, full_name, password, role
      return api.register({ email, full_name, password, role: userRole });
    },
    [api]
  );

  const value = useMemo(
    () => ({
      token,
      role,
      isAuthenticated: Boolean(token),
      api,
      login,
      register,
      logout
    }),
    [token, role, api, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 */
export function useAuth() {
  /** This is a public function. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
