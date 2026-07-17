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
    <article className="group min-w-0" data-reveal="card">
      <Link
        aria-label={`View ${event.title}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4"
        href={`/events/${event.slug}`}
      >
        <MediaFrame className="aspect-[4/3] overflow-hidden border-0 bg-surface sm:aspect-[3/2]">
          {source ? (
            <EventCoverImage
              className="transition duration-700 group-hover:scale-[1.025]"
              media={event.coverMedia!}
              priority={priority}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="architectural-grid grid h-full place-items-center bg-surface text-xs uppercase tracking-[.16em] text-ink-muted">
              Event artwork coming soon
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-canvas/35 via-transparent to-canvas/10" />
        </MediaFrame>
        <div className="pt-5">
          <h3 className="text-[clamp(1.8rem,3.2vw,3.4rem)] font-extrabold leading-[1.02] tracking-[-.045em] text-ink transition-colors group-hover:text-gold">
            <DynamicText kind="heading">{event.title}</DynamicText>
          </h3>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[.68rem] uppercase tracking-[.14em] text-ink-muted">
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
