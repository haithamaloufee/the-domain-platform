"use client";

import { buttonClasses, Input, Select } from "@the-domain/ui";
import { useState } from "react";
import type { MediaListQuery } from "@the-domain/types";

export function MediaFilters({
  initial,
  onApply,
}: {
  initial: MediaListQuery;
  onApply: (query: MediaListQuery) => void;
}) {
  const [values, setValues] = useState(initial);
  return (
    <form
      className="grid gap-4 border border-line bg-surface-raised p-5 md:grid-cols-2 xl:grid-cols-6"
      onSubmit={(event) => {
        event.preventDefault();
        onApply({ ...values, pageNumber: 1 });
      }}
    >
      <FilterField className="md:col-span-2 xl:col-span-2" label="Search">
        <Input
          aria-label="Search media"
          onChange={(event) => setValues((current) => ({ ...current, search: event.target.value }))}
          placeholder="Filename or caption"
          value={values.search ?? ""}
        />
      </FilterField>
      <FilterField label="Type">
        <Select
          aria-label="Media type"
          onChange={(event) =>
            setValues((current) => ({ ...current, mediaType: event.target.value }))
          }
          value={values.mediaType ?? ""}
        >
          <option value="">All types</option>
          <option value="Image">Images</option>
          <option value="Video">Videos</option>
        </Select>
      </FilterField>
      <FilterField label="Status">
        <Select
          aria-label="Approval status"
          onChange={(event) =>
            setValues((current) => ({ ...current, approvalStatus: event.target.value }))
          }
          value={values.approvalStatus ?? ""}
        >
          <option value="">All statuses</option>
          <option value="Draft">Draft</option>
          <option value="Approved">Approved</option>
          <option value="Hidden">Hidden</option>
        </Select>
      </FilterField>
      <FilterField label="Orientation">
        <Select
          aria-label="Orientation"
          onChange={(event) =>
            setValues((current) => ({ ...current, orientation: event.target.value }))
          }
          value={values.orientation ?? ""}
        >
          <option value="">All orientations</option>
          <option value="Portrait">Portrait</option>
          <option value="Landscape">Landscape</option>
          <option value="Square">Square</option>
          <option value="Unknown">Unknown</option>
        </Select>
      </FilterField>
      <FilterField label="Category">
        <Input
          aria-label="Category"
          onChange={(event) =>
            setValues((current) => ({ ...current, category: event.target.value }))
          }
          value={values.category ?? ""}
        />
      </FilterField>
      {values.eventId && (
        <p className="md:col-span-2 xl:col-span-4 self-end text-sm text-ink-muted">
          Filtered to event <span className="text-ink">{values.eventId}</span>
        </p>
      )}
      <div className="flex items-end gap-2 md:col-span-2 xl:col-span-2 xl:justify-end">
        <button className={buttonClasses("primary")} type="submit">
          Apply filters
        </button>
        <button
          className={buttonClasses("ghost")}
          onClick={() => {
            const reset = values.eventId
              ? { eventId: values.eventId, pageNumber: 1, pageSize: 20 }
              : { pageNumber: 1, pageSize: 20 };
            setValues(reset);
            onApply(reset);
          }}
          type="button"
        >
          Reset
        </button>
      </div>
    </form>
  );
}

function FilterField({
  children,
  className = "",
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <label className={className}>
      <span className="font-label text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}
