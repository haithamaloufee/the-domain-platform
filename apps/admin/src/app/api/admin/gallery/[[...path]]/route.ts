import { NextRequest, NextResponse } from "next/server";
import { fetchAuthorizedBackend } from "@/lib/auth/authorized-backend";
import { isSameOriginRequest } from "@/lib/auth/route-security";
interface Context {
  params: Promise<{ path?: string[] }>;
}
async function handle(request: NextRequest, { params }: Context) {
  if (request.method !== "GET" && !isSameOriginRequest(request))
    return NextResponse.json({ message: "Request origin is not allowed." }, { status: 403 });
  const path = (await params).path?.map(encodeURIComponent).join("/") ?? "";
  const body =
    request.method === "GET" || !request.headers.get("content-type")?.includes("application/json")
      ? undefined
      : await request.text();
  const response = await fetchAuthorizedBackend(`/api/admin/gallery/${path}`, {
    method: request.method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body,
  });
  const text = await response.text();
  if (!response.ok) {
    let message = "Unable to update the Gallery.";
    try {
      const value = JSON.parse(text) as { detail?: unknown };
      if (typeof value.detail === "string" && value.detail.length <= 500) message = value.detail;
    } catch {}
    return NextResponse.json({ message }, { status: response.status });
  }
  return new NextResponse(text || null, {
    status: response.status,
    headers: text ? { "Content-Type": "application/json", "Cache-Control": "no-store" } : undefined,
  });
}
export const GET = handle;
export const POST = handle;
export const PUT = handle;
