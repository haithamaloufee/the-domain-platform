import {
  EventMediaUsage,
  MediaApprovalStatus,
  MediaType,
  type AdminEventMediaItem,
  type AdminMediaListItem,
} from "@the-domain/types";

export function isEligibleEventCover(media: AdminMediaListItem): boolean {
  if (media.mediaType !== MediaType.Image || media.approvalStatus !== MediaApprovalStatus.Approved)
    return false;
  try {
    return new URL(media.url).protocol === "https:";
  } catch {
    return false;
  }
}

export function orderedEventMedia(items: AdminEventMediaItem[]): AdminEventMediaItem[] {
  return [...items].sort(
    (left, right) =>
      left.sortOrder - right.sortOrder ||
      left.createdAtUtc.localeCompare(right.createdAtUtc) ||
      left.id.localeCompare(right.id),
  );
}

export function activeEventCover(items: AdminEventMediaItem[]): AdminEventMediaItem | null {
  return (
    orderedEventMedia(items).find(
      (item) => item.usage === EventMediaUsage.Cover && isEligibleEventCover(item.media),
    ) ?? null
  );
}

export function coverEligibilityMessage(media: AdminMediaListItem): string | null {
  if (media.mediaType !== MediaType.Image) return "Only approved images can be event covers.";
  if (media.approvalStatus === MediaApprovalStatus.Draft)
    return "Approve this draft before using it as the public cover.";
  if (media.approvalStatus === MediaApprovalStatus.Hidden)
    return "Hidden media cannot be used as the public cover.";
  if (!isEligibleEventCover(media)) return "This media URL is not eligible for public cover use.";
  return null;
}
