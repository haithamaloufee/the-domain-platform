"use client";

import { buttonClasses } from "@the-domain/ui";
import { useState } from "react";

export function VenueFilm({ source, poster }: { source: string; poster?: string | null }) {
  const [playing, setPlaying] = useState(false);
  return (
    <section aria-label="The Domain on film" className="border-y border-line bg-surface">
      <div className="mx-auto grid max-w-[90rem] items-center gap-8 px-gutter py-12 md:grid-cols-[1fr_minmax(12rem,22rem)] md:py-16">
        <div>
          <h2 className="type-section-heading">Inside The Domain</h2>
          <p className="mt-4 max-w-md text-ink-muted">
            A look inside the room and the people who bring it to life.
          </p>
          {!playing && (
            <button className={buttonClasses("secondary", "mt-6")} onClick={() => setPlaying(true)}>
              Play the film{" "}
              <span aria-hidden="true" className="ml-3">
                ▶
              </span>
            </button>
          )}
        </div>
        {playing || poster ? (
          <video
            aria-label="The Domain venue film"
            autoPlay={playing}
            className="mx-auto max-h-[32rem] w-full bg-canvas object-contain"
            controls={playing}
            playsInline
            poster={poster ?? undefined}
            preload="none"
            src={playing ? source : undefined}
          />
        ) : null}
      </div>
    </section>
  );
}
