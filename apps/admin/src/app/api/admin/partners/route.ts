import { NextRequest } from "next/server";
import { proxyCmsMutation, proxyCmsRead } from "@/lib/cms/cms-route";

export function GET() {
  return proxyCmsRead("/api/admin/partners", "partners");
}

export function POST(request: NextRequest) {
  return proxyCmsMutation(request, "/api/admin/partners", "POST", "partner", "partner");
}
