import type { PublicEventListItem } from "@the-domain/types";
import { MediaFrame } from "@the-domain/ui";
import { eventCoverRenderData } from "@the-domain/utils";
import Link from "next/link";
import { EventCoverImage } from "@/components/events/event-cover-image";
import { DynamicText } from "@/components/motion/dynamic-weight-controller";
import {
  bookingAvailabilityLabels,
  displayStatusLabels,
} from "@/components/events/event-presentation";

export function HomepageEventPreview({
  event,
  priority = false,
}: {
  event: PublicEventListItem;
  priority?: boolean;
}) {
  const source = eventCoverRenderData(event.coverMedia);
  return (
    <article className="homepage-event-card group relative isolate min-w-0" data-reveal="card">
      <Link
        aria-label={`View ${event.title}`}
        className="homepage-event-card__link relative z-10 flex h-full flex-col overflow-hidden border bg-canvas focus-visible:outline-2 focus-visible:outline-offset-4"
        href={`/events/${event.slug}`}
      >
        <MediaFrame className="homepage-event-card__media aspect-[4/5] overflow-hidden border-0 bg-surface sm:aspect-[3/2]">
          {source ? (
            <div className="homepage-event-card__image-wrapper absolute inset-0">
              <EventCoverImage
                className="object-cover"
                media={event.coverMedia!}
                priority={priority}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 100vw, 50vw"
              />
            </div>
          ) : (
            <div className="homepage-event-card__fallback architectural-grid grid h-full place-items-center bg-surface px-2 text-center text-[.58rem] uppercase tracking-[.12em] text-ink-muted sm:px-4 sm:text-xs sm:tracking-[.16em]">
              Event artwork coming soon
            </div>
          )}
          <div className="homepage-event-card__overlay absolute inset-0 bg-gradient-to-t from-canvas/35 via-transparent to-canvas/10" />
        </MediaFrame>
        <div className="flex flex-1 flex-col p-3 sm:p-5">
          <h3 className="line-clamp-2 text-[clamp(1rem,4.5vw,3.4rem)] font-extrabold leading-[1.05] tracking-[-.04em] text-ink transition-colors group-hover:text-gold">
            <DynamicText kind="heading">{event.title}</DynamicText>
          </h3>
          <div className="mt-auto grid gap-1.5 pt-3 text-[.56rem] uppercase leading-[1.35] tracking-[.1em] text-ink-muted sm:flex sm:flex-wrap sm:gap-x-4 sm:gap-y-2 sm:pt-4 sm:text-[.68rem] sm:tracking-[.14em]">
            <span>
              <DynamicText kind="label">{event.eventType}</DynamicText>
            </span>
            <span className="text-gold">
              <DynamicText kind="label">{displayStatusLabels[event.displayStatus]}</DynamicText>
            </span>
            <span>
              <DynamicText kind="label">
                {bookingAvailabilityLabels[event.bookingAvailability]}
              </DynamicText>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
