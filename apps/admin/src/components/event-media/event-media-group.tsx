"use client";

import {
  EventMediaUsage,
  MediaApprovalStatus,
  type AdminEventMediaItem,
  type EventMediaUsageValue,
} from "@the-domain/types";
import { buttonClasses, Card, EmptyState, Select } from "@the-domain/ui";
import Link from "next/link";
import {
  MediaApprovalBadge,
  eventMediaUsageLabels,
  eventMediaUsageValues,
  mediaTypeLabels,
} from "@/components/media/media-labels";
import { MediaPreview } from "@/components/media/media-preview";
import {
  coverEligibilityMessage,
  isEligibleEventCover,
  orderedEventMedia,
} from "@/lib/media/event-media-rules";

const nonCoverUsages = eventMediaUsageValues.filter((usage) => usage !== EventMediaUsage.Cover);

export function EventMediaGroup({
  coverId,
  items,
  onMove,
  onRemove,
  onSetCover,
  onUsageChange,
  pending,
}: {
  coverId: string | null;
  items: AdminEventMediaItem[];
  onMove: (id: string, direction: -1 | 1) => void;
  onRemove: (item: AdminEventMediaItem) => void;
  onSetCover: (item: AdminEventMediaItem) => void;
  onUsageChange: (item: AdminEventMediaItem, usage: EventMediaUsageValue) => void;
  pending: boolean;
}) {
  const ordered = orderedEventMedia(items);

  return (
    <section aria-labelledby="assigned-media-title">
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">
            Assigned event media
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink" id="assigned-media-title">
            Event media order
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-muted">
            This order is persisted and used by public event media responses. Gallery visibility
            requires both an Approved status and the Gallery placement.
          </p>
        </div>
        <span className="font-label text-xs uppercase tracking-[0.12em] text-ink-muted">
          {ordered.length} {ordered.length === 1 ? "assignment" : "assignments"}
        </span>
      </div>

      {ordered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            description="Choose media from the global library below. Draft assets can be prepared here but remain private."
            title="No media is assigned to this event"
          />
        </div>
      ) : (
        <ol className="mt-6 space-y-4">
          {ordered.map((item, index) => {
            const isCover = item.id === coverId;
            const eligibilityWarning = coverEligibilityMessage(item.media);
            const publiclyInGallery =
              item.usage === EventMediaUsage.Gallery &&
              item.media.approvalStatus === MediaApprovalStatus.Approved;

            return (
              <li key={item.id}>
                <Card className="grid overflow-hidden md:grid-cols-[11rem_minmax(0,1fr)]">
                  <MediaPreview item={item.media} />
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                          <MediaApprovalBadge status={item.media.approvalStatus} />
                          <span className="border border-line px-2 py-1 font-label text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted">
                            {mediaTypeLabels[item.media.mediaType]}
                          </span>
                          {isCover && (
                            <span className="border border-gold bg-gold/10 px-2 py-1 font-label text-[0.6875rem] uppercase tracking-[0.12em] text-gold">
                              Event cover
                            </span>
                          )}
                          <span className="border border-line px-2 py-1 font-label text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted">
                            {publiclyInGallery ? "Public gallery" : "Not in public gallery"}
                          </span>
                        </div>
                        <h3 className="mt-4 break-words font-display text-lg font-bold text-ink">
                          {item.media.caption || item.media.originalFileName}
                        </h3>
                        <p className="mt-1 break-all text-xs text-ink-muted">
                          {item.media.fileName} / Position {index + 1}
                        </p>
                        {!isCover && eligibilityWarning && (
                          <p className="mt-3 text-xs leading-5 text-ink-muted">
                            {eligibilityWarning}
                          </p>
                        )}
                      </div>
                      <Link
                        className={buttonClasses("ghost", "shrink-0 px-3")}
                        href={`/dashboard/media/${item.mediaAssetId}`}
                      >
                        Open media details
                      </Link>
                    </div>

                    <div className="mt-5 grid gap-4 border-t border-line pt-5 lg:grid-cols-[minmax(12rem,1fr)_auto] lg:items-end">
                      <label>
                        <span className="font-label text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted">
                          Placement
                        </span>
                        <Select
                          className="mt-1"
                          disabled={pending || isCover}
                          onChange={(event) =>
                            onUsageChange(
                              item,
                              Number(event.target.value) as EventMediaUsageValue,
                            )
                          }
                          value={item.usage}
                        >
                          {isCover && <option value={EventMediaUsage.Cover}>Event cover</option>}
                          {nonCoverUsages.map((usage) => (
                            <option key={usage} value={usage}>
                              {eventMediaUsageLabels[usage]}
                            </option>
                          ))}
                        </Select>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className={buttonClasses("secondary", "px-3")}
                          disabled={pending || isCover || !isEligibleEventCover(item.media)}
                          onClick={() => onSetCover(item)}
                          type="button"
                        >
                          {isCover ? "Current cover" : "Set as cover"}
                        </button>
                        <button
                          aria-label={`Move ${item.media.originalFileName} up`}
                          className={buttonClasses("ghost", "px-3")}
                          disabled={pending || index === 0}
                          onClick={() => onMove(item.id, -1)}
                          type="button"
                        >
                          Move up
                        </button>
                        <button
                          aria-label={`Move ${item.media.originalFileName} down`}
                          className={buttonClasses("ghost", "px-3")}
                          disabled={pending || index === ordered.length - 1}
                          onClick={() => onMove(item.id, 1)}
                          type="button"
                        >
                          Move down
                        </button>
                        <button
                          className={buttonClasses("ghost", "px-3")}
                          disabled={pending}
                          onClick={() => onRemove(item)}
                          type="button"
                        >
                          Remove from event
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
