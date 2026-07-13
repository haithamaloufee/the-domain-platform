import "server-only";

import type { AdminUser, AuthTokensResponse, LoginRequest } from "@the-domain/types";
import { getAdminAuthConfig } from "./auth-config";

const requestTimeoutMilliseconds = 10_000;

async function backendFetch(path: `/${string}`, init: RequestInit): Promise<Response> {
  const { apiBaseUrl } = getAdminAuthConfig();
  return fetch(`${apiBaseUrl}${path}`, {
    ...init,
    cache: "no-store",
    headers: { Accept: "application/json", ...init.headers },
    signal: AbortSignal.timeout(requestTimeoutMilliseconds),
  });
}

export function loginWithBackend(request: LoginRequest): Promise<Response> {
  return backendFetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}

export function refreshWithBackend(refreshToken: string): Promise<Response> {
  return backendFetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
}

export function logoutWithBackend(refreshToken: string): Promise<Response> {
  return backendFetch("/api/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
}

export function getCurrentUserFromBackend(accessToken: string): Promise<Response> {
  return backendFetch("/api/auth/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function readTokens(response: Response): Promise<AuthTokensResponse> {
  return (await response.json()) as AuthTokensResponse;
}

export async function readUser(response: Response): Promise<AdminUser> {
  return (await response.json()) as AdminUser;
}
