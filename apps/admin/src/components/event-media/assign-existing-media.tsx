"use client";

import {
  EventMediaUsage,
  type AdminMediaListItem,
  type EventMediaResponse,
  type EventMediaUsageValue,
  type PagedResponse,
} from "@the-domain/types";
import { buttonClasses, Card, Input, PaginationControls, Select } from "@the-domain/ui";
import { useEffect, useMemo, useState } from "react";
import {
  MediaApprovalBadge,
  eventMediaUsageLabels,
  eventMediaUsageValues,
  mediaTypeLabels,
} from "@/components/media/media-labels";
import { MediaPreview } from "@/components/media/media-preview";
import { assignMediaToEvent, listAdminMedia } from "@/lib/media/admin-media-client";
import { coverEligibilityMessage, isEligibleEventCover } from "@/lib/media/event-media-rules";

const assignmentUsages = eventMediaUsageValues.filter((usage) => usage !== EventMediaUsage.Cover);

export function AssignExistingMedia({
  assignedMediaIds,
  disabled = false,
  eventId,
  onAssigned,
}: {
  assignedMediaIds: ReadonlySet<string>;
  disabled?: boolean;
  eventId: string;
  onAssigned: (assignment: EventMediaResponse) => void;
}) {
  const [pageNumber, setPageNumber] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("");
  const [page, setPage] = useState<PagedResponse<AdminMediaListItem> | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [usage, setUsage] = useState<EventMediaUsageValue>(EventMediaUsage.Gallery);
  const [setAsCover, setSetAsCover] = useState(false);
  const [pending, setPending] = useState(false);
  const [loadedQuery, setLoadedQuery] = useState("");
  const [error, setError] = useState("");
  const queryKey = `${approvalStatus}:${mediaType}:${pageNumber}:${search}`;
  const loading = loadedQuery !== queryKey;

  const selected = useMemo(
    () => page?.items.find((item) => item.id === selectedId) ?? null,
    [page, selectedId],
  );
  const coverWarning = selected ? coverEligibilityMessage(selected) : null;

  useEffect(() => {
    let active = true;
    listAdminMedia({
      approvalStatus,
      mediaType,
      pageNumber,
      pageSize: 8,
      search,
    })
      .then((result) => {
        if (!active) return;
        setPage(result);
        setLoadedQuery(queryKey);
        setError("");
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setLoadedQuery(queryKey);
        setError(loadError instanceof Error ? loadError.message : "Unable to load media.");
      });
    return () => {
      active = false;
    };
  }, [approvalStatus, mediaType, pageNumber, queryKey, search]);

  async function assign() {
    if (!selected) {
      setError("Choose a media asset first.");
      return;
    }
    if (assignedMediaIds.has(selected.id)) {
      setError("This media asset is already assigned to the event.");
      return;
    }
    if (setAsCover && !isEligibleEventCover(selected)) {
      setError(coverWarning ?? "This asset cannot be used as a cover.");
      return;
    }

    setPending(true);
    setError("");
    try {
      const assignment = await assignMediaToEvent(eventId, {
        mediaAssetId: selected.id,
        usage: setAsCover ? EventMediaUsage.Cover : usage,
        sortOrder: 1_000_000,
        isFeatured: false,
      });
      setSelectedId("");
      setSetAsCover(false);
      onAssigned(assignment);
    } catch (assignmentError) {
      setError(
        assignmentError instanceof Error
          ? assignmentError.message
          : "Unable to assign this media asset.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="p-5 sm:p-7" id="media-picker">
      <form
        className="grid gap-4 lg:grid-cols-[minmax(16rem,1fr)_12rem_12rem_auto] lg:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          setPageNumber(1);
          setSearch(searchInput.trim());
        }}
      >
        <Field label="Search library">
          <Input
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Filename, title, or caption"
            value={searchInput}
          />
        </Field>
        <Field label="Media type">
          <Select
            onChange={(event) => {
              setPageNumber(1);
              setMediaType(event.target.value);
            }}
            value={mediaType}
          >
            <option value="">All types</option>
            <option value="Image">Images</option>
            <option value="Video">Videos</option>
          </Select>
        </Field>
        <Field label="Status">
          <Select
            onChange={(event) => {
              setPageNumber(1);
              setApprovalStatus(event.target.value);
            }}
            value={approvalStatus}
          >
            <option value="">All statuses</option>
            <option value="Draft">Draft</option>
            <option value="Approved">Approved</option>
            <option value="Hidden">Hidden</option>
          </Select>
        </Field>
        <button className={buttonClasses("secondary")} disabled={loading} type="submit">
          {loading ? "Loading…" : "Search"}
        </button>
      </form>

      {error && (
        <p className="mt-4 border-l-2 border-error bg-error/10 px-4 py-3 text-sm text-error" role="alert">
          {error}
        </p>
      )}
      {disabled && (
        <p className="mt-4 border-l-2 border-gold bg-gold/10 px-4 py-3 text-sm text-ink">
          Finish the current media action before assigning another asset.
        </p>
      )}

      {loading && (
        <div className="mt-5 h-64 animate-pulse border border-line bg-surface" role="status">
          <span className="sr-only">Loading media library</span>
        </div>
      )}

      {!loading && page && page.items.length === 0 && (
        <p className="mt-5 border border-dashed border-line px-5 py-8 text-sm text-ink-muted">
          No media matches these filters. Adjust the search or upload a new asset.
        </p>
      )}

      {!loading && page && page.items.length > 0 && (
        <>
          <fieldset className="mt-5">
            <legend className="sr-only">Choose media to assign</legend>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {page.items.map((item) => {
                const assigned = assignedMediaIds.has(item.id);
                return (
                  <label
                    className={`relative border bg-surface transition focus-within:outline-2 focus-within:outline-offset-2 ${
                      assigned
                        ? "cursor-not-allowed border-line opacity-55"
                        : selectedId === item.id
                          ? "cursor-pointer border-gold"
                          : "cursor-pointer border-line hover:border-line-strong"
                    }`}
                    key={item.id}
                  >
                    <input
                      checked={selectedId === item.id}
                      className="sr-only"
                      disabled={assigned}
                      name="mediaAssetId"
                      onChange={() => {
                        setSelectedId(item.id);
                        setSetAsCover(false);
                        setError("");
                      }}
                      type="radio"
                      value={item.id}
                    />
                    <MediaPreview item={item} />
                    <span className="block space-y-2 p-3">
                      <span className="flex flex-wrap gap-1">
                        <MediaApprovalBadge status={item.approvalStatus} />
                        <span className="border border-line px-2 py-1 font-label text-[0.625rem] uppercase tracking-[0.1em] text-ink-muted">
                          {mediaTypeLabels[item.mediaType]}
                        </span>
                      </span>
                      <span className="block truncate text-xs text-ink">
                        {item.caption || item.originalFileName}
                      </span>
                      {assigned && (
                        <span className="block font-label text-[0.625rem] uppercase tracking-[0.1em] text-gold">
                          Already assigned
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <div className="mt-5">
            <PaginationControls
              onNext={() => setPageNumber((value) => value + 1)}
              onPrevious={() => setPageNumber((value) => Math.max(1, value - 1))}
              page={page.pageNumber}
              totalPages={Math.max(1, page.totalPages)}
            />
          </div>
        </>
      )}

      <div className="mt-6 grid gap-4 border-t border-line pt-6 lg:grid-cols-[minmax(14rem,1fr)_minmax(18rem,1fr)_auto] lg:items-end">
        <Field label="Event placement">
          <Select
            disabled={!selected || setAsCover}
            onChange={(event) => setUsage(Number(event.target.value) as EventMediaUsageValue)}
            value={usage}
          >
            {assignmentUsages.map((value) => (
              <option key={value} value={value}>
                {eventMediaUsageLabels[value]}
              </option>
            ))}
          </Select>
        </Field>
        <div>
          <label className="flex min-h-12 items-center gap-3 border border-line bg-surface px-4 py-3 text-sm text-ink">
            <input
              checked={setAsCover}
              className="size-4 accent-[var(--td-color-gold)]"
              disabled={!selected || !isEligibleEventCover(selected)}
              onChange={(event) => setSetAsCover(event.target.checked)}
              type="checkbox"
            />
            Assign as the event cover
          </label>
          {selected && coverWarning && (
            <p className="mt-2 text-xs leading-5 text-ink-muted">{coverWarning}</p>
          )}
        </div>
        <button
          className={buttonClasses("primary")}
          disabled={disabled || pending || !selected || assignedMediaIds.has(selected.id)}
          onClick={() => void assign()}
          type="button"
        >
          {pending ? "Assigning…" : "Assign selected media"}
        </button>
      </div>

      <p className="mt-5 text-xs leading-5 text-ink-muted">
        Approved images can become covers. Draft assignments remain private until approval. Hidden
        media and videos cannot be selected as covers. Video assignments continue using poster
        thumbnails.
      </p>
    </Card>
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
