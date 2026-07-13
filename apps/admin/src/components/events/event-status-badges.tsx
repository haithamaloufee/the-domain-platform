import {
  BookingAvailability,
  EventDisplayStatus,
  EventPublicationStatus,
  type BookingAvailabilityValue,
  type EventDisplayStatusValue,
  type EventPublicationStatusValue,
} from "@the-domain/types";
import { Badge } from "@the-domain/ui";

const publicationLabels: Record<EventPublicationStatusValue, string> = {
  [EventPublicationStatus.Draft]: "Draft",
  [EventPublicationStatus.Published]: "Published",
  [EventPublicationStatus.Cancelled]: "Cancelled",
  [EventPublicationStatus.Archived]: "Archived",
};

const displayLabels: Record<EventDisplayStatusValue, string> = {
  [EventDisplayStatus.Upcoming]: "Upcoming",
  [EventDisplayStatus.Live]: "Live",
  [EventDisplayStatus.Finished]: "Finished",
  [EventDisplayStatus.Cancelled]: "Cancelled",
};

const bookingLabels: Record<BookingAvailabilityValue, string> = {
  [BookingAvailability.Hidden]: "Hidden",
  [BookingAvailability.NotOpenYet]: "Not open yet",
  [BookingAvailability.Open]: "Open",
  [BookingAvailability.Closed]: "Closed",
  [BookingAvailability.SoldOut]: "Sold out",
};

export function PublicationBadge({ status }: { status: EventPublicationStatusValue }) {
  return (
    <Badge
      className={status === EventPublicationStatus.Published ? "border-gold text-gold" : undefined}
    >
      {publicationLabels[status]}
    </Badge>
  );
}

export function DisplayBadge({ status }: { status: EventDisplayStatusValue }) {
  const className =
    status === EventDisplayStatus.Live
      ? "border-error text-error"
      : status === EventDisplayStatus.Upcoming
        ? "border-gold/60 text-gold"
        : undefined;
  return <Badge className={className}>{displayLabels[status]}</Badge>;
}

export function BookingBadge({ status }: { status: BookingAvailabilityValue }) {
  return (
    <Badge className={status === BookingAvailability.Open ? "border-gold text-gold" : undefined}>
      {bookingLabels[status]}
    </Badge>
  );
}
