import "server-only";

const defaultRefreshCookieMaxAgeSeconds = 60 * 60 * 24 * 14;

export function getAdminAuthConfig() {
  const apiBaseUrl = process.env.THE_DOMAIN_API_BASE_URL?.replace(/\/$/, "");
  if (!apiBaseUrl) {
    throw new Error("THE_DOMAIN_API_BASE_URL is required for admin authentication.");
  }

  const configuredMaxAge = Number(process.env.THE_DOMAIN_REFRESH_COOKIE_MAX_AGE_SECONDS);
  const refreshCookieMaxAgeSeconds =
    Number.isInteger(configuredMaxAge) && configuredMaxAge > 0
      ? configuredMaxAge
      : defaultRefreshCookieMaxAgeSeconds;

  return {
    apiBaseUrl,
    refreshCookieMaxAgeSeconds,
    secureCookies: process.env.NODE_ENV === "production",
  } as const;
}
