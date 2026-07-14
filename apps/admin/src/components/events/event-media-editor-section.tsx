"use client";

import type { AdminEventMediaItem } from "@the-domain/types";
import { buttonClasses, Card } from "@the-domain/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MediaApprovalBadge } from "@/components/media/media-labels";
import { MediaPreview } from "@/components/media/media-preview";
import { listEventMedia } from "@/lib/media/admin-media-client";
import { activeEventCover } from "@/lib/media/event-media-rules";

export function EventMediaEditorSection({ eventId }: { eventId: string }) {
  const [cover, setCover] = useState<AdminEventMediaItem | null>(null);
  const [count, setCount] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listEventMedia(eventId)
      .then((items) => {
        if (!active) return;
        setCover(activeEventCover(items));
        setCount(items.length);
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
  }, [eventId]);

  return (
    <Card className="p-6 sm:p-8">
      <section aria-labelledby="event-media-editor-title">
        <div className="border-b border-line pb-5">
          <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">Event media</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-ink" id="event-media-editor-title">
            Cover and assigned media
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-muted">
            Manage the public cover, library assignments, gallery placement, and media order in the
            dedicated workflow. Media actions persist independently and do not discard this form.
          </p>
        </div>

        {loading ? (
          <div className="mt-6 h-40 animate-pulse border border-line bg-surface" role="status">
            <span className="sr-only">Loading current event cover</span>
          </div>
        ) : error ? (
          <p className="mt-6 border-l-2 border-error bg-error/10 px-4 py-3 text-sm text-error" role="alert">
            {error}
          </p>
        ) : cover ? (
          <div className="mt-6 grid overflow-hidden border border-line bg-surface md:grid-cols-[9rem_minmax(0,1fr)]">
            <MediaPreview item={cover.media} />
            <div className="p-5">
              <div className="flex flex-wrap gap-2">
                <MediaApprovalBadge status={cover.media.approvalStatus} />
                <span className="border border-gold px-2 py-1 font-label text-[0.6875rem] uppercase tracking-[0.12em] text-gold">
                  Current cover
                </span>
              </div>
              <p className="mt-4 break-words font-display text-lg font-bold text-ink">
                {cover.media.caption || cover.media.originalFileName}
              </p>
              <p className="mt-2 text-sm text-ink-muted">{count} assigned media records</p>
            </div>
          </div>
        ) : (
          <div className="mt-6 border-l-2 border-error bg-error/10 px-5 py-4">
            <p className="font-display text-lg font-bold text-ink">No eligible cover selected</p>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Public event cards and pages will show their intentional artwork fallback.
            </p>
          </div>
        )}

        <Link
          className={buttonClasses("primary", "mt-6")}
          href={`/dashboard/events/${encodeURIComponent(eventId)}/media`}
        >
          Manage event media
        </Link>
      </section>
    </Card>
  );
}
