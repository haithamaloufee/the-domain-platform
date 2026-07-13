import { NextRequest } from "next/server";
import { proxyMediaDelete, proxyMediaDetails } from "@/lib/media/media-route";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyMediaDetails(`/api/admin/media/${encodeURIComponent(id)}`);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyMediaDelete(request, `/api/admin/media/${encodeURIComponent(id)}`);
}
