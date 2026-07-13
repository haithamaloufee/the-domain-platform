import type { AuthErrorResponse, AuthSessionResponse } from "@the-domain/types";
import { NextResponse } from "next/server";
import {
  getCurrentUserFromBackend,
  readTokens,
  readUser,
  refreshWithBackend,
} from "@/lib/auth/backend-auth";
import { clearAuthCookies, readAuthTokens, setAuthCookies } from "@/lib/auth/auth-cookies";

export async function GET() {
  const { accessToken, refreshToken } = await readAuthTokens();

  try {
    if (accessToken) {
      const current = await getCurrentUserFromBackend(accessToken);
      if (current.ok) {
        return NextResponse.json<AuthSessionResponse>(
          { user: await readUser(current) },
          { headers: { "Cache-Control": "no-store" } },
        );
      }
      if (current.status !== 401) return unavailableResponse();
    }

    if (!refreshToken) return unauthorizedResponse();

    const refreshed = await refreshWithBackend(refreshToken);
    if (!refreshed.ok) {
      await clearAuthCookies();
      return unauthorizedResponse();
    }

    const tokens = await readTokens(refreshed);
    const retried = await getCurrentUserFromBackend(tokens.accessToken);
    if (!retried.ok) {
      await clearAuthCookies();
      return unauthorizedResponse();
    }

    await setAuthCookies(tokens);
    return NextResponse.json<AuthSessionResponse>(
      { user: await readUser(retried), expiresAtUtc: tokens.expiresAtUtc },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return unavailableResponse();
  }
}

function unauthorizedResponse() {
  return NextResponse.json<AuthErrorResponse>(
    { message: "Your session expired. Please sign in again." },
    { status: 401, headers: { "Cache-Control": "no-store" } },
  );
}

function unavailableResponse() {
  return NextResponse.json<AuthErrorResponse>(
    { message: "Unable to connect to the server. Please try again." },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
