import {
  BookingAvailability,
  EventMediaUsage,
  EventPublicationStatus,
  MediaApprovalStatus,
  type AdminEventDetails,
  type AdminEventMediaItem,
  type BookingAvailabilityValue,
  type EventPublicationStatusValue,
  type SaveEventRequest,
} from "@the-domain/types";
import {
  bookingPreview,
  isSafeBookingUrl,
  isValidTimeZone,
  utcToZonedInput,
  zonedInputToUtc,
} from "./event-lifecycle";
import {
  activeEventCover,
  isEligibleEventCover,
  orderedEventMedia,
} from "../media/event-media-rules";

export const wizardSteps = [
  { id: "basic", label: "Basic information" },
  { id: "schedule", label: "Schedule and booking" },
  { id: "media", label: "Media" },
  { id: "review", label: "Review and publish" },
] as const;

export type WizardStepId = (typeof wizardSteps)[number]["id"];

export const commonEventTypes = [
  "Concert",
  "Festival",
  "Corporate event",
  "Private event",
  "Cultural event",
  "Entertainment experience",
] as const;
export const otherEventType = "Other";
export const knownCities = ["Amman", "Aqaba", "Irbid", "Dead Sea"] as const;

export interface EventWizardFields {
  slug: string;
  title: string;
  eventTypeChoice: string;
  customEventType: string;
  shortDescription: string;
  longDescription: string;
  city: string;
  venueName: string;
  venueAddress: string;
  mapUrl: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  timeZoneId: string;
  publicationStatus: EventPublicationStatusValue;
  bookingStatus: BookingAvailabilityValue;
  externalBookingUrl: string;
  bookingOpenDate: string;
  bookingOpenTime: string;
  bookingCloseDate: string;
  bookingCloseTime: string;
  isFeatured: boolean;
  showOnHomepage: boolean;
}

export type EventWizardFieldName = keyof EventWizardFields;
export type EventWizardErrors = Partial<Record<EventWizardFieldName, string>>;
export type EventWizardUpdate = <K extends EventWizardFieldName>(
  field: K,
  value: EventWizardFields[K],
) => void;

export interface PublishChecklistItem {
  id: string;
  label: string;
  met: boolean;
  warning?: boolean;
}

export interface EventPreviewModel {
  bookingSummary: string;
  city: string;
  cover: AdminEventMediaItem | null;
  description: string;
  eventType: string;
  gallery: AdminEventMediaItem[];
  lifecycleLabel: string;
  scheduleSummary: string;
  title: string;
  venueName: string;
}

const fallbackTimeZones = [
  "Asia/Amman",
  "Asia/Beirut",
  "Asia/Dubai",
  "Asia/Jerusalem",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Los_Angeles",
  "UTC",
];

export function initialWizardFields(event?: AdminEventDetails): EventWizardFields {
  const timeZoneId = event?.timeZoneId ?? "Asia/Amman";
  const eventType = eventTypeSelection(event?.eventType ?? "");
  const start = splitZonedInput(utcToZonedInput(event?.startAtUtc, timeZoneId));
  const end = splitZonedInput(utcToZonedInput(event?.endAtUtc, timeZoneId));
  const bookingOpen = splitZonedInput(utcToZonedInput(event?.bookingOpensAtUtc, timeZoneId));
  const bookingClose = splitZonedInput(utcToZonedInput(event?.bookingClosesAtUtc, timeZoneId));
  return {
    slug: event?.slug ?? "",
    title: event?.title ?? "",
    eventTypeChoice: eventType.choice,
    customEventType: eventType.custom,
    shortDescription: event?.shortDescription ?? "",
    longDescription: event?.longDescription ?? "",
    city: event?.city ?? "Amman",
    venueName: event?.venueName ?? "",
    venueAddress: event?.venueAddress ?? "",
    mapUrl: event?.mapUrl ?? "",
    startDate: start.date,
    startTime: start.time,
    endDate: end.date,
    endTime: end.time,
    timeZoneId,
    publicationStatus: event?.publicationStatus ?? EventPublicationStatus.Draft,
    bookingStatus: event?.bookingStatus ?? BookingAvailability.Hidden,
    externalBookingUrl: event?.externalBookingUrl ?? "",
    bookingOpenDate: bookingOpen.date,
    bookingOpenTime: bookingOpen.time,
    bookingCloseDate: bookingClose.date,
    bookingCloseTime: bookingClose.time,
    isFeatured: event?.isFeatured ?? false,
    showOnHomepage: event?.showOnHomepage ?? false,
  };
}

