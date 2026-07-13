import {
  BookingAvailability,
  EventDisplayStatus,
  type PublicEventListItem,
} from "@the-domain/types";
import { Badge, MediaFrame, buttonClasses } from "@the-domain/ui";
import { cn } from "@the-domain/utils";
import Image from "next/image";
import Link from "next/link";
import {
  bookingAvailabilityLabels,
  displayStatusLabels,
  formatEventDate,
  mediaImageSource,
} from "./event-presentation";

export function PublicEventCard({
  event,
  priority = false,
  variant = "default",
}: {
  event: PublicEventListItem;
  priority?: boolean;
  variant?: "default" | "compact";
}) {
  const media = event.coverMedia;
  const source = mediaImageSource(media);
  const canBook =
    event.bookingAvailability === BookingAvailability.Open && event.externalBookingUrl !== null;

  if (variant === "compact") {
    return (
      <article className="cinematic-card group relative min-h-[30rem] overflow-hidden border border-line bg-surface">
        <MediaFrame className="absolute inset-0 border-0">
          {source ? (
            <Image
              alt={media?.altText ?? ""}
              className="cinematic-media object-cover"
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, 50vw"
              src={source}
            />
          ) : (
            <EventArtworkFallback />
          )}
        </MediaFrame>
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/45 to-canvas/5" />
        <div className="relative flex min-h-[30rem] flex-col justify-end p-6 sm:p-8">
          <div className="flex flex-wrap gap-2">
            <StatusBadge event={event} />
            <Badge>{event.eventType}</Badge>
          </div>
          <p className="mt-6 font-label text-xs uppercase tracking-[0.14em] text-gold">
            {formatEventDate(event.startAtUtc, event.timeZoneId)}
          </p>
          <h3 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl">
            {event.title}
          </h3>
          <p className="mt-3 text-sm text-ink-muted">
            {event.city} / {event.venueName}
          </p>
          <p className="mt-2 font-label text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted">
            {bookingAvailabilityLabels[event.bookingAvailability]}
          </p>
          <EventActions canBook={canBook} event={event} />
        </div>
      </article>
    );
  }

  return (
    <article className="cinematic-card group grid overflow-hidden border border-line bg-surface lg:grid-cols-[minmax(18rem,0.9fr)_minmax(0,1.1fr)]">
      <MediaFrame className="min-h-80 lg:min-h-[30rem]">
        {source ? (
          <Image
            alt={media?.altText ?? ""}
            className="cinematic-media object-cover"
            fill
            priority={priority}
            sizes="(max-width: 1024px) 100vw, 45vw"
            src={source}
          />
        ) : (
          <EventArtworkFallback />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-canvas/80 via-transparent to-transparent" />
      </MediaFrame>

      <div className="flex flex-col justify-between p-6 sm:p-9 lg:p-12">
        <div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge event={event} />
            <Badge>{event.eventType}</Badge>
          </div>
          <p className="mt-8 font-label text-xs uppercase tracking-[0.14em] text-gold">
            {formatEventDate(event.startAtUtc, event.timeZoneId)}
          </p>
          <h3 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] text-ink sm:text-5xl">
            {event.title}
          </h3>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-ink-muted sm:text-base">
            {event.shortDescription}
          </p>
        </div>

        <div className="mt-10 border-t border-line pt-6">
          <p className="text-sm text-ink">
            {event.city} / {event.venueName}
          </p>
          <p className="mt-2 font-label text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted">
            {bookingAvailabilityLabels[event.bookingAvailability]}
          </p>
          <EventActions canBook={canBook} event={event} />
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ event }: { event: PublicEventListItem }) {
  return (
    <Badge
      className={cn(
        event.displayStatus === EventDisplayStatus.Live && "border-error text-error",
        event.displayStatus === EventDisplayStatus.Upcoming && "border-gold text-gold",
      )}
    >
      {displayStatusLabels[event.displayStatus]}
    </Badge>
  );
}

function EventActions({ canBook, event }: { canBook: boolean; event: PublicEventListItem }) {
  const isFinished = event.displayStatus === EventDisplayStatus.Finished;
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {canBook && (
        <a
          className={buttonClasses("primary")}
          href={event.externalBookingUrl ?? undefined}
          rel="noreferrer"
          target="_blank"
        >
          Book Now
        </a>
      )}
      <Link
        className={buttonClasses(canBook ? "secondary" : "primary")}
        href={`/events/${event.slug}`}
      >
        {isFinished ? "View Highlights" : "View Event"}
      </Link>
    </div>
  );
}

function EventArtworkFallback() {
  return (
    <div className="grid h-full place-items-center bg-surface-raised px-8 text-center">
      <span className="font-label text-xs uppercase tracking-[0.16em] text-ink-muted">
        Event artwork coming soon
      </span>
    </div>
  );
}
