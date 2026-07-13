import { NextRequest } from "next/server";
import { proxyCmsMutation } from "@/lib/cms/cms-route";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyCmsMutation(
    request,
    `/api/admin/partners/${encodeURIComponent(id)}`,
    "PUT",
    "partner",
    "partner",
  );
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyCmsMutation(
    request,
    `/api/admin/partners/${encodeURIComponent(id)}`,
    "DELETE",
    "partner",
  );
}
