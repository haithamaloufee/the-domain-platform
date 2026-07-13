import { NextRequest } from "next/server";
import { proxyCmsMutation, proxyCmsRead } from "@/lib/cms/cms-route";

export function GET() {
  return proxyCmsRead("/api/admin/homepage", "homepage");
}

export function PUT(request: NextRequest) {
  return proxyCmsMutation(request, "/api/admin/homepage", "PUT", "homepage", "homepage");
}
