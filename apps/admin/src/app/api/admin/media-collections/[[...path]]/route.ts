import { NextRequest } from "next/server";
import { proxyMediaOrganization } from "@/lib/media/media-organization-route";

interface Context {
  params: Promise<{ path?: string[] }>;
}
async function handle(request: NextRequest, { params }: Context) {
  const path = (await params).path?.map(encodeURIComponent).join("/") ?? "";
  return proxyMediaOrganization(
    request,
    `/api/admin/media-collections/${path}${request.nextUrl.search}`,
  );
}
export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
