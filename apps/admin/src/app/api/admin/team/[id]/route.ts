import { NextRequest } from "next/server";
import { proxyAbout } from "@/lib/about/about-route";
type Context = { params: Promise<{ id: string }> };
export async function PUT(request: NextRequest, context: Context) {
  const { id } = await context.params;
  return proxyAbout(`/api/admin/team/${encodeURIComponent(id)}`, request, "PUT");
}
export async function DELETE(request: NextRequest, context: Context) {
  const { id } = await context.params;
  return proxyAbout(`/api/admin/team/${encodeURIComponent(id)}`, request, "DELETE");
}
