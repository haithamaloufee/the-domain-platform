"use client";

import {
  EventMediaUsage,
  type AdminEventListItem,
  type EventMediaResponse,
  type EventMediaUsageValue,
} from "@the-domain/types";
import { buttonClasses, Input, Select } from "@the-domain/ui";
import { useEffect, useState } from "react";
import { listAdminEvents } from "@/lib/events/admin-events-client";
import { assignMediaToEvent, removeEventMediaAssignment } from "@/lib/media/admin-media-client";

const usageLabels: Record<EventMediaUsageValue, string> = {
  [EventMediaUsage.Hero]: "Hero",
  [EventMediaUsage.Cover]: "Cover",
  [EventMediaUsage.Poster]: "Poster",
  [EventMediaUsage.Gallery]: "Gallery",
  [EventMediaUsage.Thumbnail]: "Thumbnail",
  [EventMediaUsage.HomepagePreview]: "Homepage preview",
  [EventMediaUsage.PreviousEventPreview]: "Previous event preview",
};

export function MediaAssignmentForm({ mediaId }: { mediaId: string }) {
  const [events, setEvents] = useState<AdminEventListItem[]>([]);
  const [eventId, setEventId] = useState("");
  const [usage, setUsage] = useState<EventMediaUsageValue>(EventMediaUsage.Gallery);
  const [sortOrder, setSortOrder] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [assignments, setAssignments] = useState<EventMediaResponse[]>([]);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    let isActive = true;
    listAdminEvents()
      .then((items) => {
        if (isActive) setEvents(items);
      })
      .catch(() => {
        if (isActive) setError("Events could not be loaded for assignment.");
      });
    return () => {
      isActive = false;
    };
  }, []);

  async function assign() {
    if (!eventId) {
      setError("Choose an event first.");
      return;
    }
    setIsPending(true);
    setError("");
    try {
      const assignment = await assignMediaToEvent(eventId, {
        mediaAssetId: mediaId,
        usage,
        sortOrder,
        isFeatured,
      });
      setAssignments((current) => [...current, assignment]);
    } catch (assignmentError) {
      setError(
        assignmentError instanceof Error ? assignmentError.message : "Unable to assign media.",
      );
    } finally {
      setIsPending(false);
    }
  }

  async function remove(assignment: EventMediaResponse) {
    if (
      !window.confirm("Remove this event assignment? The media asset itself will remain available.")
    )
      return;
    setIsPending(true);
    setError("");
    try {
      await removeEventMediaAssignment(assignment.eventId, assignment.id);
      setAssignments((current) => current.filter((item) => item.id !== assignment.id));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Unable to remove assignment.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Event">
          <Select onChange={(event) => setEventId(event.target.value)} value={eventId}>
            <option value="">Choose an event</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Usage">
          <Select
            onChange={(event) => setUsage(Number(event.target.value) as EventMediaUsageValue)}
            value={usage}
          >
            {Object.entries(usageLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Sort order">
          <Input
            min={0}
            onChange={(event) => setSortOrder(Number(event.target.value))}
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
          Featured in this usage
        </label>
      </div>
      {error && (
        <p className="mt-4 text-sm text-error" role="alert">
          {error}
        </p>
      )}
      <button
        className={buttonClasses("secondary", "mt-5")}
        disabled={isPending}
        onClick={() => void assign()}
        type="button"
      >
        {isPending ? "Working..." : "Assign to event"}
      </button>
      {assignments.length > 0 && (
        <ul className="mt-6 divide-y divide-line border border-line">
          {assignments.map((assignment) => (
            <li
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              key={assignment.id}
            >
              <div>
                <p className="text-sm text-ink">Assigned as {usageLabels[assignment.usage]}</p>
                <p className="mt-1 text-xs text-ink-muted">
                  Sort {assignment.sortOrder}
                  {assignment.isFeatured ? " / Featured" : ""}
                </p>
              </div>
              <button
                className={buttonClasses("ghost", "px-3")}
                disabled={isPending}
                onClick={() => void remove(assignment)}
                type="button"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs leading-5 text-ink-muted">
        Existing assignments are filtered in the library by event. Full ordering and assignment
        history are reserved for the event gallery manager.
      </p>
    </div>
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
