import { NextRequest } from "next/server";
import { proxyEventMediaVideoPoster } from "@/lib/media/media-route";

interface RouteContext {
  params: Promise<{ id: string; eventMediaId: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id, eventMediaId } = await params;
  return proxyEventMediaVideoPoster(
    request,
    `/api/admin/events/${encodeURIComponent(id)}/media/${encodeURIComponent(eventMediaId)}/video-poster`,
  );
}
