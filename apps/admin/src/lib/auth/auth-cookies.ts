import "server-only";

import type { AuthTokensResponse } from "@the-domain/types";
import { cookies } from "next/headers";
import { getAdminAuthConfig } from "./auth-config";

export const accessTokenCookieName = "td_access_token";
export const refreshTokenCookieName = "td_refresh_token";

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
};

export async function readAuthTokens() {
  const store = await cookies();
  return {
    accessToken: store.get(accessTokenCookieName)?.value,
    refreshToken: store.get(refreshTokenCookieName)?.value,
  } as const;
}

export async function setAuthCookies(tokens: AuthTokensResponse): Promise<void> {
  const store = await cookies();
  const config = getAdminAuthConfig();
  const accessExpiry = new Date(tokens.expiresAtUtc);

  if (Number.isNaN(accessExpiry.getTime())) {
    throw new Error("The backend returned an invalid access-token expiration.");
  }

  store.set(accessTokenCookieName, tokens.accessToken, {
    ...cookieBase,
    secure: config.secureCookies,
    expires: accessExpiry,
  });
  store.set(refreshTokenCookieName, tokens.refreshToken, {
    ...cookieBase,
    secure: config.secureCookies,
    maxAge: config.refreshCookieMaxAgeSeconds,
  });
}

export async function clearAuthCookies(): Promise<void> {
  const store = await cookies();
  const { secureCookies } = getAdminAuthConfig();
  store.set(accessTokenCookieName, "", { ...cookieBase, secure: secureCookies, maxAge: 0 });
  store.set(refreshTokenCookieName, "", { ...cookieBase, secure: secureCookies, maxAge: 0 });
}
