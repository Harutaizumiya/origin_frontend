import { afterEach, describe, expect, it, vi } from "vitest";
import { clearAuthToken, setAuthToken } from "./client";
import { getCurrentUser, login, logout } from "./auth";

describe("auth api", () => {
  afterEach(() => {
    clearAuthToken();
    vi.unstubAllGlobals();
  });

  it("logs in with username and password without sending a stale token", async () => {
    setAuthToken("stale-token");
    const response = {
      token: "fresh-token",
      user: {
        id: 7,
        username: "manager",
        display_name: "Manager",
        role: "admin",
        avatar_url: null,
      },
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: response }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(login({ username: " manager ", password: "secret" })).resolves.toEqual({
      token: "fresh-token",
      user: {
        id: 7,
        username: "manager",
        displayName: "Manager",
        role: "admin",
        avatarUrl: null,
      },
    });

    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/auth/login");
    expect(options.headers.Authorization).toBeUndefined();
    expect(JSON.parse(options.body)).toEqual({ username: "manager", password: "secret" });
  });

  it("loads the current user with the active token", async () => {
    setAuthToken("fresh-token");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          id: 8,
          username: "operator",
          displayName: "Operator",
          role: "operator",
          avatarUrl: "https://example.test/avatar.png",
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getCurrentUser()).resolves.toEqual({
      id: 8,
      username: "operator",
      displayName: "Operator",
      role: "operator",
      avatarUrl: "https://example.test/avatar.png",
    });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.Authorization).toBe("Bearer fresh-token");
  });

  it("logs out with the captured token override", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: null }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(logout("captured-token")).resolves.toBeNull();

    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/auth/logout");
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe("Bearer captured-token");
  });
});
