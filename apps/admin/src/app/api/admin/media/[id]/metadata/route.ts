import { NextRequest } from "next/server";
import { proxyMediaMetadata } from "@/lib/media/media-route";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyMediaMetadata(request, `/api/admin/media/${encodeURIComponent(id)}/metadata`);
}
