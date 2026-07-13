export const EventPublicationStatus = {
  Draft: 1,
  Published: 2,
  Cancelled: 3,
  Archived: 4,
} as const;

export type EventPublicationStatus =
  (typeof EventPublicationStatus)[keyof typeof EventPublicationStatus];

export const EventDisplayStatus = {
  Upcoming: 1,
  Live: 2,
  Finished: 3,
  Cancelled: 4,
} as const;

export type EventDisplayStatus = (typeof EventDisplayStatus)[keyof typeof EventDisplayStatus];

export const BookingAvailability = {
  Hidden: 1,
  NotOpenYet: 2,
  Open: 3,
  Closed: 4,
  SoldOut: 5,
} as const;

export type BookingAvailability = (typeof BookingAvailability)[keyof typeof BookingAvailability];

export interface SaveEventRequest {
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  eventType: string;
  startAtUtc: string;
  endAtUtc: string;
  timeZoneId: string;
  city: string;
  venueName: string;
  venueAddress: string | null;
  mapUrl: string | null;
  externalBookingUrl: string | null;
  isBookingEnabled: boolean;
  bookingOpensAtUtc: string | null;
  bookingClosesAtUtc: string | null;
  isFeatured: boolean;
  showOnHomepage: boolean;
}

export type CreateEventRequest = SaveEventRequest;
export type UpdateEventRequest = SaveEventRequest;

export interface AdminEventDetails extends SaveEventRequest {
  id: string;
  publicationStatus: EventPublicationStatus;
  displayStatus: EventDisplayStatus;
  bookingAvailability: BookingAvailability;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export type AdminEventListItem = AdminEventDetails;

export interface AdminEventErrorResponse {
  message: string;
}
