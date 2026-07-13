import { NextRequest } from "next/server";
import { proxyEventRead, proxyEventWrite } from "@/lib/events/event-route";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyEventRead(`/api/admin/events/${encodeURIComponent(id)}`, "single");
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyEventWrite(request, `/api/admin/events/${encodeURIComponent(id)}`, "PUT", {
    body: true,
  });
}
