import type { AuthErrorResponse, AuthSessionResponse, LoginRequest } from "@the-domain/types";
import { NextRequest, NextResponse } from "next/server";
import { loginWithBackend, readTokens } from "@/lib/auth/backend-auth";
import { setAuthCookies } from "@/lib/auth/auth-cookies";
import { getLoginErrorMessage } from "@/lib/auth/login-errors";
import { isSameOriginRequest } from "@/lib/auth/route-security";

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return errorResponse(403);
  }

  const input = await readLoginRequest(request);
  if (!input) {
    return errorResponse(400);
  }

  try {
    const response = await loginWithBackend(input);
    if (!response.ok) {
      return errorResponse(mapBackendStatus(response.status));
    }

    const tokens = await readTokens(response);
    await setAuthCookies(tokens);
    return NextResponse.json<AuthSessionResponse>(
      {
        user: tokens.user,
        expiresAtUtc: tokens.expiresAtUtc,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return errorResponse(503);
  }
}

function mapBackendStatus(status: number): number {
  if (status === 400 || status === 401) return 401;
  if (status === 429) return 429;
  if (status === 502 || status === 503 || status === 504) return 503;
  return 500;
}

function errorResponse(status: number) {
  return NextResponse.json<AuthErrorResponse>(
    { message: getLoginErrorMessage(status) },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

async function readLoginRequest(request: NextRequest): Promise<LoginRequest | null> {
  try {
    const input = (await request.json()) as Partial<LoginRequest>;
    const email = input.email?.trim();
    if (
      !email ||
      email.length > 320 ||
      !email.includes("@") ||
      !input.password ||
      input.password.length > 1024
    )
      return null;
    return { email, password: input.password };
  } catch {
    return null;
  }
}