export function eventTypeSelection(value: string): { choice: string; custom: string } {
  if (!value) return { choice: "", custom: "" };
  return (commonEventTypes as readonly string[]).includes(value)
    ? { choice: value, custom: "" }
    : { choice: otherEventType, custom: value };
}

export function selectedEventType(fields: EventWizardFields): string {
  return fields.eventTypeChoice === otherEventType
    ? fields.customEventType.trim()
    : fields.eventTypeChoice.trim();
}

export function validateWizardStep(
  fields: EventWizardFields,
  step: WizardStepId,
): EventWizardErrors {
  const errors: EventWizardErrors = {};
  if (step === "basic") {
    required(errors, "title", fields.title, "Event title is required.");
    if (!selectedEventType(fields)) errors.eventTypeChoice = "Event type is required.";
    if (fields.eventTypeChoice === otherEventType && !fields.customEventType.trim())
      errors.customEventType = "Enter the custom event type.";
    required(errors, "shortDescription", fields.shortDescription, "Short description is required.");
    required(errors, "longDescription", fields.longDescription, "Full description is required.");
    required(errors, "city", fields.city, "City is required.");
    required(errors, "venueName", fields.venueName, "Venue name is required.");
    if (fields.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.slug))
      errors.slug = "Use lowercase letters, numbers, and single hyphens.";
  }
  if (step === "schedule") {
    required(errors, "startDate", fields.startDate, "Start date is required.");
    required(errors, "startTime", fields.startTime, "Start time is required.");
    required(errors, "endDate", fields.endDate, "End date is required.");
    required(errors, "endTime", fields.endTime, "End time is required.");
    if (!isValidTimeZone(fields.timeZoneId)) errors.timeZoneId = "Choose a valid IANA timezone.";
    const start = zonedInputToUtc(joinDateTime(fields.startDate, fields.startTime), fields.timeZoneId);
    const end = zonedInputToUtc(joinDateTime(fields.endDate, fields.endTime), fields.timeZoneId);
    if (fields.startDate && fields.startTime && !start)
      errors.startTime = "This local time is not valid in the selected timezone.";
    if (fields.endDate && fields.endTime && !end)
      errors.endTime = "This local time is not valid in the selected timezone.";
    if (start && end && new Date(end) <= new Date(start))
      errors.endTime = "Event end must be after event start.";
    if (fields.bookingStatus === BookingAvailability.Open) {
      if (!isSafeBookingUrl(fields.externalBookingUrl))
        errors.externalBookingUrl = "Open booking requires a valid HTTPS URL.";
      validateOptionalDateTime(errors, fields, "bookingOpenDate", "bookingOpenTime");
      validateOptionalDateTime(errors, fields, "bookingCloseDate", "bookingCloseTime");
      const opens = optionalUtc(fields.bookingOpenDate, fields.bookingOpenTime, fields.timeZoneId);
      const closes = optionalUtc(fields.bookingCloseDate, fields.bookingCloseTime, fields.timeZoneId);
      if (opens && closes && new Date(closes) < new Date(opens))
        errors.bookingCloseTime = "Booking close cannot precede booking open.";
    }
  }
  return errors;
}

export function firstInvalidField(errors: EventWizardErrors): EventWizardFieldName | null {
  const order: EventWizardFieldName[] = [
    "title", "eventTypeChoice", "customEventType", "shortDescription", "longDescription",
    "city", "venueName", "slug", "startDate", "startTime", "endDate", "endTime",
    "timeZoneId", "externalBookingUrl", "bookingOpenDate", "bookingOpenTime",
    "bookingCloseDate", "bookingCloseTime",
  ];
  return order.find((field) => Boolean(errors[field])) ?? null;
}

