"use client";

import type { AdminMediaListItem, MediaListQuery, PagedResponse } from "@the-domain/types";
import { buttonClasses, Card, EmptyState, PaginationControls } from "@the-domain/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { listAdminMedia } from "@/lib/media/admin-media-client";
import { MediaFilters } from "./media-filters";
import { MediaApprovalBadge, mediaTypeLabels, orientationLabels } from "./media-labels";
import { MediaPreview } from "./media-preview";

export function MediaLibrary({
  eventId,
  refreshSignal = 0,
}: {
  eventId?: string;
  refreshSignal?: number;
}) {
  const [query, setQuery] = useState<MediaListQuery>({ pageNumber: 1, pageSize: 20, eventId });
  const [page, setPage] = useState<PagedResponse<AdminMediaListItem> | null>(null);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;
    listAdminMedia(query)
      .then((result) => {
        if (isActive) {
          setPage(result);
          setError("");
        }
      })
      .catch((loadError: unknown) => {
        if (isActive)
          setError(loadError instanceof Error ? loadError.message : "Unable to load media.");
      });
    return () => {
      isActive = false;
    };
  }, [query, refreshKey, refreshSignal]);

  return (
    <div className="space-y-8">
      <MediaFilters initial={query} onApply={setQuery} />
      {error && (
        <p
          className="border-l-2 border-error bg-error/10 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {error}
        </p>
      )}
      {!page && !error && <MediaLoading />}
      {page && page.items.length === 0 && (
        <EmptyState
          title="No media found"
          description="Adjust the filters or upload the first asset for this view."
          action={
            <a className={buttonClasses("primary")} href="#media-upload">
              Upload media
            </a>
          }
        />
      )}
      {page && page.items.length > 0 && (
        <>
          <div className="flex items-center justify-between gap-4">
            <p className="font-label text-xs uppercase tracking-[0.12em] text-ink-muted">
              {page.totalCount} media {page.totalCount === 1 ? "asset" : "assets"}
            </p>
            <button
              className={buttonClasses("ghost", "px-3")}
              onClick={() => setRefreshKey((value) => value + 1)}
              type="button"
            >
              Refresh
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 2xl:grid-cols-4">
            {page.items.map((item, index) => (
              <Link
                aria-label={`View ${mediaTypeLabels[item.mediaType]} uploaded ${formatDate(item.createdAtUtc)}`}
                href={`/dashboard/media/${item.id}${eventId ? `?eventId=${encodeURIComponent(eventId)}` : ""}`}
                key={item.id}
              >
                <Card className="group h-full overflow-hidden transition hover:border-gold focus-within:border-gold">
                  <MediaPreview item={item} priority={index < 4} />
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <MediaApprovalBadge status={item.approvalStatus} />
                    </div>
                    <p className="mt-4 font-label text-[0.6875rem] uppercase tracking-[0.12em] text-ink">
                      {mediaTypeLabels[item.mediaType]} / {orientationLabels[item.orientation]}
                    </p>
                    <p className="mt-2 truncate text-sm text-ink-muted">
                      {item.category || "Uncategorized"}
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">{formatDate(item.createdAtUtc)}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          <PaginationControls
            page={page.pageNumber}
            totalPages={Math.max(1, page.totalPages)}
            onNext={() =>
              setQuery((current) => ({ ...current, pageNumber: (page.pageNumber ?? 1) + 1 }))
            }
            onPrevious={() =>
              setQuery((current) => ({ ...current, pageNumber: Math.max(1, page.pageNumber - 1) }))
            }
          />
        </>
      )}
    </div>
  );
}

function MediaLoading() {
  return (
    <div
      aria-label="Loading media"
      className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 2xl:grid-cols-4"
      role="status"
    >
      {Array.from({ length: 8 }, (_, index) => (
        <div
          className="aspect-[4/5] animate-pulse border border-line bg-surface-raised"
          key={index}
        />
      ))}
      <span className="sr-only">Loading media</span>
    </div>
  );
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}
