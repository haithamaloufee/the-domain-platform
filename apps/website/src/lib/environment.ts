import "server-only";

export function getPublicApiBaseUrl(): string {
  const value = process.env.THE_DOMAIN_API_BASE_URL?.trim();
  if (!value) throw new Error("THE_DOMAIN_API_BASE_URL is required.");

  let apiBaseUrl: URL;
  try {
    apiBaseUrl = new URL(value);
  } catch {
    throw new Error("THE_DOMAIN_API_BASE_URL must be an absolute URL.");
  }

  if (apiBaseUrl.protocol !== "http:" && apiBaseUrl.protocol !== "https:") {
    throw new Error("THE_DOMAIN_API_BASE_URL must use HTTP or HTTPS.");
  }

  return apiBaseUrl.toString().replace(/\/$/, "");
}
