import { NextRequest } from "next/server";
import { proxyEventRead, proxyEventWrite } from "@/lib/events/event-route";

export function GET() {
  return proxyEventRead("/api/admin/events", "list");
}

export function POST(request: NextRequest) {
  return proxyEventWrite(request, "/api/admin/events", "POST", { body: true });
}
