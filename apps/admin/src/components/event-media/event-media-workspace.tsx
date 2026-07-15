"use client";

import {
  EventMediaUsage,
  type AdminEventDetails,
  type AdminEventMediaItem,
  type EventMediaUsageValue,
} from "@the-domain/types";
import { buttonClasses, Card, EmptyState } from "@the-domain/ui";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PublicationBadge } from "@/components/events/event-status-badges";
import { MediaApprovalBadge, mediaTypeLabels } from "@/components/media/media-labels";
import { MediaPreview } from "@/components/media/media-preview";
import { MediaUploadQueue } from "@/components/media/media-upload-queue";
import { getAdminEvent } from "@/lib/events/admin-events-client";
import {
  listEventMedia,
  removeEventMediaAssignment,
  reorderEventMedia,
  setEventCover,
  updateEventMediaAssignment,
} from "@/lib/media/admin-media-client";
import { moveEventMediaId, orderItemsByCanonicalIds } from "@/lib/media/event-media-ordering";
import {
  activeEventCover,
  coverEligibilityMessage,
  orderedEventMedia,
} from "@/lib/media/event-media-rules";
import { AssignExistingMedia } from "./assign-existing-media";
import { EventMediaGroup } from "./event-media-group";
import { EventCoverComposer } from "./event-cover-composer";

