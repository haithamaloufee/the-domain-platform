import { NextRequest } from "next/server";
import { proxyAbout } from "@/lib/about/about-route";
export const POST = (request: NextRequest) =>
  proxyAbout("/api/admin/team/reorder", request, "POST");
