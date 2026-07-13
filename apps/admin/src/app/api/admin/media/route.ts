import { NextRequest } from "next/server";
import { proxyMediaList } from "@/lib/media/media-route";

export function GET(request: NextRequest) {
  return proxyMediaList(request);
}
