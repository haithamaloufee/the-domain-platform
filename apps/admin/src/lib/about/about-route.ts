import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { fetchAuthorizedBackend } from "@/lib/auth/authorized-backend";
import { isSameOriginRequest } from "@/lib/auth/route-security";
export async function proxyAbout(
  path: `/${string}`,
  request?: NextRequest,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
) {
  if (request && !isSameOriginRequest(request))
    return NextResponse.json({ message: "Request origin is not allowed." }, { status: 403 });
  try {
    let body: string | undefined;
    if (request && method !== "GET" && method !== "DELETE") {
      const value = await request.json();
      body = JSON.stringify(value);
    }
    const response = await fetchAuthorizedBackend(path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body,
    });
    if (!response.ok)
      return NextResponse.json(
        {
          message:
            response.status === 401
              ? "Your session expired. Please sign in again."
              : response.status === 403
                ? "You do not have permission to manage About content."
                : response.status === 404
                  ? "The requested content was not found."
                  : "Please review the content and try again.",
        },
        { status: response.status },
      );
    if (response.status === 204) return new NextResponse(null, { status: 204 });
    return NextResponse.json(await response.json(), {
      status: response.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to connect to the server. Please try again." },
      { status: 503 },
    );
  }
}
