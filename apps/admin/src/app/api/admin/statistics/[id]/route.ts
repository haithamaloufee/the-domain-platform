import { NextRequest } from "next/server";
import { proxyCmsMutation } from "@/lib/cms/cms-route";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyCmsMutation(
    request,
    `/api/admin/statistics/${encodeURIComponent(id)}`,
    "PUT",
    "statistic",
    "statistic",
  );
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyCmsMutation(
    request,
    `/api/admin/statistics/${encodeURIComponent(id)}`,
    "DELETE",
    "statistic",
  );
}
