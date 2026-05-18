import { ApiClientError } from "./types";
import { logger } from "../lib/logger";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000/api";
let authToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function buildUrl(path: string) {
  const baseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  auth?: boolean;
  body?: unknown;
}

export function setAuthToken(token: string | null) {
  authToken = token?.trim() || null;
}

export function getAuthToken() {
  return authToken;
}

export function clearAuthToken() {
  authToken = null;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;

  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = null;
    }
  };
}

export async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, body, headers, ...rest } = options;
  const token = auth ? authToken : null;
  const startedAt = typeof performance !== "undefined" ? performance.now() : Date.now();
  const method = rest.method ?? "GET";
  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    logger.error("api.client", "API request could not be sent", {
      event: "api_request_network_error",
      path,
      method,
      durationMs: Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - startedAt),
      error,
    });
    throw error;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && auth) {
      unauthorizedHandler?.();
    }

    const message =
      payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
        ? payload.message
        : "request_failed";
    const code =
      payload && typeof payload === "object" && "code" in payload && typeof payload.code === "number"
        ? payload.code
        : null;
    logger.error("api.client", "API request failed", {
      event: "api_request_failed",
      path,
      method,
      status: response.status,
      code,
      durationMs: Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - startedAt),
    });
    throw new ApiClientError(message, response.status, code);
  }

  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    logger.error("api.client", "API response shape is invalid", {
      event: "api_invalid_response",
      path,
      method,
      status: response.status,
      durationMs: Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - startedAt),
    });
    throw new ApiClientError("invalid_response", response.status);
  }

  return payload.data as T;
}
