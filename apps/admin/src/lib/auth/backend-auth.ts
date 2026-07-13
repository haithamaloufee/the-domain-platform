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
  const value = (await response.json()) as unknown;
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.accessToken) ||
    !isNonEmptyString(value.refreshToken)
  ) {
    throw new Error("The backend returned an invalid authentication response.");
  }

  const expiresAtUtc = isNonEmptyString(value.expiresAtUtc) ? value.expiresAtUtc : "";
  if (Number.isNaN(new Date(expiresAtUtc).getTime())) {
    throw new Error("The backend returned an invalid access-token expiration.");
  }

  return {
    accessToken: value.accessToken,
    refreshToken: value.refreshToken,
    expiresAtUtc,
    user: parseAdminUser(value.user),
  };
}

export async function readUser(response: Response): Promise<AdminUser> {
  return parseAdminUser((await response.json()) as unknown);
}

export function isAuthenticationFailure(response: Response): boolean {
  return response.status === 400 || response.status === 401;
}

export function parseAdminUser(value: unknown): AdminUser {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.fullName) ||
    !isNonEmptyString(value.email) ||
    !isUserRole(value.role)
  ) {
    throw new Error("The backend returned an invalid authenticated user.");
  }

  return {
    id: value.id,
    fullName: value.fullName,
    email: value.email,
    role: value.role,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isUserRole(value: unknown): value is AdminUser["role"] {
  return value === 1 || value === 2 || value === 3 || value === 4;
}
