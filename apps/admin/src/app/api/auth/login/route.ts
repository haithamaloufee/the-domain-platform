import type { AuthErrorResponse, AuthSessionResponse, LoginRequest } from "@the-domain/types";
import { NextRequest, NextResponse } from "next/server";
import { loginWithBackend, readTokens } from "@/lib/auth/backend-auth";
import { setAuthCookies } from "@/lib/auth/auth-cookies";
import { isSameOriginRequest } from "@/lib/auth/route-security";

const invalidCredentials = "Invalid email or password.";

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json<AuthErrorResponse>(
      { message: "Request origin is not allowed." },
      { status: 403 },
    );
  }

  const input = await readLoginRequest(request);
  if (!input) {
    return NextResponse.json<AuthErrorResponse>({ message: invalidCredentials }, { status: 400 });
  }

  try {
    const response = await loginWithBackend(input);
    if (!response.ok) {
      const status = response.status === 401 || response.status === 400 ? 401 : 503;
      const message =
        status === 401 ? invalidCredentials : "Unable to connect to the server. Please try again.";
      return NextResponse.json<AuthErrorResponse>({ message }, { status });
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
