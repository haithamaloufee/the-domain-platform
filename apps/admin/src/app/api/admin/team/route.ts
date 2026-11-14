import { NextRequest } from "next/server";
import { proxyAbout } from "@/lib/about/about-route";
export const GET = () => proxyAbout("/api/admin/team");
export const POST = (request: NextRequest) => proxyAbout("/api/admin/team", request, "POST");
