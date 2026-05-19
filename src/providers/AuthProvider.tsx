import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ApiClientError,
  clearAuthToken,
  getCurrentUser,
  getAuthToken,
  login as loginRequest,
  logout as logoutRequest,
  setAuthToken,
  setUnauthorizedHandler,
  type AuthenticatedUser,
  type LoginCredentials,
} from "../api";
import { logger } from "../lib/logger";

const TOKEN_STORAGE_KEY = "origin.auth.token";
const TOKEN_SESSION_KEY = "origin.auth.session-token";

interface AuthContextValue {
  hasAnyPermission: (codes: string[]) => boolean;
  hasPermission: (code: string) => boolean;
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

  return window.localStorage.getItem(TOKEN_STORAGE_KEY) || window.sessionStorage.getItem(TOKEN_SESSION_KEY);
}

function writeStoredToken(token: string, remember = true) {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.sessionStorage.removeItem(TOKEN_SESSION_KEY);

    if (remember) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      window.sessionStorage.setItem(TOKEN_SESSION_KEY, token);
    }
  }
}

function removeStoredToken() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.sessionStorage.removeItem(TOKEN_SESSION_KEY);
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
    logger.debug("auth", "Local session cleared", {
      event: "auth_session_cleared",
      hadToken: Boolean(getAuthToken()),
    });
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
        logger.warn("auth", "Stored session is unauthorized", {
          event: "auth_stored_session_unauthorized",
          status: error.status,
          code: error.code,
        });
        clearLocalSession();
      } else {
        logger.error("auth", "Failed to initialize authentication state", {
          event: "auth_initialization_failed",
          error,
        });
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
      try {
        const result = await loginRequest(credentials);
        writeStoredToken(result.token, credentials.remember !== false);
        setAuthToken(result.token);
        setToken(result.token);
        setUser(result.user);
        setInitializationError(null);
        queryClient.clear();
        logger.info("auth", "User logged in", {
          event: "auth_login_succeeded",
          userId: result.user.id,
          role: result.user.roleLabel,
        });
        return result.user;
      } catch (error) {
        logger.warn("auth", "User login failed", {
          event: "auth_login_failed",
          username: credentials.username,
          error,
        });
        throw error;
      }
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    const activeToken = token;
    clearLocalSession();
    logger.info("auth", "User logged out", {
      event: "auth_logout",
      hadToken: Boolean(activeToken),
      userId: user?.id ?? null,
    });

    if (activeToken) {
      await logoutRequest(activeToken).catch(() => undefined);
    }
  }, [clearLocalSession, token, user?.id]);

  const hasPermission = useCallback(
    (code: string) => {
      if (!user) {
        return false;
      }

      return user.isSuperuser || user.permissions.includes(code);
    },
    [user],
  );

  const hasAnyPermission = useCallback(
    (codes: string[]) => {
      if (codes.length === 0) {
        return true;
      }

      return codes.some(hasPermission);
    },
    [hasPermission],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      hasAnyPermission,
      hasPermission,
      initializationError,
      isAuthenticated: Boolean(user && token),
      loading,
      login,
      logout,
      retryInitialize: initialize,
      token,
      user,
    }),
    [hasAnyPermission, hasPermission, initializationError, initialize, loading, login, logout, token, user],
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
