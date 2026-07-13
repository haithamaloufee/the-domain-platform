import type {
  AdminMediaDetails,
  AdminMediaErrorResponse,
  AdminMediaListItem,
  AssignEventMediaRequest,
  EventMediaResponse,
  MediaListQuery,
  PagedResponse,
  UpdateEventMediaRequest,
  UpdateMediaMetadataRequest,
  UploadMediaRequestMetadata,
} from "@the-domain/types";
import { parseEventMedia, parseMediaDetails, parseMediaPage } from "./media-contract";

export function listAdminMedia(query: MediaListQuery): Promise<PagedResponse<AdminMediaListItem>> {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  return request(`/api/admin/media?${search.toString()}`, { method: "GET" }, parseMediaPage);
}

export function getAdminMedia(id: string): Promise<AdminMediaDetails> {
  return request(
    `/api/admin/media/${encodeURIComponent(id)}`,
    { method: "GET" },
    parseMediaDetails,
  );
}

export function uploadAdminMedia(
  file: File,
  metadata: UploadMediaRequestMetadata,
): Promise<AdminMediaDetails> {
  const form = new FormData();
  form.set("file", file, file.name);
  appendOptional(form, "category", metadata.category);
  appendOptional(form, "caption", metadata.caption);
  appendOptional(form, "altText", metadata.altText);
  form.set("approvalStatus", String(metadata.approvalStatus));
  appendOptional(form, "eventId", metadata.eventId);
  if (metadata.usage !== undefined) form.set("usage", String(metadata.usage));
  if (metadata.sortOrder !== undefined) form.set("sortOrder", String(metadata.sortOrder));
  if (metadata.isFeatured !== undefined) form.set("isFeatured", String(metadata.isFeatured));
  return request("/api/admin/media/upload", { method: "POST", body: form }, parseMediaDetails);
}

export function updateAdminMediaMetadata(
  id: string,
  input: UpdateMediaMetadataRequest,
): Promise<AdminMediaDetails> {
  return jsonRequest(
    `/api/admin/media/${encodeURIComponent(id)}/metadata`,
    "PUT",
    input,
    parseMediaDetails,
  );
}

export function approveAdminMedia(id: string): Promise<AdminMediaDetails> {
  return action(id, "approve");
}

export function hideAdminMedia(id: string): Promise<AdminMediaDetails> {
  return action(id, "hide");
}

export function deleteAdminMedia(id: string): Promise<AdminMediaDetails> {
  return request(
    `/api/admin/media/${encodeURIComponent(id)}`,
    { method: "DELETE" },
    parseMediaDetails,
  );
}

export function assignMediaToEvent(
  eventId: string,
  input: AssignEventMediaRequest,
): Promise<EventMediaResponse> {
  return jsonRequest(
    `/api/admin/events/${encodeURIComponent(eventId)}/media`,
    "POST",
    input,
    parseEventMedia,
  );
}

export function updateEventMediaAssignment(
  eventId: string,
  eventMediaId: string,
  input: UpdateEventMediaRequest,
): Promise<EventMediaResponse> {
  return jsonRequest(
    `/api/admin/events/${encodeURIComponent(eventId)}/media/${encodeURIComponent(eventMediaId)}`,
    "PUT",
    input,
    parseEventMedia,
  );
}

export async function removeEventMediaAssignment(
  eventId: string,
  eventMediaId: string,
): Promise<void> {
  await request(
    `/api/admin/events/${encodeURIComponent(eventId)}/media/${encodeURIComponent(eventMediaId)}`,
    { method: "DELETE" },
    () => undefined,
    true,
  );
}

function action(id: string, name: "approve" | "hide") {
  return request(
    `/api/admin/media/${encodeURIComponent(id)}/${name}`,
    { method: "POST" },
    parseMediaDetails,
  );
}

function jsonRequest<T>(
  path: string,
  method: "POST" | "PUT",
  body: unknown,
  parse: (value: unknown) => T,
) {
  return request(
    path,
    { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
    parse,
  );
}

async function request<T>(
  path: string,
  init: RequestInit,
  parse: (value: unknown) => T,
  allowEmpty = false,
): Promise<T> {
  const response = await fetch(path, { ...init, cache: "no-store" });
  if (response.ok && allowEmpty && response.status === 204) return parse(null);
  const value = (await response.json().catch(() => null)) as unknown;
  if (!response.ok) {
    const error = value as Partial<AdminMediaErrorResponse> | null;
    throw new Error(error?.message ?? "Unable to complete the media request.");
  }
  return parse(value);
}

function appendOptional(form: FormData, key: string, value: string | undefined) {
  if (value?.trim()) form.set(key, value.trim());
}
