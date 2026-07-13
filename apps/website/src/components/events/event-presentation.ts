import {
  BookingAvailability,
  EventDisplayStatus,
  EventMediaUsage,
  MediaType,
  type BookingAvailabilityValue,
  type EventDisplayStatusValue,
  type PublicMediaItem,
} from "@the-domain/types";

export const displayStatusLabels: Record<EventDisplayStatusValue, string> = {
  [EventDisplayStatus.Upcoming]: "Upcoming",
  [EventDisplayStatus.Live]: "Live now",
  [EventDisplayStatus.Finished]: "Finished",
  [EventDisplayStatus.Cancelled]: "Cancelled",
};

export const bookingAvailabilityLabels: Record<BookingAvailabilityValue, string> = {
  [BookingAvailability.Hidden]: "Booking unavailable",
  [BookingAvailability.NotOpenYet]: "Booking opens soon",
  [BookingAvailability.Open]: "Booking open",
  [BookingAvailability.Closed]: "Booking closed",
  [BookingAvailability.SoldOut]: "Sold out",
};

const eventMediaPriority = [
  EventMediaUsage.Hero,
  EventMediaUsage.Cover,
  EventMediaUsage.Poster,
  EventMediaUsage.Thumbnail,
  EventMediaUsage.Gallery,
] as const;

export function selectEventMedia(media: PublicMediaItem[]): PublicMediaItem | null {
  for (const usage of eventMediaPriority) {
    const match = media.find((item) => item.usage === usage && item.isFeatured);
    if (match) return match;
    const fallback = media.find((item) => item.usage === usage);
    if (fallback) return fallback;
  }
  return media[0] ?? null;
}

export function mediaImageSource(media: PublicMediaItem | null): string | null {
  if (!media) return null;
  return media.thumbnailUrl ?? (media.mediaType === MediaType.Image ? media.url : null);
}

export function formatEventDate(value: string, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "long",
      timeZone,
    }).format(new Date(value));
  } catch {
    return new Date(value).toLocaleDateString();
  }
}

export function formatEventTime(value: string, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en", {
      hour: "numeric",
      minute: "2-digit",
      timeZone,
      timeZoneName: "short",
    }).format(new Date(value));
  } catch {
    return new Date(value).toLocaleTimeString();
  }
}
