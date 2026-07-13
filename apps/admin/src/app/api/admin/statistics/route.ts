import { NextRequest } from "next/server";
import { proxyCmsMutation, proxyCmsRead } from "@/lib/cms/cms-route";

export function GET() {
  return proxyCmsRead("/api/admin/statistics", "statistics");
}

export function POST(request: NextRequest) {
  return proxyCmsMutation(request, "/api/admin/statistics", "POST", "statistic", "statistic");
}
