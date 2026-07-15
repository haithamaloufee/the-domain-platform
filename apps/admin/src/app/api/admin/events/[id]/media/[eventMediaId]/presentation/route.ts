import { NextRequest } from "next/server";
import { proxyEventMediaPresentation } from "@/lib/media/media-route";

interface RouteContext {
  params: Promise<{ id: string; eventMediaId: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id, eventMediaId } = await params;
  return proxyEventMediaPresentation(
    request,
    `/api/admin/events/${encodeURIComponent(id)}/media/${encodeURIComponent(eventMediaId)}/presentation`,
  );
}
