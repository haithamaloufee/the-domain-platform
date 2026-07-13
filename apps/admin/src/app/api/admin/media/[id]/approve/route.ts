import { NextRequest } from "next/server";
import { proxyMediaAction } from "@/lib/media/media-route";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyMediaAction(request, `/api/admin/media/${encodeURIComponent(id)}/approve`);
}
