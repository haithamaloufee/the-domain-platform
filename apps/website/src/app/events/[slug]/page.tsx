import { BookingAvailability, EventDisplayStatus, EventMediaUsage } from "@the-domain/types";
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
  selectEventMedia,
} from "@/components/events/event-presentation";
import { PublicMediaThumbnail } from "@/components/gallery/public-media-thumbnail";
import { getEventBySlug, PublicApiError } from "@/lib/public-api";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const event = await getEventBySlug(slug);
    return { title: event.title, description: event.shortDescription };
  } catch {
    return { title: "Event" };
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

  const heroMedia = selectEventMedia(event.media);
  const gallery = event.media
    .filter((item) => item.usage === EventMediaUsage.Gallery)
    .sort((left, right) => left.sortOrder - right.sortOrder);
  const canBook =
    event.bookingAvailability === BookingAvailability.Open && event.externalBookingUrl !== null;

  return (
    <article>
      <section className="relative min-h-[82svh] overflow-hidden border-b border-line">
        <EventHeroMedia media={heroMedia} title={event.title} />
        <Container className="relative flex min-h-[82svh] items-end pb-12 pt-32 sm:pb-20">
          <div className="max-w-5xl">
            <div className="flex flex-wrap gap-2">
              <Badge
                className={
                  event.displayStatus === EventDisplayStatus.Cancelled
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
            <h1 className="mt-6 break-words font-display text-5xl font-extrabold leading-[0.9] tracking-[-0.05em] text-ink sm:text-7xl lg:text-8xl">
              {event.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-ink-muted sm:text-lg">
              {event.shortDescription}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
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
              {gallery.length > 0 && (
                <Link className={buttonClasses("secondary")} href={`/gallery/${event.slug}`}>
                  View full gallery
                </Link>
              )}
            </div>
          </div>
        </Container>
      </section>

      <Section className="cinematic-reveal pt-16 sm:pt-24">
        <Container>
          {event.displayStatus === EventDisplayStatus.Upcoming && (
            <div className="mb-12 max-w-3xl">
              <p className="mb-4 font-label text-xs uppercase tracking-[0.14em] text-gold">
                Until doors open
              </p>
              <EventCountdown startAtUtc={event.startAtUtc} />
            </div>
          )}

          {event.displayStatus === EventDisplayStatus.Finished && (
            <StateNotice title="Event Finished">
              The booking window is closed. Explore the approved highlights from this event below.
            </StateNotice>
          )}
          {event.displayStatus === EventDisplayStatus.Cancelled && (
            <StateNotice title="Event Cancelled" tone="error">
              This event is no longer proceeding. Booking is unavailable.
            </StateNotice>
          )}

          <div className="grid gap-12 border-t border-line pt-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]">
            <div>
              <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">
                The experience
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-5xl">
                About the event
              </h2>
              <div className="mt-6 whitespace-pre-line text-base leading-8 text-ink-muted">
                {event.longDescription || event.shortDescription}
              </div>
            </div>
            <dl className="architectural-grid grid gap-6 border border-line bg-surface/35 p-6 lg:p-8">
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
                  rel="noreferrer"
                  target="_blank"
                >
                  Open map
                </a>
              )}
            </dl>
          </div>
        </Container>
      </Section>

      {gallery.length > 0 && (
        <Section className="cinematic-reveal border-t border-line">
          <Container>
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">
                  Approved media
                </p>
                <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-5xl">
                  Event highlights
                </h2>
              </div>
              <Link className={buttonClasses("secondary")} href={`/gallery/${event.slug}`}>
                Open full album
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {gallery.slice(0, 6).map((media) => (
                <div className="group" key={media.id}>
                  <PublicMediaThumbnail media={media} />
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}
    </article>
  );
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
    >
      <p className="font-display text-xl font-bold text-ink">{title}</p>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{children}</p>
    </div>
  );
}
