"use client";

import type { AdminEventListItem } from "@the-domain/types";
import { buttonClasses, Card, EmptyState } from "@the-domain/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { listAdminEvents } from "@/lib/events/admin-events-client";
import { EventActions } from "./event-actions";
import { DisplayBadge, PublicationBadge } from "./event-status-badges";

export function EventsList() {
  const [events, setEvents] = useState<AdminEventListItem[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  async function loadEvents() {
    setState("loading");
    setError("");
    try {
      setEvents(await listAdminEvents());
      setState("ready");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load events.");
      setState("error");
    }
  }

  useEffect(() => {
    let isActive = true;
    listAdminEvents()
      .then((items) => {
        if (!isActive) return;
        setEvents(items);
        setState("ready");
      })
      .catch((loadError: unknown) => {
        if (!isActive) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load events.");
        setState("error");
      });
    return () => {
      isActive = false;
    };
  }, []);

  function replaceEvent(updated: AdminEventListItem) {
    setEvents((current) => current.map((event) => (event.id === updated.id ? updated : event)));
  }

  if (state === "loading") return <EventsLoading />;

  if (state === "error") {
    return (
      <EmptyState
        title="Events could not be loaded"
        description={error}
        action={
          <button
            className={buttonClasses("secondary")}
            onClick={() => void loadEvents()}
            type="button"
          >
            Try again
          </button>
        }
      />
    );
  }

  if (events.length === 0) {
    return (
      <EmptyState
        title="No events yet"
        description="Create the first event record. It will remain a draft until you publish it."
        action={
          <Link className={buttonClasses()} href="/dashboard/events/new">
            Create event
          </Link>
        }
      />
    );
  }

  return (
    <div>
      {error && (
        <p
          className="mb-4 border-l-2 border-error bg-error/10 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {error}
        </p>
      )}
      <div className="grid gap-4 lg:hidden">
        {events.map((event) => (
          <Card className="p-5" key={event.id}>
            <div className="flex flex-wrap gap-2">
              <PublicationBadge status={event.publicationStatus} />
              <DisplayBadge status={event.displayStatus} />
            </div>
            <h2 className="mt-5 font-display text-2xl font-bold text-ink">{event.title}</h2>
            <p className="mt-1 font-label text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted">
              /{event.slug}
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-ink-muted">Starts</dt>
                <dd className="mt-1 text-ink">{formatEventDate(event)}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Location</dt>
                <dd className="mt-1 text-ink">
                  {event.venueName}, {event.city}
                </dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Link
                className={buttonClasses("secondary", "min-h-11 px-3 text-[0.625rem]")}
                href={`/dashboard/events/${event.id}`}
              >
                View
              </Link>
              <Link
                className={buttonClasses("ghost", "min-h-11 px-3 text-[0.625rem]")}
                href={`/dashboard/events/${event.id}/edit`}
              >
                Edit
              </Link>
              <EventActions event={event} onChanged={replaceEvent} onError={setError} />
            </div>
          </Card>
        ))}
      </div>

      <div className="hidden overflow-x-auto border border-line bg-surface-raised lg:block">
        <table className="w-full min-w-[68rem] border-collapse text-left">
          <thead className="border-b border-line bg-surface">
            <tr className="font-label text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted">
              <th className="px-5 py-4 font-semibold">Event</th>
              <th className="px-5 py-4 font-semibold">Date</th>
              <th className="px-5 py-4 font-semibold">Location</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold">Placement</th>
              <th className="px-5 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr className="border-b border-line/70 align-top last:border-b-0" key={event.id}>
                <td className="px-5 py-5">
                  <Link
                    className="font-display text-lg font-bold text-ink hover:text-gold"
                    href={`/dashboard/events/${event.id}`}
                  >
                    {event.title}
                  </Link>
                  <span className="mt-1 block text-xs text-ink-muted">/{event.slug}</span>
                </td>
                <td className="px-5 py-5 text-sm text-ink">{formatEventDate(event)}</td>
                <td className="px-5 py-5 text-sm text-ink">
                  <span className="block">{event.venueName}</span>
                  <span className="mt-1 block text-ink-muted">{event.city}</span>
                </td>
                <td className="px-5 py-5">
                  <div className="flex flex-col items-start gap-2">
                    <PublicationBadge status={event.publicationStatus} />
                    <DisplayBadge status={event.displayStatus} />
                  </div>
                </td>
                <td className="px-5 py-5 text-sm text-ink-muted">
                  {event.isFeatured ? "Featured" : "Standard"}
                  <span className="mt-1 block">
                    {event.showOnHomepage ? "Homepage" : "Not on homepage"}
                  </span>
                </td>
                <td className="px-5 py-5">
                  <div className="mb-2 flex gap-2">
                    <Link
                      className={buttonClasses("secondary", "min-h-11 px-3 text-[0.625rem]")}
                      href={`/dashboard/events/${event.id}`}
                    >
                      View
                    </Link>
                    <Link
                      className={buttonClasses("ghost", "min-h-11 px-3 text-[0.625rem]")}
                      href={`/dashboard/events/${event.id}/edit`}
                    >
                      Edit
                    </Link>
                  </div>
                  <EventActions event={event} onChanged={replaceEvent} onError={setError} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EventsLoading() {
  return (
    <div aria-label="Loading events" className="grid gap-4" role="status">
      {[0, 1, 2].map((item) => (
        <div className="h-32 animate-pulse border border-line bg-surface-raised" key={item} />
      ))}
      <span className="sr-only">Loading events</span>
    </div>
  );
}

function formatEventDate(event: AdminEventListItem): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: event.timeZoneId,
    }).format(new Date(event.startAtUtc));
  } catch {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(event.startAtUtc),
    );
  }
}
