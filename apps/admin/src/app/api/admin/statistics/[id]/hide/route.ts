import { NextRequest } from "next/server";
import { proxyCmsMutation } from "@/lib/cms/cms-route";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyCmsMutation(
    request,
    `/api/admin/statistics/${encodeURIComponent(id)}/hide`,
    "POST",
    "statistic",
  );
}
