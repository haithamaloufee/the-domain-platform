import { NextRequest } from "next/server";
import { proxyMediaUpload } from "@/lib/media/media-route";

export function POST(request: NextRequest) {
  return proxyMediaUpload(request);
}
