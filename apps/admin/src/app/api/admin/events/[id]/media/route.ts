import { NextRequest } from "next/server";
import { proxyEventMediaCreate, proxyEventMediaList } from "@/lib/media/media-route";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyEventMediaList(`/api/admin/events/${encodeURIComponent(id)}/media`);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyEventMediaCreate(request, `/api/admin/events/${encodeURIComponent(id)}/media`);
}
