import { NextRequest } from "next/server";
import { proxyEventMediaReorder } from "@/lib/media/media-route";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyEventMediaReorder(
    request,
    `/api/admin/events/${encodeURIComponent(id)}/media/reorder`,
  );
}
