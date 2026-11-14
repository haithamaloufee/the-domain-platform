"use client";

import type { AdminEventMediaItem, EventCoverPresentation } from "@the-domain/types";
import { buttonClasses, Card, MediaFrame } from "@the-domain/ui";
import {
  applyEventCoverAlignmentPreset,
  defaultEventCoverPresentation,
  eventCoverAlignmentPresets,
  eventCoverRenderData,
  eventCoverPresentationChanged,
  eventCoverPreviewPresets,
  toEventCoverPresentationRequest,
  type EventCoverAlignmentPreset,
  type EventCoverPreviewPreset,
} from "@the-domain/utils";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { updateEventCoverPresentation } from "@/lib/media/admin-media-client";

const previewClasses: Record<EventCoverPreviewPreset, string> = {
  heroDesktop: "aspect-[16/7]",
  heroMobile: "aspect-[4/5] max-w-sm",
  cardLandscape: "aspect-[5/4] max-w-2xl",
  cardCompact: "aspect-[3/4] max-w-sm",
};

const alignmentLabels: Record<EventCoverAlignmentPreset, string> = {
  center: "Center",
  top: "Top",
  bottom: "Bottom",
  left: "Left",
  right: "Right",
};

export function EventCoverComposer({
  cover,
  eventId,
  onDraftChange,
  onSaved,
}: {
  cover: AdminEventMediaItem | null;
  eventId: string;
  onDraftChange?: (presentation: EventCoverPresentation | null) => void;
  onSaved?: (presentation: EventCoverPresentation) => void;
}) {
  const [canonical, setCanonical] = useState<EventCoverPresentation>({
    ...(cover?.presentation ?? defaultEventCoverPresentation),
  });
  const [draft, setDraft] = useState<EventCoverPresentation>({ ...canonical });
  const [previewPreset, setPreviewPreset] = useState<EventCoverPreviewPreset>("heroDesktop");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const focalPointRef = useRef<HTMLDivElement>(null);
  const dirty = useMemo(
    () => Boolean(cover && eventCoverPresentationChanged(draft, canonical)),
    [canonical, cover, draft],
  );

  useEffect(() => {
    if (!dirty) return;
    function warnBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return;
    function warnBeforeLinkNavigation(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      const target = event.target;
      const link = target instanceof Element ? target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank") return;
      if (new URL(link.href, window.location.href).href === window.location.href) return;
      if (!window.confirm("Leave this page? Unsaved cover composition will be lost.")) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    document.addEventListener("click", warnBeforeLinkNavigation, true);
    return () => document.removeEventListener("click", warnBeforeLinkNavigation, true);
  }, [dirty]);

  function updateDraft(next: EventCoverPresentation) {
    setDraft(next);
    setError("");
    setNotice("");
    onDraftChange?.(next);
  }

  function updateFocalPoint(clientX: number, clientY: number) {
    const rectangle = focalPointRef.current?.getBoundingClientRect();
    if (!rectangle || rectangle.width <= 0 || rectangle.height <= 0) return;
    updateDraft({
      ...draft,
      focalPointX: Math.min(1, Math.max(0, (clientX - rectangle.left) / rectangle.width)),
      focalPointY: Math.min(1, Math.max(0, (clientY - rectangle.top) / rectangle.height)),
    });
  }

  function moveFocus(horizontal: number, vertical: number) {
    updateDraft({
      ...draft,
      focalPointX: Math.min(1, Math.max(0, draft.focalPointX + horizontal)),
      focalPointY: Math.min(1, Math.max(0, draft.focalPointY + vertical)),
    });
  }

  async function save() {
    if (!cover || !dirty || pending) return;
    setPending(true);
    setError("");
    setNotice("");
    try {
      const saved = await updateEventCoverPresentation(
        eventId,
        cover.id,
        toEventCoverPresentationRequest(draft),
      );
      setCanonical(saved.presentation);
      setDraft(saved.presentation);
      onDraftChange?.(saved.presentation);
      onSaved?.(saved.presentation);
      setNotice("Cover composition saved.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "The cover composition could not be saved.",
      );
    } finally {
      setPending(false);
    }
  }

  if (!cover) {
    return (
      <section aria-labelledby="cover-composer-title">
        <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">
          Cover composition
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink" id="cover-composer-title">
          Position the artwork
        </h2>
        <div className="mt-6 border border-dashed border-line bg-surface-raised p-8 text-center">
          <p className="font-display text-xl font-bold text-ink">Select an approved image first</p>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            Composition controls become available when the event has an eligible public cover.
          </p>
        </div>
      </section>
    );
  }

  const preset = eventCoverPreviewPresets[previewPreset];
  const rendering = eventCoverRenderData(cover.media, draft);

  return (
    <section aria-labelledby="cover-composer-title">
      <div className="border-b border-line pb-5">
        <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">
          Cover composition
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink" id="cover-composer-title">
          Position the artwork
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-muted">
          Click or drag to keep the important subject in view, then adjust the zoom. The original
          media file is never changed.
        </p>
      </div>

      <Card className="mt-6 overflow-hidden p-5 sm:p-7">
        <div aria-label="Cover layout preview" className="flex flex-wrap gap-2" role="group">
          {(Object.keys(eventCoverPreviewPresets) as EventCoverPreviewPreset[]).map((value) => (
            <button
              aria-pressed={previewPreset === value}
              className={buttonClasses(previewPreset === value ? "secondary" : "ghost", "px-3")}
              key={value}
              onClick={() => setPreviewPreset(value)}
              type="button"
            >
              {eventCoverPreviewPresets[value].label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-ink-muted">
          {preset.label} shows how the same saved position adapts to this layout.
        </p>

        <div className={`mx-auto mt-5 w-full ${previewClasses[previewPreset]}`}>
          <MediaFrame className="h-full overflow-hidden border-line">
            {rendering ? (
              <Image
                alt={rendering.altText || "Event cover preview"}
                className="pointer-events-none select-none object-cover"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 70vw"
                src={rendering.sourceUrl}
                style={rendering.style}
              />
            ) : (
              <div className="grid h-full place-items-center px-6 text-center text-sm text-ink-muted">
                This cover preview is temporarily unavailable.
              </div>
            )}
            <div
              aria-label="Cover focal point. Use arrow keys for precise positioning."
              className="absolute inset-0 cursor-crosshair touch-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              onKeyDown={(event) => {
                const step = event.shiftKey ? 0.1 : 0.02;
                if (event.key === "ArrowLeft") moveFocus(-step, 0);
                else if (event.key === "ArrowRight") moveFocus(step, 0);
                else if (event.key === "ArrowUp") moveFocus(0, -step);
                else if (event.key === "ArrowDown") moveFocus(0, step);
                else if (event.key === "Home")
                  updateDraft({ ...draft, focalPointX: 0.5, focalPointY: 0.5 });
                else return;
                event.preventDefault();
              }}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                updateFocalPoint(event.clientX, event.clientY);
              }}
              onPointerMove={(event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId))
                  updateFocalPoint(event.clientX, event.clientY);
              }}
              ref={focalPointRef}
              role="application"
              tabIndex={0}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute size-6 -translate-x-1/2 -translate-y-1/2 border-2 border-gold bg-canvas/70 shadow-lg"
                style={{ left: `${draft.focalPointX * 100}%`, top: `${draft.focalPointY * 100}%` }}
              />
            </div>
          </MediaFrame>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-2">
          <div>
            <span className="font-label text-xs uppercase tracking-[0.12em] text-ink-muted">
              Quick position
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {(Object.keys(eventCoverAlignmentPresets) as EventCoverAlignmentPreset[]).map(
                (value) => (
                  <button
                    className={buttonClasses("ghost", "px-3")}
                    disabled={pending}
                    key={value}
                    onClick={() => updateDraft(applyEventCoverAlignmentPreset(draft, value))}
                    type="button"
                  >
                    {alignmentLabels[value]}
                  </button>
                ),
              )}
            </div>
          </div>
          <label>
            <span className="flex items-center justify-between gap-4 font-label text-xs uppercase tracking-[0.12em] text-ink-muted">
              Zoom
              <span aria-hidden="true">{Math.round(draft.zoom * 100)}%</span>
            </span>
            <input
              aria-valuetext={`${Math.round(draft.zoom * 100)} percent`}
              className="mt-3 h-11 w-full cursor-pointer accent-[var(--td-color-gold)]"
              disabled={pending}
              max={3}
              min={1}
              onChange={(event) => updateDraft({ ...draft, zoom: Number(event.target.value) })}
              step={0.05}
              type="range"
              value={draft.zoom}
            />
          </label>
        </div>

        <div aria-live="polite" className="mt-6">
          {dirty && !error && !notice && (
            <p className="text-sm text-warning">Unsaved cover composition</p>
          )}
          {error && (
            <p className="text-sm text-error" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="text-sm text-success" role="status">
              {notice}
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-3 border-t border-line pt-5">
          <button
            className={buttonClasses("primary")}
            disabled={!dirty || pending}
            onClick={() => void save()}
            type="button"
          >
            {pending ? "Saving composition…" : "Save composition"}
          </button>
          <button
            className={buttonClasses("secondary")}
            disabled={pending}
            onClick={() => updateDraft({ ...defaultEventCoverPresentation })}
            type="button"
          >
            Reset to default
          </button>
          <button
            className={buttonClasses("ghost")}
            disabled={!dirty || pending}
            onClick={() => updateDraft({ ...canonical })}
            type="button"
          >
            Cancel local changes
          </button>
        </div>
      </Card>
    </section>
  );
}
