import { BookingAvailability, EventDisplayStatus, type PublicMediaItem } from "@the-domain/types";
import { Badge, Container, Section, buttonClasses } from "@the-domain/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCountdown } from "@/components/events/event-countdown";
import { EventHeroMedia } from "@/components/events/event-hero-media";
import {
  bookingAvailabilityLabels,
  displayStatusLabels,
  formatEventDate,
  formatEventTime,
} from "@/components/events/event-presentation";
import { GalleryMediaGrid } from "@/components/gallery/gallery-media-grid";
import { CinematicReveal } from "@/components/motion/cinematic-reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { getEventBySlug, PublicApiError } from "@/lib/public-api";
import {
  createPageMetadata,
  getFirstPublicMediaSeoImage,
  getWebsiteUrl,
  siteName,
} from "@/lib/seo";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const event = await getEventBySlug(slug);
    return createPageMetadata({
      title: event.title,
      description: event.shortDescription.trim() || `Event details for ${event.title}.`,
      path: `/events/${encodeURIComponent(event.slug)}`,
      image: getFirstPublicMediaSeoImage([event.coverMedia, ...event.media]),
    });
  } catch {
    return createPageMetadata({
      title: "Event",
      description: "Event details from The Domain Entertainment.",
      path: `/events/${encodeURIComponent(slug)}`,
      noIndex: true,
    });
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  let event;
  try {
    event = await getEventBySlug(slug);
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) notFound();
    throw error;
  }

  const heroMedia = event.coverMedia;
  const orderedMedia = uniqueOrderedMedia(event.media);
  const canBook =
    event.bookingAvailability === BookingAvailability.Open && event.externalBookingUrl !== null;

  return (
    <article>
      <JsonLd
        data={createEventStructuredData(
          event,
          getFirstPublicMediaSeoImage([heroMedia, ...event.media]),
        )}
      />

      <section className="relative min-h-[42rem] overflow-hidden border-b border-line sm:min-h-[44rem] lg:min-h-[min(48rem,78svh)]">
        <EventHeroMedia media={heroMedia} title={event.title} />
        <Container className="relative flex min-h-[42rem] items-end pb-12 pt-28 sm:min-h-[44rem] sm:pb-16 lg:min-h-[min(48rem,78svh)]">
          <div className="w-full max-w-5xl">
            <div className="flex flex-wrap gap-2">
              <Badge
                className={
                  event.displayStatus === EventDisplayStatus.Cancelled
                    ? "border-error bg-canvas/70 text-error backdrop-blur-sm"
                    : event.displayStatus === EventDisplayStatus.Upcoming
                      ? "border-gold bg-canvas/70 text-gold backdrop-blur-sm"
                      : "bg-canvas/70 backdrop-blur-sm"
                }
              >
                {displayStatusLabels[event.displayStatus]}
              </Badge>
              <Badge className="bg-canvas/70 text-ink backdrop-blur-sm">{event.eventType}</Badge>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 font-label text-[0.6875rem] uppercase tracking-[0.14em] text-ink-muted">
              <time dateTime={event.startAtUtc}>
                {formatEventDate(event.startAtUtc, event.timeZoneId)} /{" "}
                {formatEventTime(event.startAtUtc, event.timeZoneId)}
              </time>
              <span aria-hidden="true" className="text-gold">
                —
              </span>
              <span>
                {event.venueName}, {event.city}
              </span>
            </div>

            <h1 className="mt-5 max-w-[14ch] break-words font-display text-4xl font-extrabold leading-[0.94] tracking-[-0.05em] text-ink sm:text-6xl lg:text-7xl">
              {event.title}
            </h1>
            {event.shortDescription.trim() && (
              <p className="mt-6 max-w-2xl text-base leading-7 text-ink-muted sm:text-lg">
                {event.shortDescription}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              {canBook && (
                <a
                  className={buttonClasses("primary")}
                  href={event.externalBookingUrl ?? undefined}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Book now
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
              <Link className={buttonClasses("secondary")} href="/events">
                All events
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <Section className="pt-16 sm:pt-24">
        <Container>
          <CinematicReveal>
            {event.displayStatus === EventDisplayStatus.Upcoming && (
              <div className="mb-14 max-w-4xl">
                <p className="mb-4 font-label text-xs uppercase tracking-[0.14em] text-gold">
                  Until the event begins
                </p>
                <EventCountdown endAtUtc={event.endAtUtc} startAtUtc={event.startAtUtc} />
              </div>
            )}

            {event.displayStatus === EventDisplayStatus.Finished && (
              <StateNotice title="Event ended">
                Booking is closed. The approved media from this experience remains available below.
              </StateNotice>
            )}
            {event.displayStatus === EventDisplayStatus.Cancelled && (
              <StateNotice title="Event cancelled" tone="error">
                This event is no longer proceeding. Booking is unavailable.
              </StateNotice>
            )}

            <div className="grid gap-12 border-t border-line pt-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)] lg:gap-20">
              <div>
                <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">
                  The experience
                </p>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.04em] text-ink sm:text-5xl">
                  About the event
                </h2>
                <div className="mt-6 max-w-3xl whitespace-pre-line text-base leading-8 text-ink-muted">
                  {event.longDescription || event.shortDescription}
                </div>
              </div>
              <dl className="architectural-grid grid content-start gap-6 border border-line bg-surface/35 p-6 lg:p-8">
                <Detail label="Date" value={formatEventDate(event.startAtUtc, event.timeZoneId)} />
                <Detail label="Time" value={formatEventTime(event.startAtUtc, event.timeZoneId)} />
                <Detail label="Location" value={`${event.venueName}, ${event.city}`} />
                {event.venueAddress && <Detail label="Address" value={event.venueAddress} />}
                <Detail
                  label="Booking"
                  value={bookingAvailabilityLabels[event.bookingAvailability]}
                />
                {event.mapUrl && (
                  <a
                    className={buttonClasses("secondary")}
                    href={event.mapUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Open map
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                )}
              </dl>
            </div>
          </CinematicReveal>
        </Container>
      </Section>

      {orderedMedia.length > 0 && (
        <Section className="border-t border-line">
          <Container>
            <CinematicReveal>
              <header className="mb-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.65fr)] lg:items-end">
                <div>
                  <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">
                    Approved media
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.04em] text-ink sm:text-5xl">
                    Event highlights
                  </h2>
                </div>
                <p className="max-w-xl text-sm leading-7 text-ink-muted lg:justify-self-end">
                  Browse {orderedMedia.length} approved{" "}
                  {orderedMedia.length === 1 ? "moment" : "moments"} from this event.
                </p>
              </header>
              <GalleryMediaGrid media={orderedMedia} showFilters={false} />
            </CinematicReveal>
          </Container>
        </Section>
      )}
    </article>
  );
}

function uniqueOrderedMedia(media: PublicMediaItem[]): PublicMediaItem[] {
  const seen = new Set<string>();
  return [...media]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
}

function createEventStructuredData(
  event: Awaited<ReturnType<typeof getEventBySlug>>,
  image: string | null,
): Record<string, unknown> {
  const url = new URL(`/events/${encodeURIComponent(event.slug)}`, getWebsiteUrl()).toString();
  const eventStatus: Record<EventDisplayStatus, string> = {
    [EventDisplayStatus.Upcoming]: "https://schema.org/EventScheduled",
    [EventDisplayStatus.Live]: "https://schema.org/EventScheduled",
    [EventDisplayStatus.Finished]: "https://schema.org/EventCompleted",
    [EventDisplayStatus.Cancelled]: "https://schema.org/EventCancelled",
  };

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.shortDescription.trim() || `Event details for ${event.title}.`,
    startDate: event.startAtUtc,
    endDate: event.endAtUtc,
    eventStatus: eventStatus[event.displayStatus],
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url,
    image: image ? [image] : undefined,
    location: {
      "@type": "Place",
      name: event.venueName,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.venueAddress ?? undefined,
        addressLocality: event.city,
        addressCountry: "JO",
      },
    },
    organizer: {
      "@type": "Organization",
      name: siteName,
      url: getWebsiteUrl().toString(),
    },
  };
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-label text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </dt>
      <dd className="mt-2 text-sm leading-6 text-ink">{value}</dd>
    </div>
  );
}

function StateNotice({
  children,
  title,
  tone = "neutral",
}: {
  children: React.ReactNode;
  title: string;
  tone?: "neutral" | "error";
}) {
  return (
    <div
      className={`mb-12 border-l-2 px-5 py-4 ${tone === "error" ? "border-error bg-error/10" : "border-gold bg-gold/10"}`}
      role="status"
    >
      <p className="font-display text-xl font-bold text-ink">{title}</p>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{children}</p>
    </div>
  );
}
