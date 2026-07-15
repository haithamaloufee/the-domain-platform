import type { AdminEventMediaItem } from "@the-domain/types";
import { orderedEventMedia } from "./event-media-rules";

export function reorderEventMediaIds(
  items: AdminEventMediaItem[],
  activeId: string,
  overId: string,
): string[] {
  const ids = orderedEventMedia(items).map((item) => item.id);
  const activeIndex = ids.indexOf(activeId);
  const overIndex = ids.indexOf(overId);
  if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) return ids;
  const [active] = ids.splice(activeIndex, 1);
  ids.splice(overIndex, 0, active!);
  return ids;
}

export function moveEventMediaId(
  items: AdminEventMediaItem[],
  id: string,
  direction: -1 | 1,
): string[] {
  const ids = orderedEventMedia(items).map((item) => item.id);
  const index = ids.indexOf(id);
  const destination = index + direction;
  if (index < 0 || destination < 0 || destination >= ids.length) return ids;
  [ids[index], ids[destination]] = [ids[destination]!, ids[index]!];
  return ids;
}

export function orderItemsByCanonicalIds(
  items: AdminEventMediaItem[],
  canonicalIds: string[],
): AdminEventMediaItem[] {
  if (
    canonicalIds.length !== items.length ||
    new Set(canonicalIds).size !== canonicalIds.length ||
    !canonicalIds.every((id) => items.some((item) => item.id === id))
  ) {
    return orderedEventMedia(items);
  }
  const byId = new Map(items.map((item) => [item.id, item]));
  return canonicalIds.map((id, sortOrder) => ({ ...byId.get(id)!, sortOrder }));
}
