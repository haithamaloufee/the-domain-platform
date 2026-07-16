import { NextRequest } from "next/server";
import { proxyAbout } from "@/lib/about/about-route";
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyAbout(`/api/admin/team/${encodeURIComponent(id)}/show`, request, "POST");
}
