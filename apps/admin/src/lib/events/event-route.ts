import "server-only";

import type { AdminEventErrorResponse } from "@the-domain/types";
import { NextRequest, NextResponse } from "next/server";
import { fetchAuthorizedBackend } from "@/lib/auth/authorized-backend";
import { isSameOriginRequest } from "@/lib/auth/route-security";
import { parseAdminEvent, parseAdminEvents, parseSaveEventRequest } from "./event-contract";

type EventResponseShape = "list" | "single";

export async function proxyEventRead(path: `/${string}`, shape: EventResponseShape) {
  return proxyEventRequest(path, { method: "GET" }, shape);
}

export async function proxyEventWrite(
  request: NextRequest,
  path: `/${string}`,
  method: "POST" | "PUT",
  options: { body: boolean },
) {
  if (!isSameOriginRequest(request)) return errorResponse("Request origin is not allowed.", 403);

  let body: string | undefined;
  if (options.body) {
    const input = await readEventRequest(request);
    if (!input) return errorResponse("Please review the event details and try again.", 400);
    body = JSON.stringify(input);
  }

  return proxyEventRequest(
    path,
    {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body,
    },
    "single",
  );
}

async function proxyEventRequest(path: `/${string}`, init: RequestInit, shape: EventResponseShape) {
  try {
    const response = await fetchAuthorizedBackend(path, init);
    if (!response.ok) return mapBackendError(response);

    const value = (await response.json()) as unknown;
    const result = shape === "list" ? parseAdminEvents(value) : parseAdminEvent(value);
    return NextResponse.json(result, {
      status: response.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return errorResponse("Unable to connect to the server. Please try again.", 503);
  }
}

async function readEventRequest(request: NextRequest) {
  try {
    return parseSaveEventRequest((await request.json()) as unknown);
  } catch {
    return null;
  }
}

async function mapBackendError(response: Response) {
  if (response.status === 401)
    return errorResponse("Your session expired. Please sign in again.", 401);
  if (response.status === 403)
    return errorResponse("You do not have permission to manage events.", 403);
  if (response.status === 404) return errorResponse("Event was not found.", 404);

  if (response.status === 400) {
    const message = await readSafeProblemDetail(response);
    return errorResponse(message ?? "Please review the event details and try again.", 400);
  }

  return errorResponse("Unable to connect to the server. Please try again.", 503);
}

async function readSafeProblemDetail(response: Response): Promise<string | null> {
  try {
    const value = (await response.json()) as unknown;
    if (
      typeof value === "object" &&
      value !== null &&
      "detail" in value &&
      typeof value.detail === "string" &&
      value.detail.length <= 500
    ) {
      return value.detail;
    }
  } catch {
    // The BFF deliberately falls back to a generic validation message.
  }
  return null;
}

function errorResponse(message: string, status: number) {
  return NextResponse.json<AdminEventErrorResponse>(
    { message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
