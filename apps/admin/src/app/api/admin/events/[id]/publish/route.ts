import { NextRequest } from "next/server";
import { proxyEventWrite } from "@/lib/events/event-route";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyEventWrite(request, `/api/admin/events/${encodeURIComponent(id)}/publish`, "POST", {
    body: false,
  });
}
