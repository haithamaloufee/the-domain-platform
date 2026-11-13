import { NextRequest } from "next/server";
import { fetchAuthorizedBackend } from "@/lib/auth/authorized-backend";
import { isSameOriginRequest } from "@/lib/auth/route-security";

type Context = { params: Promise<{ path: string[] }> };
const idPattern = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

async function forward(request: NextRequest, context: Context) {
  const { path } = await context.params;
  const [resource, id = "", action] = path;
  const method = request.method;
  const list =
    method === "GET" && path.length === 1 && (resource === "users" || resource === "messages");
  const create = method === "POST" && path.length === 1 && resource === "users";
  const update =
    method === "PUT" &&
    path.length === 2 &&
    (resource === "users" || resource === "promotions") &&
    idPattern.test(id);
  const readPromotion =
    method === "GET" && path.length === 2 && resource === "promotions" && idPattern.test(id);
  const markRead =
    method === "POST" &&
    path.length === 3 &&
    resource === "messages" &&
    idPattern.test(id) &&
    action === "read";
  if (!list && !readPromotion && !create && !update && !markRead)
    return new Response(null, { status: 404 });
  if (method !== "GET" && !isSameOriginRequest(request)) return new Response(null, { status: 403 });

  try {
    const body = create || update ? await request.text() : undefined;
    if (body && body.length > 8192) return new Response(null, { status: 413 });
    const offset = Math.max(
      0,
      Number.parseInt(request.nextUrl.searchParams.get("offset") ?? "0", 10) || 0,
    );
    const result = await fetchAuthorizedBackend(
      `/api/admin/${path.join("/")}${list ? `?offset=${offset}` : ""}`,
      {
        method,
        body,
        headers: body ? { "Content-Type": "application/json" } : undefined,
      },
    );
    return new Response(result.body, {
      status: result.status,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": result.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch {
    return Response.json({ detail: "The service is temporarily unavailable." }, { status: 503 });
  }
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