export function EventMediaWorkspace({
  embedded = false,
  eventDetails,
  eventId,
  initialItems,
  onItemsChange,
}: {
  embedded?: boolean;
  eventDetails?: AdminEventDetails;
  eventId: string;
  initialItems?: AdminEventMediaItem[];
  onItemsChange?: (items: AdminEventMediaItem[]) => void;
}) {
  const [event, setEvent] = useState<AdminEventDetails | null>(eventDetails ?? null);
  const [items, setItems] = useState<AdminEventMediaItem[]>(initialItems ?? []);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(!(eventDetails && initialItems));

  const load = useCallback(async () => {
    const [eventDetails, assignments] = await Promise.all([
      getAdminEvent(eventId),
      listEventMedia(eventId),
    ]);
    setEvent(eventDetails);
    setItems(assignments);
    onItemsChange?.(assignments);
    setError("");
  }, [eventId, onItemsChange]);

  useEffect(() => {
    if (eventDetails && initialItems) {
      return;
    }
    let active = true;
    Promise.all([getAdminEvent(eventId), listEventMedia(eventId)])
      .then(([eventDetails, assignments]) => {
        if (!active) return;
        setEvent(eventDetails);
        setItems(assignments);
        onItemsChange?.(assignments);
        setError("");
      })
      .catch((loadError: unknown) => {
        if (active)
          setError(loadError instanceof Error ? loadError.message : "Unable to load event media.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [eventDetails, eventId, initialItems, onItemsChange]);

  const ordered = useMemo(() => orderedEventMedia(items), [items]);
  const cover = useMemo(() => activeEventCover(items), [items]);
  const invalidCover = useMemo(
    () => ordered.find((item) => item.usage === EventMediaUsage.Cover) ?? null,
    [ordered],
  );
  const assignedMediaIds = useMemo(() => new Set(items.map((item) => item.mediaAssetId)), [items]);

  async function runAction(action: () => Promise<unknown>, successMessage: string) {
    setPending(true);
    setError("");
    setNotice("");
    try {
      await action();
      await load();
      setNotice(successMessage);
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "Unable to update event media.",
      );
    } finally {
      setPending(false);
    }
  }

  function setCover(item: AdminEventMediaItem) {
    void runAction(
      () => setEventCover(eventId, item.id),
      `${item.media.originalFileName} is now the event cover.`,
    );
  }

  function moveItem(id: string, direction: -1 | 1) {
    void persistOrder(moveEventMediaId(items, id, direction));
  }

  async function persistOrder(eventMediaIds: string[]) {
    const canonical = items;
    const optimistic = orderItemsByCanonicalIds(items, eventMediaIds);
    if (optimistic.every((item, index) => item.id === ordered[index]?.id)) return;
    setPending(true);
    setError("");
    setNotice("");
    setItems(optimistic);
    onItemsChange?.(optimistic);
    try {
      await reorderEventMedia(eventId, { eventMediaIds });
      await load();
      setNotice("Event media order saved.");
    } catch (actionError) {
      setItems(canonical);
      onItemsChange?.(canonical);
      try {
        await load();
      } catch {
        // The pre-move canonical state remains available when refresh is also unavailable.
      }
      setError(
        actionError instanceof Error ? actionError.message : "Unable to save event media order.",
      );
    } finally {
      setPending(false);
    }
  }

  function changeUsage(item: AdminEventMediaItem, usage: EventMediaUsageValue) {
    void runAction(
      () =>
        updateEventMediaAssignment(eventId, item.id, {
          usage,
          sortOrder: item.sortOrder,
          isFeatured: item.isFeatured,
        }),
      `${item.media.originalFileName} placement updated.`,
    );
  }

  function remove(item: AdminEventMediaItem) {
    const isCover = item.id === cover?.id || item.usage === EventMediaUsage.Cover;
    const message = isCover
      ? "Remove the active cover from this event? The event will have no public cover until another approved image is selected. The library asset will remain available."
      : "Remove this media from the event? The reusable library asset and Cloudinary file will remain available.";
    if (!window.confirm(message)) return;
    void runAction(
      () => removeEventMediaAssignment(eventId, item.id),
      isCover
        ? "Cover removed. This event now has no public cover."
        : "Media removed from the event. The library asset was preserved.",
    );
  }

  if (error && !event) {
    return (
      <EmptyState
        action={
          <button
            className={buttonClasses("secondary")}
            onClick={() => {
              setLoading(true);
              load()
                .catch((loadError: unknown) =>
                  setError(
                    loadError instanceof Error ? loadError.message : "Unable to load event media.",
                  ),
                )
                .finally(() => setLoading(false));
            }}
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

  if (!event || loading) return <LoadingState />;

  return (
    <div>
      {!embedded && (
        <header className="border-b border-line pb-8">
          <div className="flex flex-wrap gap-2">
            <PublicationBadge status={event.publicationStatus} />
            <span className="border border-line px-2 py-1 font-label text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted">
              {items.length} assigned
            </span>
            <span
              className={`border px-2 py-1 font-label text-[0.6875rem] uppercase tracking-[0.12em] ${cover ? "border-gold text-gold" : "border-error text-error"}`}
            >
              {cover ? "Cover ready" : "No eligible cover"}
            </span>
          </div>
          <div className="mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">
                Event and media workflow
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
                className={buttonClasses("secondary")}
                href={`/dashboard/media?eventId=${encodeURIComponent(event.id)}&upload=1#media-upload`}
              >
                Upload new media
              </Link>
            </div>
          </div>
        </header>
      )}

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

      <div className="space-y-14 pt-10">
        {embedded && (
          <section aria-labelledby="wizard-media-upload-title">
            <h3 className="font-display text-2xl font-bold text-ink" id="wizard-media-upload-title">
              Upload new media
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-muted">
              Uploads remain reusable library assets. Wizard assignment retries never upload the
              same file twice.
            </p>
            <div className="mt-6">
              <MediaUploadQueue
                deferEventAssignment
                eventId={eventId}
                lockEvent
                onCompleted={() => void load()}
              />
            </div>
          </section>
        )}
        <CoverPanel
          cover={cover}
          invalidCover={cover ? null : invalidCover}
          onRemove={remove}
          pending={pending}
        />

        <EventCoverComposer
          cover={cover}
          eventId={eventId}
          key={cover?.id ?? "no-cover"}
          onSaved={() => void load()}
        />

        <EventMediaGroup
          coverId={cover?.id ?? null}
          items={items}
          onMove={moveItem}
          onReorder={(ids) => void persistOrder(ids)}
          onRemove={remove}
          onSetCover={setCover}
          onUsageChange={changeUsage}
          pending={pending}
        />

        <section aria-labelledby="assign-existing-title">
          <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">Media library</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink" id="assign-existing-title">
            Assign existing media
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-muted">
            The library is global. Assigning links an asset to this event; public gallery visibility
            still requires an Approved asset with Gallery placement.
          </p>
          <div className="mt-6">
            <AssignExistingMedia
              assignedMediaIds={assignedMediaIds}
              disabled={pending}
              eventId={eventId}
              onAssigned={(assignment) => {
                void runAction(
                  async () => assignment,
                  assignment.usage === EventMediaUsage.Cover
                    ? "Media assigned and automatically selected as the first eligible cover."
                    : "Media assigned to the event.",
                );
              }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function CoverPanel({
  cover,
  invalidCover,
  onRemove,
  pending,
}: {
  cover: AdminEventMediaItem | null;
  invalidCover: AdminEventMediaItem | null;
  onRemove: (item: AdminEventMediaItem) => void;
  pending: boolean;
}) {
  const displayed = cover ?? invalidCover;
  return (
    <section aria-labelledby="cover-panel-title">
      <div className="border-b border-line pb-5">
        <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">Event cover</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink" id="cover-panel-title">
          Public event artwork
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-muted">
          This image is used on public event cards, the homepage, event details, and social
          metadata.
        </p>
      </div>

      {!displayed ? (
        <div className="mt-6 border-l-2 border-error bg-error/10 p-6">
          <h3 className="font-display text-xl font-bold text-ink">No event cover selected</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">
            Publishing remains available, but public surfaces will intentionally show their artwork
            fallback until an approved HTTPS image is selected.
          </p>
          <a className={buttonClasses("primary", "mt-5")} href="#media-picker">
            Choose cover media
          </a>
        </div>
      ) : (
        <Card className="mt-6 grid overflow-hidden lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)]">
          <MediaPreview item={displayed.media} presentation={displayed.presentation} priority />
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap gap-2">
              <MediaApprovalBadge status={displayed.media.approvalStatus} />
              <span className="border border-line px-2 py-1 font-label text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted">
                {mediaTypeLabels[displayed.media.mediaType]}
              </span>
              {cover && (
                <span className="border border-gold bg-gold/10 px-2 py-1 font-label text-[0.6875rem] uppercase tracking-[0.12em] text-gold">
                  Active public cover
                </span>
              )}
            </div>
            <h3 className="mt-5 break-words font-display text-2xl font-bold text-ink">
              {displayed.media.caption || displayed.media.originalFileName}
            </h3>
            <p className="mt-2 break-all text-sm text-ink-muted">{displayed.media.fileName}</p>
            {!cover && (
              <p
                className="mt-5 border-l-2 border-error bg-error/10 px-4 py-3 text-sm text-error"
                role="alert"
              >
                {coverEligibilityMessage(displayed.media) ??
                  "This cover assignment is invalid and is not exposed publicly."}
              </p>
            )}
            <div className="mt-7 flex flex-wrap gap-3">
              <a className={buttonClasses("primary")} href="#media-picker">
                Replace cover
              </a>
              <button
                className={buttonClasses("secondary")}
                disabled={pending}
                onClick={() => onRemove(displayed)}
                type="button"
              >
                Remove cover
              </button>
              <Link
                className={buttonClasses("ghost")}
                href={`/dashboard/media/${displayed.mediaAssetId}`}
              >
                Open media details
              </Link>
            </div>
          </div>
        </Card>
      )}
    </section>
  );
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
