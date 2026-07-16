import { NextRequest, NextResponse } from "next/server";
import { fetchAuthorizedBackend } from "@/lib/auth/authorized-backend";
import { isSameOriginRequest } from "@/lib/auth/route-security";
export function GET() {
  return proxy("GET");
}
export async function PUT(request: NextRequest) {
  if (!isSameOriginRequest(request))
    return NextResponse.json({ detail: "Request origin is not allowed." }, { status: 403 });
  return proxy("PUT", await request.text());
}
async function proxy(method: string, body?: string) {
  const response = await fetchAuthorizedBackend("/api/admin/statistics/presentation", {
    method,
    body,
    headers: body ? { "Content-Type": "application/json" } : undefined,
  });
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
