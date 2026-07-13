import { NextRequest } from "next/server";
import { proxyEventMediaDelete, proxyEventMediaUpdate } from "@/lib/media/media-route";

interface RouteContext {
  params: Promise<{ id: string; eventMediaId: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id, eventMediaId } = await params;
  return proxyEventMediaUpdate(
    request,
    `/api/admin/events/${encodeURIComponent(id)}/media/${encodeURIComponent(eventMediaId)}`,
  );
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { id, eventMediaId } = await params;
  return proxyEventMediaDelete(
    request,
    `/api/admin/events/${encodeURIComponent(id)}/media/${encodeURIComponent(eventMediaId)}`,
  );
}
