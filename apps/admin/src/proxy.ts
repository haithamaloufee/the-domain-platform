import type { AdminUser, AuthTokensResponse } from "@the-domain/types";
import { NextRequest, NextResponse } from "next/server";
import { getAdminAuthConfig } from "@/lib/auth/auth-config";
import { accessTokenCookieName, refreshTokenCookieName } from "@/lib/auth/auth-cookies";
import {
  getCurrentUserFromBackend,
  isAuthenticationFailure,
  readTokens,
  readUser,
  refreshWithBackend,
} from "@/lib/auth/backend-auth";
import { serializeValidatedAdminUser, validatedAdminUserHeader } from "@/lib/auth/validated-user";

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
};

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(accessTokenCookieName)?.value;
  const refreshToken = request.cookies.get(refreshTokenCookieName)?.value;
  if (!accessToken && !refreshToken) return loginRedirect(request, "expired", true);

  try {
    const session = await validateOrRefresh(accessToken, refreshToken);
    if (!session) return loginRedirect(request, "expired", true);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(validatedAdminUserHeader, serializeValidatedAdminUser(session.user));
    if (session.tokens) setRequestCookies(request, session.tokens);
    requestHeaders.set("cookie", request.cookies.toString());

    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("Cache-Control", "no-store");
    if (session.tokens) setResponseCookies(response, session.tokens);
    return response;
  } catch {
    return loginRedirect(request, "unavailable");
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

async function validateOrRefresh(
  accessToken: string | undefined,
  refreshToken: string | undefined,
): Promise<{ user: AdminUser; tokens?: AuthTokensResponse } | null> {
  if (accessToken) {
    const current = await getCurrentUserFromBackend(accessToken);
    if (current.ok) return { user: await readUser(current) };
    if (current.status !== 401) throw new Error("Unable to validate the admin session.");
  }

  if (!refreshToken) return null;
  const refreshed = await refreshWithBackend(refreshToken);
  if (!refreshed.ok) {
    if (isAuthenticationFailure(refreshed)) return null;
    throw new Error("Unable to refresh the admin session.");
  }

  const tokens = await readTokens(refreshed);
  const current = await getCurrentUserFromBackend(tokens.accessToken);
  if (!current.ok) {
    if (current.status === 401) return null;
    throw new Error("Unable to validate the refreshed admin session.");
  }

  return { user: await readUser(current), tokens };
}

function setRequestCookies(request: NextRequest, tokens: AuthTokensResponse): void {
  request.cookies.set(accessTokenCookieName, tokens.accessToken);
  request.cookies.set(refreshTokenCookieName, tokens.refreshToken);
}

function setResponseCookies(response: NextResponse, tokens: AuthTokensResponse): void {
  const config = getAdminAuthConfig();
  response.cookies.set(accessTokenCookieName, tokens.accessToken, {
    ...cookieBase,
    secure: config.secureCookies,
    expires: new Date(tokens.expiresAtUtc),
  });
  response.cookies.set(refreshTokenCookieName, tokens.refreshToken, {
    ...cookieBase,
    secure: config.secureCookies,
    maxAge: config.refreshCookieMaxAgeSeconds,
  });
}

function loginRedirect(request: NextRequest, reason: "expired" | "unavailable", clear = false) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("reason", reason);
  const response = NextResponse.redirect(loginUrl);
  if (clear) clearResponseCookies(response);
  return response;
}

function clearResponseCookies(response: NextResponse): void {
  const { secureCookies } = getAdminAuthConfig();
  response.cookies.set(accessTokenCookieName, "", {
    ...cookieBase,
    secure: secureCookies,
    maxAge: 0,
  });
  response.cookies.set(refreshTokenCookieName, "", {
    ...cookieBase,
    secure: secureCookies,
    maxAge: 0,
  });
}
