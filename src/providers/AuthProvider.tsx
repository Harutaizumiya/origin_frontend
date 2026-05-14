import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ApiClientError,
  clearAuthToken,
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  setAuthToken,
  setUnauthorizedHandler,
  type AuthenticatedUser,
  type LoginCredentials,
} from "../api";

const TOKEN_STORAGE_KEY = "origin.auth.token";

interface AuthContextValue {
  initializationError: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthenticatedUser>;
  logout: () => Promise<void>;
  retryInitialize: () => Promise<void>;
  token: string | null;
  user: AuthenticatedUser | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

function writeStoredToken(token: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
}

function removeStoredToken() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

function getInitializationErrorMessage(error: unknown) {
  if (error instanceof ApiClientError && error.status === 401) {
    return null;
  }

  return "登录状态校验失败，请检查网络或稍后重试。";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  const clearLocalSession = useCallback(() => {
    removeStoredToken();
    clearAuthToken();
    setToken(null);
    setUser(null);
    setInitializationError(null);
    queryClient.clear();
  }, [queryClient]);

  const initialize = useCallback(async () => {
    const storedToken = readStoredToken();
    setLoading(true);
    setInitializationError(null);

    if (!storedToken) {
      clearAuthToken();
      setToken(null);
      setUser(null);
      setLoading(false);
      return;
    }

    setAuthToken(storedToken);
    setToken(storedToken);

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        clearLocalSession();
      } else {
        setInitializationError(getInitializationErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  }, [clearLocalSession]);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    return setUnauthorizedHandler(clearLocalSession);
  }, [clearLocalSession]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const result = await loginRequest(credentials);
      writeStoredToken(result.token);
      setAuthToken(result.token);
      setToken(result.token);
      setUser(result.user);
      setInitializationError(null);
      queryClient.clear();
      return result.user;
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    const activeToken = token;
    clearLocalSession();

    if (activeToken) {
      await logoutRequest(activeToken).catch(() => undefined);
    }
  }, [clearLocalSession, token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      initializationError,
      isAuthenticated: Boolean(user && token),
      loading,
      login,
      logout,
      retryInitialize: initialize,
      token,
      user,
    }),
    [initializationError, initialize, loading, login, logout, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