export function toSaveEventRequest(fields: EventWizardFields): SaveEventRequest | null {
  const startAtUtc = zonedInputToUtc(joinDateTime(fields.startDate, fields.startTime), fields.timeZoneId);
  const endAtUtc = zonedInputToUtc(joinDateTime(fields.endDate, fields.endTime), fields.timeZoneId);
  if (!startAtUtc || !endAtUtc) return null;
  return {
    slug: fields.slug.trim() || null,
    title: fields.title.trim(),
    shortDescription: fields.shortDescription.trim(),
    longDescription: fields.longDescription.trim(),
    eventType: selectedEventType(fields),
    startAtUtc,
    endAtUtc,
    timeZoneId: fields.timeZoneId.trim(),
    city: fields.city.trim(),
    venueName: fields.venueName.trim(),
    venueAddress: fields.venueAddress.trim() || null,
    mapUrl: fields.mapUrl.trim() || null,
    externalBookingUrl:
      fields.bookingStatus === BookingAvailability.Open
        ? fields.externalBookingUrl.trim() || null
        : null,
    isBookingEnabled: fields.bookingStatus === BookingAvailability.Open,
    bookingStatus: fields.bookingStatus,
    bookingOpensAtUtc:
      fields.bookingStatus === BookingAvailability.Open
        ? optionalUtc(fields.bookingOpenDate, fields.bookingOpenTime, fields.timeZoneId)
        : null,
    bookingClosesAtUtc:
      fields.bookingStatus === BookingAvailability.Open
        ? optionalUtc(fields.bookingCloseDate, fields.bookingCloseTime, fields.timeZoneId)
        : null,
    isFeatured: fields.isFeatured,
    showOnHomepage: fields.showOnHomepage,
  };
}

