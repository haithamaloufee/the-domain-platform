import "server-only";

const defaultRefreshCookieMaxAgeSeconds = 60 * 60 * 24 * 14;

export function getAdminAuthConfig() {
  const value = process.env.THE_DOMAIN_API_BASE_URL?.trim();
  if (!value) {
    throw new Error("THE_DOMAIN_API_BASE_URL is required for admin authentication.");
  }

  let apiUrl: URL;
  try {
    apiUrl = new URL(value);
  } catch {
    throw new Error("THE_DOMAIN_API_BASE_URL must be an absolute URL.");
  }
  if (apiUrl.protocol !== "http:" && apiUrl.protocol !== "https:") {
    throw new Error("THE_DOMAIN_API_BASE_URL must use HTTP or HTTPS.");
  }

  const apiBaseUrl = apiUrl.toString().replace(/\/$/, "");

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
