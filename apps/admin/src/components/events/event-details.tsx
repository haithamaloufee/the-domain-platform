"use client";

import type { AdminEventDetails } from "@the-domain/types";
import { buttonClasses, Card, EmptyState } from "@the-domain/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminEvent } from "@/lib/events/admin-events-client";
import { isSafeBookingUrl } from "@/lib/events/event-lifecycle";
import { listEventMedia } from "@/lib/media/admin-media-client";
import { activeEventCover } from "@/lib/media/event-media-rules";
import { EventActions } from "./event-actions";
import { BookingBadge, DisplayBadge, PublicationBadge } from "./event-status-badges";

export function EventDetails({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<AdminEventDetails | null>(null);
  const [hasEligibleCover, setHasEligibleCover] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const [loadedEvent, media] = await Promise.all([
        getAdminEvent(eventId),
        listEventMedia(eventId),
      ]);
      setEvent(loadedEvent);
      setHasEligibleCover(activeEventCover(media) !== null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load this event.");
    }
  }

  useEffect(() => {
    let isActive = true;
    Promise.all([getAdminEvent(eventId), listEventMedia(eventId)])
      .then(([item, media]) => {
        if (isActive) {
          setEvent(item);
          setHasEligibleCover(activeEventCover(media) !== null);
        }
      })
      .catch((loadError: unknown) => {
        if (isActive)
          setError(loadError instanceof Error ? loadError.message : "Unable to load this event.");
      });
    return () => {
      isActive = false;
    };
  }, [eventId]);

  if (error && !event) {
    return (
      <EmptyState
        title="Event could not be loaded"
        description={error}
        action={
          <button className={buttonClasses("secondary")} onClick={() => void load()} type="button">
            Try again
          </button>
        }
      />
    );
  }

  if (!event) {
    return (
      <div className="h-[32rem] animate-pulse border border-line bg-surface-raised" role="status">
        <span className="sr-only">Loading event details</span>
      </div>
    );
  }

  return (
    <article>
      {error && (
        <p
          className="mb-5 border-l-2 border-error bg-error/10 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {error}
        </p>
      )}
      <header className="border-b border-line pb-8">
        <div className="flex flex-wrap gap-2">
          <PublicationBadge status={event.publicationStatus} />
          <DisplayBadge status={event.displayStatus} />
          <BookingBadge status={event.bookingAvailability} />
        </div>
        <div className="mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">
              {event.eventType}
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.03em] text-ink sm:text-6xl">
              {event.title}
            </h1>
            <p className="mt-3 text-sm text-ink-muted">/{event.slug}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className={buttonClasses("ghost")} href="/dashboard/events">
              Back to events
            </Link>
            <Link
              className={buttonClasses("secondary")}
              href={`/dashboard/events/${event.id}/edit`}
            >
              Edit event
            </Link>
          </div>
        </div>
      </header>

      <div className="grid gap-6 pt-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.6fr)]">
        <div className="space-y-6">
          <Card className="p-6 sm:p-8">
            <DetailSection title="Editorial">
              <Detail label="Short description" value={event.shortDescription || "Not provided"} />
              <Detail
                label="Long description"
                value={event.longDescription || "Not provided"}
                multiline
              />
            </DetailSection>
          </Card>

          <Card className="p-6 sm:p-8">
            <DetailSection title="Schedule and venue">
              <div className="grid gap-6 sm:grid-cols-2">
                <Detail label="Starts" value={formatDate(event.startAtUtc, event.timeZoneId)} />
                <Detail label="Ends" value={formatDate(event.endAtUtc, event.timeZoneId)} />
                <Detail label="Time zone" value={event.timeZoneId} />
                <Detail label="City" value={event.city} />
                <Detail label="Venue" value={event.venueName} />
                <Detail label="Address" value={event.venueAddress || "Not provided"} />
              </div>
              {event.mapUrl && <ExternalLink href={event.mapUrl} label="Open venue map" />}
            </DetailSection>
          </Card>

          <Card className="p-6 sm:p-8">
            <DetailSection title="External booking">
              <div className="grid gap-6 sm:grid-cols-2">
                <Detail
                  label="Stored booking state"
                  value={<BookingBadge status={event.bookingStatus} />}
                />
                <Detail
                  label="Effective availability"
                  value={<BookingBadge status={event.bookingAvailability} />}
                />
                <Detail
                  label="Public CTA actionable"
                  value={event.isBookingEnabled ? "Yes" : "No"}
                />
                <Detail
                  label="Opens"
                  value={
                    event.bookingOpensAtUtc
                      ? formatDate(event.bookingOpensAtUtc, event.timeZoneId)
                      : "No opening restriction"
                  }
                />
                <Detail
                  label="Closes"
                  value={
                    event.bookingClosesAtUtc
                      ? formatDate(event.bookingClosesAtUtc, event.timeZoneId)
                      : "No closing restriction"
                  }
                />
              </div>
              {event.externalBookingUrl && isSafeBookingUrl(event.externalBookingUrl) && (
                <ExternalLink
                  href={event.externalBookingUrl}
                  label="Open external ticketing page"
                />
              )}
              {event.externalBookingUrl && !isSafeBookingUrl(event.externalBookingUrl) && (
                <p className="mt-6 border-l-2 border-error bg-error/10 px-3 py-2 text-sm text-error">
                  The stored booking URL is not safe HTTPS and will not be exposed publicly.
                </p>
              )}
            </DetailSection>
          </Card>
        </div>

        <aside className="space-y-6" aria-label="Event administration">
          <Card className="p-6">
            <h2 className="font-display text-xl font-bold text-ink">Lifecycle controls</h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Status changes apply immediately and may affect public visibility.
            </p>
            {!hasEligibleCover && (
              <p
                className="mt-4 border-l-2 border-warning bg-warning/10 px-3 py-2 text-sm leading-6 text-warning"
                role="status"
              >
                This event has no eligible cover. It can still be published, but public views will
                use their artwork fallback.
              </p>
            )}
            <div className="mt-6">
              <EventActions
                event={event}
                hasEligibleCover={hasEligibleCover}
                onChanged={setEvent}
                onError={setError}
              />
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="font-display text-xl font-bold text-ink">Placement</h2>
            <dl className="mt-5 space-y-4">
              <Detail label="Featured" value={event.isFeatured ? "Yes" : "No"} />
              <Detail label="Homepage" value={event.showOnHomepage ? "Visible" : "Hidden"} />
            </dl>
            <Link
              className={buttonClasses("secondary", "mt-6 w-full")}
              href={`/dashboard/events/${encodeURIComponent(event.id)}/media`}
            >
              Manage Event Media
            </Link>
          </Card>
          <Card className="p-6">
            <h2 className="font-display text-xl font-bold text-ink">Record history</h2>
            <dl className="mt-5 space-y-4">
              <Detail label="Created" value={formatDate(event.createdAtUtc)} />
              <Detail label="Last updated" value={formatDate(event.updatedAtUtc)} />
            </dl>
          </Card>
        </aside>
      </div>
    </article>
  );
}

function DetailSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section>
      <h2 className="border-b border-line pb-4 font-display text-2xl font-bold text-ink">
        {title}
      </h2>
      <dl className="mt-6 space-y-6">{children}</dl>
    </section>
  );
}

function Detail({
  label,
  multiline = false,
  value,
}: {
  label: string;
  multiline?: boolean;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="font-label text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </dt>
      <dd className={`mt-2 text-sm leading-6 text-ink ${multiline ? "whitespace-pre-line" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      className={buttonClasses("secondary", "mt-6")}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {label}
    </a>
  );
}

function formatDate(value: string, timeZone?: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone,
    }).format(new Date(value));
  } catch {
    return new Date(value).toLocaleString();
  }
}
