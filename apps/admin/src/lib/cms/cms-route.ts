import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { fetchAuthorizedBackend } from "@/lib/auth/authorized-backend";
import { isSameOriginRequest } from "@/lib/auth/route-security";
import {
  type CmsRequestShape,
  parseAdminHomepage,
  parseAdminPartner,
  parseAdminPartners,
  parseAdminStatistic,
  parseAdminStatistics,
  parseCmsRequest,
} from "./cms-contract";

export type CmsResponseShape = "homepage" | "statistics" | "statistic" | "partners" | "partner";

export function proxyCmsRead(path: `/${string}`, shape: CmsResponseShape) {
  return proxyRequest(path, { method: "GET" }, shape);
}

export async function proxyCmsMutation(
  request: NextRequest,
  path: `/${string}`,
  method: "POST" | "PUT" | "DELETE",
  responseShape: CmsResponseShape,
  requestShape?: CmsRequestShape,
) {
  if (!isSameOriginRequest(request)) return errorResponse("Request origin is not allowed.", 403);

  let body: string | undefined;
  if (requestShape) {
    const input = await readRequest(request, requestShape);
    if (!input) return errorResponse("Please review the content and try again.", 400);
    body = JSON.stringify(input);
  }

  return proxyRequest(
    path,
    {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body,
    },
    responseShape,
  );
}

async function proxyRequest(path: `/${string}`, init: RequestInit, shape: CmsResponseShape) {
  try {
    const response = await fetchAuthorizedBackend(path, init);
    if (!response.ok) return mapBackendError(response);

    const value = (await response.json()) as unknown;
    return NextResponse.json(parseResponse(value, shape), {
      status: response.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return errorResponse("Unable to connect to the server. Please try again.", 503);
  }
}

function parseResponse(value: unknown, shape: CmsResponseShape) {
  switch (shape) {
    case "homepage":
      return parseAdminHomepage(value);
    case "statistics":
      return parseAdminStatistics(value);
    case "statistic":
      return parseAdminStatistic(value);
    case "partners":
      return parseAdminPartners(value);
    case "partner":
      return parseAdminPartner(value);
  }
}

async function readRequest(request: NextRequest, shape: CmsRequestShape) {
  try {
    return parseCmsRequest((await request.json()) as unknown, shape);
  } catch {
    return null;
  }
}

async function mapBackendError(response: Response) {
  if (response.status === 401)
    return errorResponse("Your session expired. Please sign in again.", 401);
  if (response.status === 403)
    return errorResponse("You do not have permission to manage homepage content.", 403);
  if (response.status === 404) return errorResponse("The requested content was not found.", 404);
  if (response.status === 409)
    return errorResponse(
      (await readSafeDetail(response)) ?? "This content conflicts with an existing record.",
      409,
    );
  if (response.status === 400)
    return errorResponse(
      (await readSafeDetail(response)) ?? "Please review the content and try again.",
      400,
    );
  return errorResponse("Unable to complete the request. Please try again.", 503);
}

async function readSafeDetail(response: Response): Promise<string | null> {
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
    // Deliberately fall back to a generic browser-safe error.
  }
  return null;
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ message }, { status, headers: { "Cache-Control": "no-store" } });
}
