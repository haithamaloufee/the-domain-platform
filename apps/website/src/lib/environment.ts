import "server-only";

export function getPublicApiBaseUrl(): string {
  const apiBaseUrl = process.env.THE_DOMAIN_API_BASE_URL;
  if (!apiBaseUrl) throw new Error("THE_DOMAIN_API_BASE_URL is required.");
  return apiBaseUrl;
}
