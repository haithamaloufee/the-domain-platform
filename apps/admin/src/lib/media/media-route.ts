import "server-only";

import type { AdminMediaErrorResponse } from "@the-domain/types";
import { NextRequest, NextResponse } from "next/server";
import { fetchAuthorizedBackend } from "@/lib/auth/authorized-backend";
import { isSameOriginRequest } from "@/lib/auth/route-security";
import {
  parseAssignmentRequest,
  parseAssignmentUpdate,
  parseEventMedia,
  parseMediaDetails,
  parseMediaPage,
  parseMetadataRequest,
} from "./media-contract";

const queryKeys = [
  "pageNumber",
  "pageSize",
  "mediaType",
  "approvalStatus",
  "category",
  "orientation",
  "eventId",
  "usage",
  "search",
] as const;

type ResponseShape = "page" | "details" | "assignment" | "empty";

export function proxyMediaList(request: NextRequest) {
  const query = new URLSearchParams();
  for (const key of queryKeys) {
    const value = request.nextUrl.searchParams.get(key);
    if (value) query.set(key, value.slice(0, 500));
  }
  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  return proxyRequest(`/api/admin/media${suffix}`, { method: "GET" }, "page");
}

export function proxyMediaDetails(path: `/${string}`) {
  return proxyRequest(path, { method: "GET" }, "details");
}

export async function proxyMediaMetadata(request: NextRequest, path: `/${string}`) {
  const body = await readJson(request, parseMetadataRequest);
  if (!body) return errorResponse("Please review the media metadata and try again.", 400);
  return proxyJsonMutation(request, path, "PUT", body, "details");
}

export function proxyMediaAction(request: NextRequest, path: `/${string}`) {
  return proxyMutation(request, path, { method: "POST" }, "details");
}

export function proxyMediaDelete(request: NextRequest, path: `/${string}`) {
  return proxyMutation(request, path, { method: "DELETE" }, "details");
}

export async function proxyMediaUpload(request: NextRequest) {
  if (!isSameOriginRequest(request)) return errorResponse("Request origin is not allowed.", 403);

  try {
    const incoming = await request.formData();
    const file = incoming.get("file");
    if (!(file instanceof File) || file.size <= 0) {
      return errorResponse("Choose a non-empty image or video file.", 400);
    }

    const outgoing = new FormData();
    outgoing.set("file", file, file.name);
    for (const key of [
      "category",
      "caption",
      "altText",
      "approvalStatus",
      "eventId",
      "usage",
      "sortOrder",
      "isFeatured",
    ]) {
      const value = incoming.get(key);
      if (typeof value === "string" && value.length <= 2_000) outgoing.set(key, value);
    }

    return proxyRequest("/api/admin/media/upload", { method: "POST", body: outgoing }, "details");
  } catch {
    return errorResponse("The upload request could not be read.", 400);
  }
}

export async function proxyEventMediaCreate(request: NextRequest, path: `/${string}`) {
  const body = await readJson(request, parseAssignmentRequest);
  if (!body) return errorResponse("Please review the media assignment and try again.", 400);
  return proxyJsonMutation(request, path, "POST", body, "assignment");
}

export async function proxyEventMediaUpdate(request: NextRequest, path: `/${string}`) {
  const body = await readJson(request, parseAssignmentUpdate);
  if (!body) return errorResponse("Please review the media assignment and try again.", 400);
  return proxyJsonMutation(request, path, "PUT", body, "assignment");
}

export function proxyEventMediaDelete(request: NextRequest, path: `/${string}`) {
  return proxyMutation(request, path, { method: "DELETE" }, "empty");
}

async function proxyJsonMutation(
  request: NextRequest,
  path: `/${string}`,
  method: "POST" | "PUT",
  body: unknown,
  shape: ResponseShape,
) {
  return proxyMutation(
    request,
    path,
    { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
    shape,
  );
}

function proxyMutation(
  request: NextRequest,
  path: `/${string}`,
  init: RequestInit,
  shape: ResponseShape,
) {
  if (!isSameOriginRequest(request)) return errorResponse("Request origin is not allowed.", 403);
  return proxyRequest(path, init, shape);
}

async function proxyRequest(path: `/${string}`, init: RequestInit, shape: ResponseShape) {
  try {
    const response = await fetchAuthorizedBackend(path, init);
    if (!response.ok) return mapBackendError(response);
    if (shape === "empty" || response.status === 204) {
      return new NextResponse(null, {
        status: response.status,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const value = (await response.json()) as unknown;
    const result =
      shape === "page"
        ? parseMediaPage(value)
        : shape === "assignment"
          ? parseEventMedia(value)
          : parseMediaDetails(value);
    return NextResponse.json(result, {
      status: response.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return errorResponse("Unable to connect to the server. Please try again.", 503);
  }
}

async function readJson<T>(
  request: NextRequest,
  parse: (value: unknown) => T | null,
): Promise<T | null> {
  try {
    return parse((await request.json()) as unknown);
  } catch {
    return null;
  }
}

async function mapBackendError(response: Response) {
  if (response.status === 401)
    return errorResponse("Your session expired. Please sign in again.", 401);
  if (response.status === 403)
    return errorResponse("You do not have permission to manage media.", 403);
  if (response.status === 404)
    return errorResponse("The requested media record was not found.", 404);
  if (response.status === 400) {
    return errorResponse(
      (await readSafeDetail(response)) ?? "Please review the media details and try again.",
      400,
    );
  }
  return errorResponse("Unable to connect to the server. Please try again.", 503);
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
    // Fall back to a generic, browser-safe message.
  }
  return null;
}

function errorResponse(message: string, status: number) {
  return NextResponse.json<AdminMediaErrorResponse>(
    { message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
