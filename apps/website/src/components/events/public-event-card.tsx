import {
  BookingAvailability,
  EventDisplayStatus,
  type PublicEventListItem,
} from "@the-domain/types";
import { Badge, MediaFrame, buttonClasses } from "@the-domain/ui";
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
}: {
  event: PublicEventListItem;
  priority?: boolean;
}) {
  const media = event.coverMedia;
  const source = mediaImageSource(media);
  const isFinished = event.displayStatus === EventDisplayStatus.Finished;
  const canBook =
    event.bookingAvailability === BookingAvailability.Open && event.externalBookingUrl !== null;

  return (
    <article className="group grid overflow-hidden border border-line bg-surface lg:grid-cols-[minmax(18rem,0.9fr)_minmax(0,1.1fr)]">
      <MediaFrame className="min-h-80 lg:min-h-[30rem]">
        {source ? (
          <Image
            alt={media?.altText ?? ""}
            className="object-cover transition duration-500 group-hover:scale-[1.02]"
            fill
            priority={priority}
            sizes="(max-width: 1024px) 100vw, 45vw"
            src={source}
          />
        ) : (
          <div className="grid h-full place-items-center bg-surface-raised px-8 text-center">
            <span className="font-label text-xs uppercase tracking-[0.16em] text-ink-muted">
              Event artwork coming soon
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-canvas/80 via-transparent to-transparent" />
      </MediaFrame>

      <div className="flex flex-col justify-between p-6 sm:p-9 lg:p-12">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge
              className={
                event.displayStatus === EventDisplayStatus.Live
                  ? "border-error text-error"
                  : event.displayStatus === EventDisplayStatus.Upcoming
                    ? "border-gold text-gold"
                    : undefined
              }
            >
              {displayStatusLabels[event.displayStatus]}
            </Badge>
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
        </div>
      </div>
    </article>
  );
}
