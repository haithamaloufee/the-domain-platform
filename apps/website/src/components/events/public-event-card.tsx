import {
  BookingAvailability,
  EventDisplayStatus,
  type PublicEventListItem,
} from "@the-domain/types";
import { Badge, MediaFrame, buttonClasses } from "@the-domain/ui";
import { cn, eventCoverRenderData } from "@the-domain/utils";
import Link from "next/link";
import { EventCountdown } from "./event-countdown";
import {
  bookingAvailabilityLabels,
  displayStatusLabels,
  formatEventDate,
  formatEventTime,
} from "./event-presentation";
import { EventCoverImage } from "./event-cover-image";

type EventCardVariant = "listing" | "featured" | "archive" | "compact";

export function PublicEventCard({
  className,
  event,
  priority = false,
  variant = "listing",
}: {
  className?: string;
  event: PublicEventListItem;
  priority?: boolean;
  variant?: EventCardVariant;
}) {
  const media = event.coverMedia;
  const source = eventCoverRenderData(media);
  const canBook =
    event.bookingAvailability === BookingAvailability.Open && event.externalBookingUrl !== null;

  if (variant === "compact") {
    return (
      <article
        className={cn(
          "cinematic-card group relative min-h-[30rem] overflow-hidden border border-line bg-surface",
          className,
        )}
      >
        <MediaFrame className="absolute inset-0 border-0">
          {source ? (
            <EventCoverImage
              media={media!}
              priority={priority}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <EventArtworkFallback />
          )}
        </MediaFrame>
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/50 to-canvas/5" />
        <div className="relative flex min-h-[30rem] flex-col justify-end p-6 sm:p-8">
          <div className="flex flex-wrap gap-2">
            <StatusBadge event={event} />
            <Badge>{event.eventType}</Badge>
          </div>
          <time
            className="mt-6 font-label text-xs uppercase tracking-[0.14em] text-gold"
            dateTime={event.startAtUtc}
          >
            {formatEventDate(event.startAtUtc, event.timeZoneId)}
          </time>
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

  const featured = variant === "featured";
  const archived = variant === "archive";

  return (
    <article className={cn("group min-w-0", className)}>
      <Link
        aria-label={`View ${event.title}`}
        className="cinematic-card relative block overflow-hidden border border-line bg-surface focus-visible:outline-2 focus-visible:outline-offset-4"
        href={`/events/${event.slug}`}
      >
        <MediaFrame
          className={cn(
            "border-0",
            featured ? "aspect-[4/3] sm:aspect-[16/10]" : "aspect-[4/3] sm:aspect-[3/2]",
          )}
        >
          {source ? (
            <EventCoverImage
              media={media!}
              priority={priority}
              sizes={
                featured ? "(max-width: 1024px) 100vw, 60vw" : "(max-width: 768px) 100vw, 50vw"
              }
            />
          ) : (
            <EventArtworkFallback />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-canvas/80 via-transparent to-canvas/15" />
          <div className="absolute inset-x-0 top-0 flex flex-wrap gap-2 p-4 sm:p-5">
            <StatusBadge event={event} />
            <Badge className="border-ink/30 bg-canvas/65 text-ink">{event.eventType}</Badge>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 sm:p-5">
            <time
              className="font-label text-[0.6875rem] uppercase tracking-[0.14em] text-ink"
              dateTime={event.startAtUtc}
            >
              {formatEventDate(event.startAtUtc, event.timeZoneId)}
            </time>
            <span className="font-label text-[0.625rem] uppercase tracking-[0.14em] text-ink-muted">
              View event
            </span>
          </div>
        </MediaFrame>
      </Link>

      <div className="pt-5 sm:pt-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-label text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted">
          <time dateTime={event.startAtUtc}>
            {formatEventTime(event.startAtUtc, event.timeZoneId)}
          </time>
          <span aria-hidden="true" className="text-gold">
            /
          </span>
          <span>{event.city}</span>
        </div>
        <h3
          className={cn(
            "mt-3 break-words font-display font-bold tracking-[-0.035em] text-ink",
            featured ? "text-3xl sm:text-5xl" : "text-2xl sm:text-3xl",
          )}
        >
          <Link
            className="transition-colors hover:text-gold focus-visible:text-gold"
            href={`/events/${event.slug}`}
          >
            {event.title}
          </Link>
        </h3>
        {event.shortDescription.trim() && (
          <p
            className={cn(
              "mt-3 leading-7 text-ink-muted",
              featured ? "max-w-2xl text-base" : "line-clamp-2 text-sm",
            )}
          >
            {event.shortDescription}
          </p>
        )}
        <p className="mt-3 text-sm text-ink">
          {event.venueName}
          <span className="text-ink-muted">
            {" "}
            / {bookingAvailabilityLabels[event.bookingAvailability]}
          </span>
        </p>

        {!archived && event.displayStatus === EventDisplayStatus.Upcoming && (
          <div className="mt-5">
            <EventCountdown
              endAtUtc={event.endAtUtc}
              startAtUtc={event.startAtUtc}
              variant="compact"
            />
          </div>
        )}
        <EventActions canBook={canBook} event={event} />
      </div>
    </article>
  );
}

function StatusBadge({ event }: { event: PublicEventListItem }) {
  return (
    <Badge
      className={cn(
        "bg-canvas/70 backdrop-blur-sm",
        event.displayStatus === EventDisplayStatus.Live && "border-error text-error",
        event.displayStatus === EventDisplayStatus.Upcoming && "border-gold text-gold",
        event.displayStatus === EventDisplayStatus.Cancelled && "border-error text-error",
      )}
    >
      {displayStatusLabels[event.displayStatus]}
    </Badge>
  );
}

function EventActions({ canBook, event }: { canBook: boolean; event: PublicEventListItem }) {
  const isFinished = event.displayStatus === EventDisplayStatus.Finished;
  return (
    <div className="mt-5 flex flex-wrap gap-3">
      {canBook && (
        <a
          className={buttonClasses("primary")}
          href={event.externalBookingUrl ?? undefined}
          rel="noopener noreferrer"
          target="_blank"
        >
          Book now
          <span className="sr-only"> for {event.title} (opens in a new tab)</span>
        </a>
      )}
      <Link
        className={buttonClasses(canBook ? "secondary" : "primary")}
        href={`/events/${event.slug}`}
      >
        {isFinished ? "View highlights" : "View event"}
      </Link>
    </div>
  );
}

function EventArtworkFallback() {
  return (
    <div className="architectural-grid grid h-full place-items-center bg-surface-raised px-8 text-center">
      <span className="font-label text-xs uppercase tracking-[0.16em] text-ink-muted">
        Event artwork coming soon
      </span>
    </div>
  );
}
