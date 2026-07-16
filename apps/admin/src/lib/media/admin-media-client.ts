import type {
  AdminMediaDetails,
  AdminMediaErrorResponse,
  AdminMediaListItem,
  AdminEventMediaItem,
  AssignEventMediaRequest,
  EventMediaResponse,
  MediaListQuery,
  MediaCollection,
  MediaCollectionItem,
  MediaUsage,
  PagedResponse,
  ReorderEventMediaRequest,
  UpdateEventMediaRequest,
  UpdateEventCoverPresentationRequest,
  UpdateMediaMetadataRequest,
  UpdateVideoPosterRequest,
  UploadMediaRequestMetadata,
} from "@the-domain/types";
import {
  parseAdminEventMediaList,
  parseEventMedia,
  parseMediaDetails,
  parseMediaPage,
  parseMediaCollection,
  parseMediaCollections,
  parseMediaCollectionItems,
  parseMediaUsage,
} from "./media-contract";

export function listAdminMedia(query: MediaListQuery): Promise<PagedResponse<AdminMediaListItem>> {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
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
export function archiveAdminMedia(id: string) {
  return request(
    `/api/admin/media/${encodeURIComponent(id)}/archive`,
    { method: "POST" },
    parseMediaDetails,
  );
}
export function restoreAdminMedia(id: string) {
  return request(
    `/api/admin/media/${encodeURIComponent(id)}/restore`,
    { method: "POST" },
    parseMediaDetails,
  );
}
export function getMediaUsage(id: string): Promise<MediaUsage> {
  return request(
    `/api/admin/media/${encodeURIComponent(id)}/usage`,
    { method: "GET" },
    parseMediaUsage,
  );
}
export function permanentlyDeleteAdminMedia(id: string, confirmation: string) {
  return jsonDelete(`/api/admin/media/${encodeURIComponent(id)}/permanent`, { confirmation });
}

export function listMediaCollections(includeArchived = false): Promise<MediaCollection[]> {
  return request(
    `/api/admin/media-collections?includeArchived=${includeArchived}`,
    { method: "GET" },
    parseMediaCollections,
  );
}
export function createMediaCollection(name: string) {
  return jsonRequest("/api/admin/media-collections", "POST", { name }, parseMediaCollection);
}
export function renameMediaCollection(id: string, name: string) {
  return jsonRequest(
    `/api/admin/media-collections/${encodeURIComponent(id)}`,
    "PUT",
    { name },
    parseMediaCollection,
  );
}
export function collectionAction(id: string, actionName: "archive" | "restore") {
  return request(
    `/api/admin/media-collections/${encodeURIComponent(id)}/${actionName}`,
    { method: "POST" },
    parseMediaCollection,
  );
}
export function deleteMediaCollection(id: string) {
  return request(
    `/api/admin/media-collections/${encodeURIComponent(id)}`,
    { method: "DELETE" },
    parseMediaCollection,
  );
}
export function listMediaCollectionItems(id: string): Promise<MediaCollectionItem[]> {
  return request(
    `/api/admin/media-collections/${encodeURIComponent(id)}/items`,
    { method: "GET" },
    parseMediaCollectionItems,
  );
}
export function addMediaToCollection(id: string, mediaAssetId: string) {
  return jsonRequest(
    `/api/admin/media-collections/${encodeURIComponent(id)}/items`,
    "POST",
    { mediaAssetId },
    parseMediaCollectionItems,
  );
}
export function removeMediaFromCollection(id: string, mediaAssetId: string) {
  return request(
    `/api/admin/media-collections/${encodeURIComponent(id)}/items/${encodeURIComponent(mediaAssetId)}`,
    { method: "DELETE" },
    parseMediaCollectionItems,
  );
}
export function reorderMediaCollection(id: string, mediaAssetIds: string[]) {
  return jsonRequest(
    `/api/admin/media-collections/${encodeURIComponent(id)}/reorder`,
    "POST",
    { mediaAssetIds },
    parseMediaCollectionItems,
  );
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

export function listEventMedia(eventId: string): Promise<AdminEventMediaItem[]> {
  return request(
    `/api/admin/events/${encodeURIComponent(eventId)}/media`,
    { method: "GET" },
    parseAdminEventMediaList,
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

export function setEventCover(eventId: string, eventMediaId: string): Promise<EventMediaResponse> {
  return request(
    `/api/admin/events/${encodeURIComponent(eventId)}/media/${encodeURIComponent(eventMediaId)}/cover`,
    { method: "POST" },
    parseEventMedia,
  );
}

export function updateEventCoverPresentation(
  eventId: string,
  eventMediaId: string,
  input: UpdateEventCoverPresentationRequest,
): Promise<EventMediaResponse> {
  return jsonRequest(
    `/api/admin/events/${encodeURIComponent(eventId)}/media/${encodeURIComponent(eventMediaId)}/presentation`,
    "PUT",
    input,
    parseEventMedia,
  );
}

export function updateEventVideoPoster(
  eventId: string,
  eventMediaId: string,
  input: UpdateVideoPosterRequest,
): Promise<EventMediaResponse> {
  return jsonRequest(
    `/api/admin/events/${encodeURIComponent(eventId)}/media/${encodeURIComponent(eventMediaId)}/video-poster`,
    "PUT",
    input,
    parseEventMedia,
  );
}

export async function reorderEventMedia(
  eventId: string,
  input: ReorderEventMediaRequest,
): Promise<void> {
  await jsonRequest(
    `/api/admin/events/${encodeURIComponent(eventId)}/media/reorder`,
    "POST",
    input,
    () => undefined,
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
function jsonDelete(path: string, body: unknown) {
  return request(
    path,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    (value) => value,
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
