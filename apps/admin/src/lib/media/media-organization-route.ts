import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { fetchAuthorizedBackend } from "@/lib/auth/authorized-backend";
import { isSameOriginRequest } from "@/lib/auth/route-security";

export async function proxyMediaOrganization(request: NextRequest, backendPath: `/${string}`) {
  if (request.method !== "GET" && !isSameOriginRequest(request))
    return error("Request origin is not allowed.", 403);
  const body =
    request.method === "GET" ||
    (request.method === "POST" &&
      !request.headers.get("content-type")?.includes("application/json"))
      ? undefined
      : await request.text();
  const response = await fetchAuthorizedBackend(backendPath, {
    method: request.method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body,
  });
  const text = await response.text();
  if (!response.ok) {
    let detail = "Unable to complete the media organization request.";
    try {
      const parsed = JSON.parse(text) as { detail?: unknown };
      if (typeof parsed.detail === "string" && parsed.detail.length <= 500) detail = parsed.detail;
    } catch {}
    return error(detail, response.status);
  }
  return text
    ? new NextResponse(text, {
        status: response.status,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      })
    : new NextResponse(null, { status: response.status });
}
function error(message: string, status: number) {
  return NextResponse.json({ message }, { status, headers: { "Cache-Control": "no-store" } });
}
