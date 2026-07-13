"use client";

import type { AdminEventDetails } from "@the-domain/types";
import { buttonClasses, Card } from "@the-domain/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminEvent } from "@/lib/events/admin-events-client";
import { MediaLibrary } from "./media-library";
import { MediaUploadQueue } from "./media-upload-queue";

export function MediaWorkspace({ eventId }: { eventId?: string }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [event, setEvent] = useState<AdminEventDetails | null>(null);

  useEffect(() => {
    if (!eventId) return;
    let active = true;
    getAdminEvent(eventId)
      .then((item) => {
        if (active) setEvent(item);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [eventId]);

  return (
    <>
      {eventId && (
        <Card className="mt-8 flex flex-col justify-between gap-5 border-gold/50 p-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">
              Event media context
            </p>
            <p className="mt-2 font-display text-xl font-bold text-ink">
              Managing media for {event?.id === eventId ? event.title : "this event"}
            </p>
          </div>
          <Link
            className={buttonClasses("secondary", "shrink-0")}
            href={`/dashboard/events/${encodeURIComponent(eventId)}/media`}
          >
            Open event gallery manager
          </Link>
        </Card>
      )}
      <section className="pt-8" id="media-upload" aria-labelledby="media-upload-title">
        <h2 className="font-display text-2xl font-bold text-ink" id="media-upload-title">
          Upload media
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          Files move through the authenticated admin gateway to Cloudinary one at a time.
        </p>
        <div className="mt-6">
          <MediaUploadQueue
            eventId={eventId}
            onCompleted={() => setRefreshKey((value) => value + 1)}
          />
        </div>
      </section>
      <section aria-labelledby="media-library-title" className="pt-12">
        <h2 className="mb-6 font-display text-2xl font-bold text-ink" id="media-library-title">
          Stored media
        </h2>
        <MediaLibrary eventId={eventId} refreshSignal={refreshKey} />
      </section>
    </>
  );
}
