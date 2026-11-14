import { NextRequest } from "next/server";
import { proxyAbout } from "@/lib/about/about-route";
export const GET = () => proxyAbout("/api/admin/about");
export const PUT = (request: NextRequest) => proxyAbout("/api/admin/about", request, "PUT");
