import type { LogoutResponse } from "@the-domain/types";
import { NextRequest, NextResponse } from "next/server";
import { logoutWithBackend } from "@/lib/auth/backend-auth";
import { clearAuthCookies, readAuthTokens } from "@/lib/auth/auth-cookies";
import { isSameOriginRequest } from "@/lib/auth/route-security";

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ message: "Request origin is not allowed." }, { status: 403 });
  }

  const { refreshToken } = await readAuthTokens();
  try {
    if (refreshToken) await logoutWithBackend(refreshToken);
  } catch {
    // Local cookies are still cleared when the backend is unavailable.
  } finally {
    await clearAuthCookies();
  }

  return NextResponse.json<LogoutResponse>({ success: true });
}
