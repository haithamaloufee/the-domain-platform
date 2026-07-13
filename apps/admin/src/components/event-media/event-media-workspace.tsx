"use client";

import type { AdminEventDetails, AdminEventMediaItem } from "@the-domain/types";
import { buttonClasses, EmptyState } from "@the-domain/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PublicationBadge } from "@/components/events/event-status-badges";
import { eventMediaUsageValues } from "@/components/media/media-labels";
import { getAdminEvent } from "@/lib/events/admin-events-client";
import {
  listEventMedia,
  removeEventMediaAssignment,
  updateEventMediaAssignment,
} from "@/lib/media/admin-media-client";
import { AssignExistingMedia } from "./assign-existing-media";
import { EventMediaGroup } from "./event-media-group";

export function EventMediaWorkspace({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<AdminEventDetails | null>(null);
  const [items, setItems] = useState<AdminEventMediaItem[]>([]);
  const [baseline, setBaseline] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([getAdminEvent(eventId), listEventMedia(eventId)])
      .then(([eventDetails, assignments]) => {
        if (!active) return;
        setEvent(eventDetails);
        setItems(assignments);
        setBaseline(Object.fromEntries(assignments.map((item) => [item.id, snapshot(item)])));
        setError("");
      })
      .catch((loadError: unknown) => {
        if (active)
          setError(loadError instanceof Error ? loadError.message : "Unable to load event media.");
      });
    return () => {
      active = false;
    };
  }, [eventId, refreshKey]);

  const dirtyItems = items.filter((item) => baseline[item.id] !== snapshot(item));

  function updateItem(
    id: string,
    change: Partial<Pick<AdminEventMediaItem, "usage" | "sortOrder" | "isFeatured">>,
  ) {
    setNotice("");
    setItems((current) => {
      const target = current.find((item) => item.id === id);
      if (!target) return current;
      const nextChange = { ...change };
      if (change.usage !== undefined && change.usage !== target.usage) {
        const existingOrders = current
          .filter((item) => item.usage === change.usage && item.id !== id)
          .map((item) => item.sortOrder);
        nextChange.sortOrder = existingOrders.length > 0 ? Math.max(...existingOrders) + 10 : 0;
      }
      return current.map((item) => (item.id === id ? { ...item, ...nextChange } : item));
    });
  }

  function moveItem(id: string, direction: -1 | 1) {
    setNotice("");
    setItems((current) => {
      const target = current.find((item) => item.id === id);
      if (!target) return current;
      const group = current
        .filter((item) => item.usage === target.usage)
        .sort(
          (left, right) =>
            left.sortOrder - right.sortOrder || left.createdAtUtc.localeCompare(right.createdAtUtc),
        );
      const index = group.findIndex((item) => item.id === id);
      const destination = index + direction;
      if (destination < 0 || destination >= group.length) return current;
      const currentItem = group[index];
      const destinationItem = group[destination];
      if (!currentItem || !destinationItem) return current;
      group[index] = destinationItem;
      group[destination] = currentItem;
      const orders = new Map(group.map((item, order) => [item.id, order * 10]));
      return current.map((item) =>
        item.usage === target.usage
          ? { ...item, sortOrder: orders.get(item.id) ?? item.sortOrder }
          : item,
      );
    });
  }

  async function saveChanges() {
    if (dirtyItems.length === 0) return;
    setPending(true);
    setError("");
    setNotice("");
    const savedIds: string[] = [];
    try {
      for (const item of dirtyItems) {
        await updateEventMediaAssignment(eventId, item.id, {
          usage: item.usage,
          sortOrder: item.sortOrder,
          isFeatured: item.isFeatured,
        });
        savedIds.push(item.id);
      }
      setBaseline(Object.fromEntries(items.map((item) => [item.id, snapshot(item)])));
      setNotice(
        `${savedIds.length} ${savedIds.length === 1 ? "assignment" : "assignments"} saved.`,
      );
    } catch (saveError) {
      setBaseline((current) => ({
        ...current,
        ...Object.fromEntries(
          items
            .filter((item) => savedIds.includes(item.id))
            .map((item) => [item.id, snapshot(item)]),
        ),
      }));
      setError(
        `${savedIds.length > 0 ? "Some earlier changes were saved. " : ""}${saveError instanceof Error ? saveError.message : "Unable to save event media."}`,
      );
    } finally {
      setPending(false);
    }
  }

  async function remove(item: AdminEventMediaItem) {
    if (
      !window.confirm(
        "Remove this assignment from the event? The reusable media asset and Cloudinary file will remain available.",
      )
    )
      return;
    setPending(true);
    setError("");
    setNotice("");
    try {
      await removeEventMediaAssignment(eventId, item.id);
      setItems((current) => current.filter((candidate) => candidate.id !== item.id));
      setBaseline((current) => {
        const next = { ...current };
        delete next[item.id];
        return next;
      });
      setNotice("Assignment removed. The media asset was not deleted.");
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Unable to remove assignment.");
    } finally {
      setPending(false);
    }
  }

  if (error && !event) {
    return (
      <EmptyState
        action={
          <button
            className={buttonClasses("secondary")}
            onClick={() => setRefreshKey((value) => value + 1)}
            type="button"
          >
            Try again
          </button>
        }
        description={error}
        title="Event media could not be loaded"
      />
    );
  }

  if (!event) return <LoadingState />;

  return (
    <div>
      <header className="border-b border-line pb-8">
        <div className="flex flex-wrap gap-2">
          <PublicationBadge status={event.publicationStatus} />
          <span className="border border-line px-2 py-1 font-label text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted">
            {items.length} assigned
          </span>
        </div>
        <div className="mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">
              Event gallery management
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.03em] text-ink sm:text-6xl">
              {event.title}
            </h1>
            <p className="mt-3 text-sm text-ink-muted">
              /{event.slug} / {formatDate(event.startAtUtc, event.timeZoneId)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className={buttonClasses("ghost")} href={`/dashboard/events/${event.id}`}>
              Back to event
            </Link>
            <Link
              className={buttonClasses("primary")}
              href={`/dashboard/media?eventId=${encodeURIComponent(event.id)}&upload=1#media-upload`}
            >
              Upload media for this event
            </Link>
          </div>
        </div>
      </header>

      {(error || notice) && (
        <div aria-live="polite" className="pt-6">
          {error && (
            <p
              className="border-l-2 border-error bg-error/10 px-4 py-3 text-sm text-error"
              role="alert"
            >
              {error}
            </p>
          )}
          {notice && (
            <p
              className="border-l-2 border-gold bg-gold/10 px-4 py-3 text-sm text-ink"
              role="status"
            >
              {notice}
            </p>
          )}
        </div>
      )}

      {items.length === 0 && (
        <div className="pt-8">
          <EmptyState
            description="Assign an approved asset below or upload new media directly to this event."
            title="This event has no assigned media"
          />
        </div>
      )}

      <div className="sticky top-0 z-10 mt-8 flex flex-col justify-between gap-4 border border-line bg-background/95 p-4 backdrop-blur sm:flex-row sm:items-center">
        <p className="text-sm text-ink-muted">
          {dirtyItems.length > 0
            ? `${dirtyItems.length} unsaved ${dirtyItems.length === 1 ? "assignment" : "assignments"}`
            : "All assignment changes are saved."}
        </p>
        <button
          className={buttonClasses("primary")}
          disabled={pending || dirtyItems.length === 0}
          onClick={() => void saveChanges()}
          type="button"
        >
          {pending ? "Saving..." : "Save assignment changes"}
        </button>
      </div>

      <div className="space-y-12 pt-10">
        {eventMediaUsageValues.map((usage) => (
          <EventMediaGroup
            items={items.filter((item) => item.usage === usage)}
            key={usage}
            onMove={moveItem}
            onRemove={(item) => void remove(item)}
            onUpdate={updateItem}
            pending={pending}
            usage={usage}
          />
        ))}
      </div>

      <section aria-labelledby="assign-existing-title" className="pt-16">
        <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">Reusable assets</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink" id="assign-existing-title">
          Assign existing media
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-muted">
          Search the approved global library. Assigning creates a relationship for this event; it
          does not duplicate the asset.
        </p>
        <div className="mt-6">
          <AssignExistingMedia
            disabled={dirtyItems.length > 0 || pending}
            eventId={eventId}
            onAssigned={() => setRefreshKey((value) => value + 1)}
          />
        </div>
      </section>
    </div>
  );
}

function snapshot(item: AdminEventMediaItem): string {
  return `${item.usage}:${item.sortOrder}:${item.isFeatured}`;
}

function formatDate(value: string, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone }).format(
      new Date(value),
    );
  } catch {
    return new Date(value).toLocaleDateString();
  }
}

function LoadingState() {
  return (
    <div className="space-y-6" role="status">
      <div className="h-52 animate-pulse border border-line bg-surface-raised" />
      <div className="h-96 animate-pulse border border-line bg-surface-raised" />
      <span className="sr-only">Loading event media management</span>
    </div>
  );
}
