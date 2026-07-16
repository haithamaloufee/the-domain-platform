import type { SaveGalleryPresentationRequest } from "@the-domain/types";
import { parseGalleryAdminCollection, parseGalleryAdminCollections } from "./gallery-contract";
export function getAdminGallery() {
  return request("/api/admin/gallery", { method: "GET" }, parseGalleryAdminCollections);
}
export function galleryPublication(id: string, action: "publish" | "unpublish") {
  return request(
    `/api/admin/gallery/collections/${encodeURIComponent(id)}/${action}`,
    { method: "POST" },
    parseGalleryAdminCollection,
  );
}
export function reorderGalleryCollections(collectionIds: string[]) {
  return json(
    "/api/admin/gallery/reorder",
    "POST",
    { collectionIds },
    parseGalleryAdminCollections,
  );
}
export function saveGalleryPresentation(id: string, body: SaveGalleryPresentationRequest) {
  return json(
    `/api/admin/gallery/collections/${encodeURIComponent(id)}/presentation`,
    "PUT",
    body,
    parseGalleryAdminCollection,
  );
}
export function resetGalleryPresentation(id: string) {
  return request(
    `/api/admin/gallery/collections/${encodeURIComponent(id)}/reset`,
    { method: "POST" },
    parseGalleryAdminCollection,
  );
}
function json<T>(
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
): Promise<T> {
  const response = await fetch(path, { ...init, cache: "no-store" });
  const value = (await response.json().catch(() => null)) as unknown;
  if (!response.ok) {
    const error = value as { message?: unknown } | null;
    throw new Error(
      typeof error?.message === "string" ? error.message : "Unable to update the Gallery.",
    );
  }
  return parse(value);
}
