import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "./types";
import { clearAuthToken, requestJson, setAuthToken, setUnauthorizedHandler } from "./client";
import { clearLogEntries, getLogEntries } from "../lib/logger";

describe("requestJson auth handling", () => {
  afterEach(() => {
    clearAuthToken();
    clearLogEntries();
    setUnauthorizedHandler(null);
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("adds Authorization when a runtime token is set", async () => {
    setAuthToken("token-123");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: { ok: true } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(requestJson("/ping")).resolves.toEqual({ ok: true });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.Authorization).toBe("Bearer token-123");
  });

  it("omits Authorization when auth is disabled", async () => {
    setAuthToken("token-123");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: { ok: true } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await requestJson("/public", { auth: false });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.Authorization).toBeUndefined();
  });

  it("notifies the unauthorized handler for authenticated 401 responses", async () => {
    vi.stubEnv("VITE_LOG_ENABLED", "true");
    const unauthorizedHandler = vi.fn();
    setAuthToken("expired-token");
    setUnauthorizedHandler(unauthorizedHandler);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ code: 4011, message: "unauthorized", data: null }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(requestJson("/protected")).rejects.toBeInstanceOf(ApiClientError);
    expect(unauthorizedHandler).toHaveBeenCalledTimes(1);
    expect(getLogEntries()).toEqual([
      expect.objectContaining({
        level: "error",
        scope: "api.client",
        event: "api_request_failed",
        details: expect.objectContaining({
          path: "/protected",
          status: 401,
          code: 4011,
        }),
      }),
    ]);
  });

  it("does not notify the unauthorized handler for forbidden responses", async () => {
    const unauthorizedHandler = vi.fn();
    setAuthToken("valid-token");
    setUnauthorizedHandler(unauthorizedHandler);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ code: 4031, message: "forbidden", data: null }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(requestJson("/admin-only")).rejects.toMatchObject({
      status: 403,
      code: 4031,
      message: "forbidden",
    });
    expect(unauthorizedHandler).not.toHaveBeenCalled();
  });

  it("does not record API error logs for successful requests", async () => {
    vi.stubEnv("VITE_LOG_ENABLED", "true");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: { ok: true } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(requestJson("/ping")).resolves.toEqual({ ok: true });

    expect(getLogEntries()).toEqual([]);
  });
});
