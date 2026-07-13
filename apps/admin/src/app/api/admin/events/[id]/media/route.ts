import { NextRequest } from "next/server";
import { proxyEventMediaCreate } from "@/lib/media/media-route";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyEventMediaCreate(request, `/api/admin/events/${encodeURIComponent(id)}/media`);
}
