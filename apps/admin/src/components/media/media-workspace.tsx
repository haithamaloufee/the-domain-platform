"use client";

import { useState } from "react";
import { MediaLibrary } from "./media-library";
import { MediaUploadQueue } from "./media-upload-queue";

export function MediaWorkspace({ eventId }: { eventId?: string }) {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <>
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
