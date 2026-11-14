import { NextRequest } from "next/server";
import { proxyMediaOrganization } from "@/lib/media/media-organization-route";
interface Context {
  params: Promise<{ id: string }>;
}
export async function POST(request: NextRequest, { params }: Context) {
  const { id } = await params;
  return proxyMediaOrganization(request, `/api/admin/media/${encodeURIComponent(id)}/restore`);
}
