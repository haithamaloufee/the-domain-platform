import {
  BookingAvailability,
  EventDisplayStatus,
  MediaType,
  type BookingAvailabilityValue,
  type EventDisplayStatusValue,
  type PublicMediaItem,
} from "@the-domain/types";

export const displayStatusLabels: Record<EventDisplayStatusValue, string> = {
  [EventDisplayStatus.Upcoming]: "Upcoming",
  [EventDisplayStatus.Live]: "Happening now",
  [EventDisplayStatus.Finished]: "Ended",
  [EventDisplayStatus.Cancelled]: "Cancelled",
};

export const bookingAvailabilityLabels: Record<BookingAvailabilityValue, string> = {
  [BookingAvailability.Hidden]: "Booking unavailable",
  [BookingAvailability.NotOpenYet]: "Booking opens soon",
  [BookingAvailability.Open]: "Booking open",
  [BookingAvailability.Closed]: "Booking closed",
  [BookingAvailability.SoldOut]: "Sold out",
};

export function mediaImageSource(media: PublicMediaItem | null): string | null {
  if (!media) return null;
  return (
    media.videoPoster.posterUrl ??
    media.thumbnailUrl ??
    (media.mediaType === MediaType.Image ? media.url : null)
  );
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
