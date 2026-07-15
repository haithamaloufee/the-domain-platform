"use client";

import type { AdminEventMediaItem } from "@the-domain/types";
import { Badge, Card, MediaFrame } from "@the-domain/ui";
import { useState } from "react";
import { MediaPreview } from "@/components/media/media-preview";
import {
  buildEventPreview,
  type EventWizardFields,
} from "@/lib/events/event-wizard-model";

type PreviewMode = "desktop" | "tablet" | "mobile";

const modeWidths: Record<PreviewMode, string> = {
  desktop: "max-w-full",
  tablet: "max-w-3xl",
  mobile: "max-w-sm",
};

export function EventPreview({
  fields,
  media,
  modes = true,
}: {
  fields: EventWizardFields;
  media: AdminEventMediaItem[];
  modes?: boolean;
}) {
  const [mode, setMode] = useState<PreviewMode>(modes ? "desktop" : "mobile");
  const preview = buildEventPreview(fields, media);

  return (
    <section aria-labelledby="event-preview-title">
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">Live preview</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-ink" id="event-preview-title">
            Public experience approximation
          </h2>
          <p className="mt-2 text-xs leading-5 text-ink-muted">
            Final typography and surrounding page content may differ after publication.
          </p>
        </div>
        {modes && (
          <div aria-label="Preview size" className="flex flex-wrap gap-2" role="group">
            {(["desktop", "tablet", "mobile"] as const).map((value) => (
              <button
                aria-pressed={mode === value}
                className={`min-h-11 border px-3 font-label text-xs uppercase tracking-[0.12em] transition ${mode === value ? "border-gold bg-gold/10 text-gold" : "border-line text-ink-muted hover:border-gold"}`}
                key={value}
                onClick={() => setMode(value)}
                type="button"
              >
                {value}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`mx-auto mt-6 transition-[max-width] motion-reduce:transition-none ${modeWidths[mode]}`}>
        <Card className="overflow-hidden">
          <div className={mode === "desktop" ? "grid lg:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.2fr)]" : "block"}>
            <PreviewArtwork cover={preview.cover} />
            <div className="flex flex-col justify-between p-5 sm:p-7">
              <div>
                <div className="flex flex-wrap gap-2"><Badge>{preview.lifecycleLabel}</Badge><Badge>{preview.eventType}</Badge></div>
                <p className="mt-6 font-label text-xs uppercase tracking-[0.14em] text-gold">{preview.scheduleSummary}</p>
                <h3 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] text-ink">{preview.title}</h3>
                <p className="mt-4 text-sm leading-6 text-ink-muted">{preview.description}</p>
              </div>
              <div className="mt-8 border-t border-line pt-5">
                <p className="text-sm text-ink">{preview.city} / {preview.venueName}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.12em] text-ink-muted">{preview.bookingSummary}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="relative mt-6 min-h-80 overflow-hidden border border-line bg-surface-raised">
          <div className="absolute inset-0 opacity-45"><PreviewArtwork cover={preview.cover} hero /></div>
          <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/65 to-canvas/20" />
          <div className="relative flex min-h-80 flex-col justify-end p-6 sm:p-8">
            <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">Event detail hero</p>
            <h3 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-[-0.04em] text-ink sm:text-5xl">{preview.title}</h3>
            <p className="mt-4 text-sm text-ink-muted">{preview.scheduleSummary} · {preview.venueName}</p>
          </div>
        </div>

        <section aria-label="Public gallery preview" className="mt-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-display text-xl font-bold text-ink">Assigned media order</h3>
            <span className="text-xs text-ink-muted">Approved gallery items only</span>
          </div>
          {preview.gallery.length ? (
            <ol className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {preview.gallery.slice(0, 6).map((item) => <li key={item.id}><MediaPreview item={item.media} /></li>)}
            </ol>
          ) : (
            <div className="mt-4 grid min-h-28 place-items-center border border-dashed border-line px-5 text-center text-xs uppercase tracking-[0.14em] text-ink-muted">Gallery media will appear here</div>
          )}
        </section>
      </div>
    </section>
  );
}

function PreviewArtwork({ cover, hero = false }: { cover: AdminEventMediaItem | null; hero?: boolean }) {
  if (cover) return <MediaPreview item={cover.media} priority={hero} />;
  return <MediaFrame className={hero ? "h-full border-0" : "min-h-72"}><div className="grid h-full min-h-72 place-items-center bg-surface-raised px-8 text-center"><span className="font-label text-xs uppercase tracking-[0.16em] text-ink-muted">Event artwork coming soon</span></div></MediaFrame>;
}
