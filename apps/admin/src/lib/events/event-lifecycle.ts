import {
  BookingAvailability,
  EventPublicationStatus,
  type AdminEventDetails,
  type BookingAvailabilityValue,
  type EventPublicationStatusValue,
} from "@the-domain/types";

export const manualBookingOptions: ReadonlyArray<{
  description: string;
  label: string;
  value: BookingAvailabilityValue;
}> = [
  {
    value: BookingAvailability.Hidden,
    label: "Hidden",
    description: "No public booking action is configured.",
  },
  {
    value: BookingAvailability.Open,
    label: "Open",
    description: "Shows the external booking button while the event and booking window allow it.",
  },
  {
    value: BookingAvailability.SoldOut,
    label: "Sold out",
    description: "Keeps the event public but never shows an active booking link.",
  },
  {
    value: BookingAvailability.Closed,
    label: "Closed",
    description: "Shows that booking is closed without exposing an active link.",
  },
];

export const publicationOptions: ReadonlyArray<{
  description: string;
  label: string;
  value: EventPublicationStatusValue;
}> = [
  { value: EventPublicationStatus.Draft, label: "Draft", description: "Private and editable." },
  { value: EventPublicationStatus.Published, label: "Published", description: "Visible on public event surfaces." },
  { value: EventPublicationStatus.Cancelled, label: "Cancelled", description: "Publicly marked as cancelled." },
  { value: EventPublicationStatus.Archived, label: "Archived", description: "Removed from public event surfaces." },
];

export function canTransitionPublication(
  current: EventPublicationStatusValue,
  target: EventPublicationStatusValue,
): boolean {
  if (current === target) return true;
  if (current === EventPublicationStatus.Draft)
    return target !== EventPublicationStatus.Draft;
  if (current === EventPublicationStatus.Published)
    return target === EventPublicationStatus.Cancelled || target === EventPublicationStatus.Archived;
  return current === EventPublicationStatus.Cancelled && target === EventPublicationStatus.Archived;
}

export interface BookingPreviewInput {
  bookingClosesAt: string;
  bookingOpensAt: string;
  bookingStatus: BookingAvailabilityValue;
  endAt: string;
  externalBookingUrl: string | null;
  publicationStatus: EventPublicationStatusValue;
  timeZoneId: string;
}

export function bookingPreview(input: BookingPreviewInput, now = new Date()): string {
  if (input.publicationStatus !== EventPublicationStatus.Published)
    return "Event is not public; no booking action will appear.";
  const end = zonedInputToUtc(input.endAt, input.timeZoneId);
  if (end && new Date(end) <= now) return "Event has ended; booking is effectively closed.";
  if (input.bookingStatus === BookingAvailability.Hidden) return "Booking is unavailable.";
  if (input.bookingStatus === BookingAvailability.Closed) return "Booking is closed.";
  if (input.bookingStatus === BookingAvailability.SoldOut)
    return "Sold out; no booking link will appear.";
  if (!isSafeBookingUrl(input.externalBookingUrl))
    return "Open booking needs a valid HTTPS URL before the button can appear.";
  const opens = zonedInputToUtc(input.bookingOpensAt, input.timeZoneId);
  if (opens && new Date(opens) > now) return "Booking is not open yet.";
  const closes = zonedInputToUtc(input.bookingClosesAt, input.timeZoneId);
  if (closes && new Date(closes) <= now) return "Booking is closed.";
  return "The public booking button will appear.";
}

export function publishingWarnings(event: AdminEventDetails, hasEligibleCover: boolean): string[] {
  const warnings: string[] = [];
  if (!hasEligibleCover) warnings.push("No eligible event cover is selected.");
  if (!isValidTimeZone(event.timeZoneId)) warnings.push("The event timezone is invalid.");
  if (new Date(event.endAtUtc) <= new Date()) warnings.push("The event end time has already passed.");
  if (
    event.bookingStatus === BookingAvailability.Open &&
    !isSafeBookingUrl(event.externalBookingUrl)
  )
    warnings.push("Booking is Open without a valid HTTPS booking URL.");
  return warnings;
}

export function isSafeBookingUrl(value: string | null | undefined): boolean {
  if (!value?.trim()) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export function utcToZonedInput(value: string | null | undefined, timeZone: string): string {
  if (!value || !isValidTimeZone(timeZone)) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = dateParts(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function zonedInputToUtc(value: string, timeZone: string): string | null {
  if (!value) return null;
  if (!isValidTimeZone(timeZone)) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match;
  const wallClock = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
  let candidate = wallClock;
  for (let attempt = 0; attempt < 3; attempt++) {
    const displayed = dateParts(new Date(candidate), timeZone);
    const displayedAsUtc = Date.UTC(
      Number(displayed.year),
      Number(displayed.month) - 1,
      Number(displayed.day),
      Number(displayed.hour),
      Number(displayed.minute),
    );
    candidate += wallClock - displayedAsUtc;
  }
  const result = new Date(candidate);
  return utcToZonedInput(result.toISOString(), timeZone) === value ? result.toISOString() : null;
}

function dateParts(
  date: Date,
  timeZone: string,
): Record<"year" | "month" | "day" | "hour" | "minute", string> {
  const values = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    values.find((value) => value.type === type)?.value ?? "";
  return {
    year: part("year"),
    month: part("month"),
    day: part("day"),
    hour: part("hour"),
    minute: part("minute"),
  };
}
