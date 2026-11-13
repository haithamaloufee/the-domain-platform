import type { NextRequest } from "next/server";

export function isSameOriginRequest(request: NextRequest): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site" || fetchSite === "same-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return fetchSite === "same-origin";
  try {
    const source = new URL(origin);
    const host = request.headers.get("host");
    return (
      source.origin === request.nextUrl.origin ||
      (source.host === host &&
        (fetchSite === "same-origin" || source.protocol === request.nextUrl.protocol))
    );
  } catch {
    return false;
  }
}
