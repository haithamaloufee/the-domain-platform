"use client";

import { buttonClasses, EmptyState } from "@the-domain/ui";
import { useEffect, useState } from "react";
import type { AdminEventDetails } from "@the-domain/types";
import { getAdminEvent } from "@/lib/events/admin-events-client";
import { EventForm } from "./event-form";

export function EditEventScreen({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<AdminEventDetails | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      setEvent(await getAdminEvent(eventId));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load this event.");
    }
  }

  useEffect(() => {
    let isActive = true;
    getAdminEvent(eventId)
      .then((item) => {
        if (isActive) setEvent(item);
      })
      .catch((loadError: unknown) => {
        if (isActive)
          setError(loadError instanceof Error ? loadError.message : "Unable to load this event.");
      });
    return () => {
      isActive = false;
    };
  }, [eventId]);

  if (error)
    return (
      <EmptyState
        title="Event could not be loaded"
        description={error}
        action={
          <button className={buttonClasses("secondary")} onClick={() => void load()} type="button">
            Try again
          </button>
        }
      />
    );
  if (!event)
    return (
      <div className="h-80 animate-pulse border border-line bg-surface-raised" role="status">
        <span className="sr-only">Loading event form</span>
      </div>
    );
  return <EventForm event={event} />;
}
