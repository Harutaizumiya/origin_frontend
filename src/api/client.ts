import { ApiClientError } from "./types";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000/api";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function buildUrl(path: string) {
  const baseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const token = import.meta.env.VITE_API_TOKEN?.trim();
  const response = await fetch(buildUrl(path), {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
        ? payload.message
        : "request_failed";
    const code =
      payload && typeof payload === "object" && "code" in payload && typeof payload.code === "number"
        ? payload.code
        : null;
    throw new ApiClientError(message, response.status, code);
  }

  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    throw new ApiClientError("invalid_response", response.status);
  }

  return payload.data as T;
}
