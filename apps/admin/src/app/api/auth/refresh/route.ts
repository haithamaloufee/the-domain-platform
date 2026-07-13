import type { AuthErrorResponse, AuthSessionResponse } from "@the-domain/types";
import { NextRequest, NextResponse } from "next/server";
import { readTokens, refreshWithBackend } from "@/lib/auth/backend-auth";
import { clearAuthCookies, readAuthTokens, setAuthCookies } from "@/lib/auth/auth-cookies";
import { isSameOriginRequest } from "@/lib/auth/route-security";

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json<AuthErrorResponse>(
      { message: "Request origin is not allowed." },
      { status: 403 },
    );
  }

  const { refreshToken } = await readAuthTokens();
  if (!refreshToken) return expiredResponse();

  try {
    const response = await refreshWithBackend(refreshToken);
    if (!response.ok) {
      await clearAuthCookies();
      return expiredResponse();
    }

    const tokens = await readTokens(response);
    await setAuthCookies(tokens);
    return NextResponse.json<AuthSessionResponse>({
      user: tokens.user,
      expiresAtUtc: tokens.expiresAtUtc,
    });
  } catch {
    return NextResponse.json<AuthErrorResponse>(
      { message: "Unable to connect to the server. Please try again." },
      { status: 503 },
    );
  }
}

function expiredResponse() {
  return NextResponse.json<AuthErrorResponse>(
    { message: "Your session expired. Please sign in again." },
    { status: 401 },
  );
}
