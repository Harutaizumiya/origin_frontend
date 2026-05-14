import { requestJson } from "./client";

export interface AuthenticatedUser {
  id: number;
  username: string;
  displayName: string;
  role: string;
  avatarUrl: string | null;
}

interface AuthenticatedUserDto {
  id: number;
  username: string;
  displayName?: string;
  display_name?: string;
  role?: string;
  avatarUrl?: string | null;
  avatar_url?: string | null;
}

interface LoginResponseDto {
  token: string;
  user: AuthenticatedUserDto;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: AuthenticatedUser;
}

function toAuthenticatedUser(dto: AuthenticatedUserDto): AuthenticatedUser {
  return {
    id: dto.id,
    username: dto.username,
    displayName: dto.displayName ?? dto.display_name ?? dto.username,
    role: dto.role ?? "user",
    avatarUrl: dto.avatarUrl ?? dto.avatar_url ?? null,
  };
}

export async function login(credentials: LoginCredentials): Promise<LoginResult> {
  const data = await requestJson<LoginResponseDto>("/auth/login", {
    auth: false,
    method: "POST",
    body: {
      username: credentials.username.trim(),
      password: credentials.password,
    },
  });

  return {
    token: data.token,
    user: toAuthenticatedUser(data.user),
  };
}

export async function logout(token?: string | null) {
  return requestJson<null>("/auth/logout", {
    auth: false,
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export async function getCurrentUser() {
  const data = await requestJson<AuthenticatedUserDto>("/auth/me");
  return toAuthenticatedUser(data);
}