export function timezoneOptions(existing = ""): string[] {
  let values: string[] = [];
  try {
    const supportedValuesOf = (Intl as typeof Intl & {
      supportedValuesOf?: (key: "timeZone") => string[];
    }).supportedValuesOf;
    values = supportedValuesOf ? supportedValuesOf("timeZone") : [...fallbackTimeZones];
  } catch {
    values = [...fallbackTimeZones];
  }
  if (!values.includes("Asia/Amman")) values.push("Asia/Amman");
  if (existing && isValidTimeZone(existing) && !values.includes(existing)) values.push(existing);
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

export function routeAfterDraftCreation(id: string): string {
  return `/dashboard/events/${encodeURIComponent(id)}/edit?step=media`;
}

export function isManualSlugOverride(slug: string, canonicalSlug = ""): boolean {
  const value = slug.trim();
  return value.length > 0 && value !== canonicalSlug;
}

export function buildEventPreview(
  fields: EventWizardFields,
  media: AdminEventMediaItem[],
  bookingNow = new Date(),
): EventPreviewModel {
  const approved = orderedEventMedia(media).filter(
    (item) => item.media.approvalStatus === MediaApprovalStatus.Approved,
  );
  const cover = activeEventCover(media);
  const startAt = zonedInputToUtc(joinDateTime(fields.startDate, fields.startTime), fields.timeZoneId);
  return {
    bookingSummary: bookingPreview({
      bookingClosesAt: joinDateTime(fields.bookingCloseDate, fields.bookingCloseTime),
      bookingOpensAt: joinDateTime(fields.bookingOpenDate, fields.bookingOpenTime),
      bookingStatus: fields.bookingStatus,
      endAt: joinDateTime(fields.endDate, fields.endTime),
      externalBookingUrl: fields.externalBookingUrl,
      publicationStatus: fields.publicationStatus,
      timeZoneId: fields.timeZoneId,
    }, bookingNow),
    city: fields.city.trim() || "City to be confirmed",
    cover,
    description: fields.shortDescription.trim() || "Your short event description will appear here.",
    eventType: selectedEventType(fields) || "Event type",
    gallery: approved.filter((item) => item.usage === EventMediaUsage.Gallery),
    lifecycleLabel: publicationLabel(fields.publicationStatus),
    scheduleSummary: startAt ? formatSchedule(startAt, fields.timeZoneId) : "Schedule to be confirmed",
    title: fields.title.trim() || "Untitled event",
    venueName: fields.venueName.trim() || "Venue to be confirmed",
  };
}

export function buildPublishChecklist(
  fields: EventWizardFields,
  media: AdminEventMediaItem[],
  coverWarningAcknowledged: boolean,
  serverPending: boolean,
): PublishChecklistItem[] {
  const basicValid = Object.keys(validateWizardStep(fields, "basic")).length === 0;
  const scheduleErrors = validateWizardStep(fields, "schedule");
  const eligibleCover = media.some(
    (item) => item.usage === EventMediaUsage.Cover && isEligibleEventCover(item.media),
  );
  const isPublishing = fields.publicationStatus === EventPublicationStatus.Published;
  const privateMediaCount = media.filter(
    (item) => item.media.approvalStatus !== MediaApprovalStatus.Approved,
  ).length;
  return [
    { id: "text", label: "Required event information is complete.", met: basicValid },
    { id: "schedule", label: "Schedule and timezone are valid.", met: Object.keys(scheduleErrors).length === 0 },
    { id: "booking", label: "Open booking has a safe HTTPS URL.", met: fields.bookingStatus !== BookingAvailability.Open || isSafeBookingUrl(fields.externalBookingUrl) },
    { id: "cover", label: eligibleCover ? "An eligible public cover is selected." : isPublishing ? "No eligible cover; acknowledge the public fallback." : "No eligible cover; the event remains non-public.", met: !isPublishing || eligibleCover || coverWarningAcknowledged, warning: !eligibleCover },
    { id: "media", label: privateMediaCount ? `${privateMediaCount} Draft or Hidden media item(s) will remain private.` : "Assigned public media is approved.", met: true, warning: privateMediaCount > 0 },
    { id: "pending", label: "No server operation is pending.", met: !serverPending },
  ];
}

export function canPublish(checklist: PublishChecklistItem[]): boolean {
  return checklist.every((item) => item.met);
}

function required(
  errors: EventWizardErrors,
  field: EventWizardFieldName,
  value: string,
  message: string,
) {
  if (!value.trim()) errors[field] = message;
}

function validateOptionalDateTime(
  errors: EventWizardErrors,
  fields: EventWizardFields,
  dateField: "bookingOpenDate" | "bookingCloseDate",
  timeField: "bookingOpenTime" | "bookingCloseTime",
) {
  const date = fields[dateField];
  const time = fields[timeField];
  if (date && !time) errors[timeField] = "Choose a time or clear the date.";
  if (!date && time) errors[dateField] = "Choose a date or clear the time.";
  if (date && time && !zonedInputToUtc(joinDateTime(date, time), fields.timeZoneId))
    errors[timeField] = "This local time is not valid in the selected timezone.";
}

function splitZonedInput(value: string): { date: string; time: string } {
  const [date = "", time = ""] = value.split("T");
  return { date, time };
}

function joinDateTime(date: string, time: string): string {
  return date && time ? `${date}T${time}` : "";
}

function optionalUtc(date: string, time: string, timeZoneId: string): string | null {
  return date && time ? zonedInputToUtc(joinDateTime(date, time), timeZoneId) : null;
}

function publicationLabel(status: EventPublicationStatusValue): string {
  if (status === EventPublicationStatus.Published) return "Published";
  if (status === EventPublicationStatus.Cancelled) return "Cancelled";
  if (status === EventPublicationStatus.Archived) return "Archived";
  return "Draft";
}

function formatSchedule(value: string, timeZoneId: string): string {
  try {
    const formatted = new Intl.DateTimeFormat("en", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: timeZoneId,
    }).format(new Date(value));
    return `${formatted} — ${timeZoneId}`;
  } catch {
    return `${value} — ${timeZoneId}`;
  }
}
