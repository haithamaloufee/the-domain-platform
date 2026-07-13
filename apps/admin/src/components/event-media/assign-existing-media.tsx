"use client";

import {
  EventMediaUsage,
  type AdminMediaListItem,
  type EventMediaUsageValue,
  type PagedResponse,
} from "@the-domain/types";
import { buttonClasses, Card, Input, PaginationControls, Select } from "@the-domain/ui";
import { useEffect, useState } from "react";
import {
  eventMediaUsageLabels,
  eventMediaUsageValues,
  mediaTypeLabels,
} from "@/components/media/media-labels";
import { MediaPreview } from "@/components/media/media-preview";
import { assignMediaToEvent, listAdminMedia } from "@/lib/media/admin-media-client";

export function AssignExistingMedia({
  disabled = false,
  eventId,
  onAssigned,
}: {
  disabled?: boolean;
  eventId: string;
  onAssigned: () => void;
}) {
  const [pageNumber, setPageNumber] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState<PagedResponse<AdminMediaListItem> | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [usage, setUsage] = useState<EventMediaUsageValue>(EventMediaUsage.Gallery);
  const [sortOrder, setSortOrder] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listAdminMedia({
      approvalStatus: "Approved",
      pageNumber,
      pageSize: 8,
      search,
    })
      .then((result) => {
        if (active) {
          setPage(result);
          setError("");
        }
      })
      .catch((loadError: unknown) => {
        if (active)
          setError(
            loadError instanceof Error ? loadError.message : "Unable to load approved media.",
          );
      });
    return () => {
      active = false;
    };
  }, [pageNumber, search]);

  async function assign() {
    if (!selectedId) {
      setError("Choose an approved media asset first.");
      return;
    }
    setPending(true);
    setError("");
    try {
      await assignMediaToEvent(eventId, {
        mediaAssetId: selectedId,
        usage,
        sortOrder,
        isFeatured,
      });
      setSelectedId("");
      onAssigned();
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
    <Card className="p-5 sm:p-7">
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          setPageNumber(1);
          setSearch(searchInput.trim());
        }}
      >
        <label className="flex-1">
          <span className="font-label text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted">
            Search approved media
          </span>
          <Input
            className="mt-1"
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Filename or caption"
            value={searchInput}
          />
        </label>
        <button className={buttonClasses("secondary", "self-end")} type="submit">
          Search
        </button>
      </form>

      {error && (
        <p
          className="mt-4 border-l-2 border-error bg-error/10 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {error}
        </p>
      )}

      {disabled && (
        <p className="mt-4 border-l-2 border-gold bg-gold/10 px-4 py-3 text-sm text-ink">
          Save the current assignment changes before adding another asset.
        </p>
      )}

      {!page && !error && (
        <div className="mt-5 h-64 animate-pulse border border-line bg-surface" role="status">
          <span className="sr-only">Loading approved media</span>
        </div>
      )}

      {page && page.items.length === 0 && (
        <p className="mt-5 border border-dashed border-line px-5 py-8 text-sm text-ink-muted">
          No approved media matches this search. Approve an asset in the media library first.
        </p>
      )}

      {page && page.items.length > 0 && (
        <>
          <fieldset className="mt-5">
            <legend className="sr-only">Choose media to assign</legend>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {page.items.map((item) => (
                <label
                  className={`cursor-pointer border bg-surface transition focus-within:outline-2 focus-within:outline-offset-2 ${selectedId === item.id ? "border-gold" : "border-line hover:border-line-strong"}`}
                  key={item.id}
                >
                  <input
                    checked={selectedId === item.id}
                    className="sr-only"
                    name="mediaAssetId"
                    onChange={() => setSelectedId(item.id)}
                    type="radio"
                    value={item.id}
                  />
                  <MediaPreview item={item} />
                  <span className="block p-3 text-xs text-ink">
                    {item.category || mediaTypeLabels[item.mediaType]}
                  </span>
                </label>
              ))}
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

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Usage">
          <Select
            onChange={(event) => setUsage(Number(event.target.value) as EventMediaUsageValue)}
            value={usage}
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
            min={0}
            onChange={(event) => setSortOrder(Math.max(0, Number(event.target.value) || 0))}
            type="number"
            value={sortOrder}
          />
        </Field>
        <label className="flex min-h-12 items-center gap-3 self-end border border-line bg-surface px-4 py-3 text-sm text-ink">
          <input
            checked={isFeatured}
            className="size-4 accent-[var(--td-color-gold)]"
            onChange={(event) => setIsFeatured(event.target.checked)}
            type="checkbox"
          />
          Featured
        </label>
        <button
          className={buttonClasses("primary", "self-end")}
          disabled={disabled || pending || !selectedId}
          onClick={() => void assign()}
          type="button"
        >
          {pending ? "Assigning..." : "Assign selected media"}
        </button>
      </div>
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
