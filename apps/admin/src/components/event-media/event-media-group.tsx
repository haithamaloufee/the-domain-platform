"use client";

import type { AdminEventMediaItem, EventMediaUsageValue } from "@the-domain/types";
import { buttonClasses, Card, Input, Select } from "@the-domain/ui";
import Link from "next/link";
import {
  MediaApprovalBadge,
  eventMediaUsageLabels,
  eventMediaUsageValues,
  mediaTypeLabels,
} from "@/components/media/media-labels";
import { MediaPreview } from "@/components/media/media-preview";

export function EventMediaGroup({
  items,
  onMove,
  onRemove,
  onUpdate,
  pending,
  usage,
}: {
  items: AdminEventMediaItem[];
  onMove: (id: string, direction: -1 | 1) => void;
  onRemove: (item: AdminEventMediaItem) => void;
  onUpdate: (
    id: string,
    change: Partial<Pick<AdminEventMediaItem, "usage" | "sortOrder" | "isFeatured">>,
  ) => void;
  pending: boolean;
  usage: EventMediaUsageValue;
}) {
  const ordered = [...items].sort(
    (left, right) =>
      left.sortOrder - right.sortOrder || left.createdAtUtc.localeCompare(right.createdAtUtc),
  );

  return (
    <section aria-labelledby={`usage-${usage}`} className="border-t border-line pt-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">Usage group</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-ink" id={`usage-${usage}`}>
            {eventMediaUsageLabels[usage]}
          </h2>
        </div>
        <span className="font-label text-xs uppercase tracking-[0.12em] text-ink-muted">
          {ordered.length} {ordered.length === 1 ? "item" : "items"}
        </span>
      </div>

      {ordered.length === 0 ? (
        <div className="mt-5 border border-dashed border-line bg-surface px-5 py-8 text-sm text-ink-muted">
          No media is assigned to {eventMediaUsageLabels[usage].toLowerCase()}.
        </div>
      ) : (
        <ol className="mt-5 space-y-4">
          {ordered.map((item, index) => (
            <li key={item.id}>
              <Card className="grid overflow-hidden md:grid-cols-[12rem_minmax(0,1fr)]">
                <MediaPreview item={item.media} />
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <MediaApprovalBadge status={item.media.approvalStatus} />
                        {item.isFeatured && (
                          <span className="border border-gold px-2 py-1 font-label text-[0.6875rem] uppercase tracking-[0.12em] text-gold">
                            Featured
                          </span>
                        )}
                      </div>
                      <h3 className="mt-4 break-words font-display text-lg font-bold text-ink">
                        {item.media.caption || item.media.originalFileName}
                      </h3>
                      <p className="mt-1 text-xs text-ink-muted">
                        {mediaTypeLabels[item.media.mediaType]} / Assignment {item.id.slice(0, 8)}
                      </p>
                    </div>
                    <Link
                      className={buttonClasses("ghost", "shrink-0 px-3")}
                      href={`/dashboard/media/${item.mediaAssetId}`}
                    >
                      View asset
                    </Link>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <Field label="Usage">
                      <Select
                        disabled={pending}
                        onChange={(event) =>
                          onUpdate(item.id, {
                            usage: Number(event.target.value) as EventMediaUsageValue,
                          })
                        }
                        value={item.usage}
                      >
                        {eventMediaUsageValues.map((value) => (
                          <option key={value} value={value}>
                            {eventMediaUsageLabels[value]}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Sort order">
                      <Input
                        disabled={pending}
                        min={0}
                        onChange={(event) =>
                          onUpdate(item.id, {
                            sortOrder: Math.max(0, Number(event.target.value) || 0),
                          })
                        }
                        type="number"
                        value={item.sortOrder}
                      />
                    </Field>
                    <label className="flex min-h-12 items-center gap-3 self-end border border-line bg-surface px-4 py-3 text-sm text-ink">
                      <input
                        checked={item.isFeatured}
                        className="size-4 accent-[var(--td-color-gold)]"
                        disabled={pending}
                        onChange={(event) =>
                          onUpdate(item.id, { isFeatured: event.target.checked })
                        }
                        type="checkbox"
                      />
                      Featured in this usage
                    </label>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-5">
                    <button
                      className={buttonClasses("ghost", "px-3")}
                      disabled={pending || index === 0}
                      onClick={() => onMove(item.id, -1)}
                      type="button"
                    >
                      Move up
                    </button>
                    <button
                      className={buttonClasses("ghost", "px-3")}
                      disabled={pending || index === ordered.length - 1}
                      onClick={() => onMove(item.id, 1)}
                      type="button"
                    >
                      Move down
                    </button>
                    <button
                      className={buttonClasses("ghost", "px-3 sm:ml-auto")}
                      disabled={pending}
                      onClick={() => onRemove(item)}
                      type="button"
                    >
                      Remove assignment
                    </button>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label>
      <span className="font-label text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}
