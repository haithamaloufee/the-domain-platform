import { NextRequest } from "next/server";
import { proxyEventMediaCover } from "@/lib/media/media-route";

interface RouteContext {
  params: Promise<{ id: string; eventMediaId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { id, eventMediaId } = await params;
  return proxyEventMediaCover(
    request,
    `/api/admin/events/${encodeURIComponent(id)}/media/${encodeURIComponent(eventMediaId)}/cover`,
  );
}
