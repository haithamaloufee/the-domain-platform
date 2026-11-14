import {
  MediaType,
  type MediaTypeValue,
  type EventCoverPresentation,
  type UpdateEventCoverPresentationRequest,
} from "@the-domain/types";

export const eventCoverPresentationBounds = {
  focalPointMinimum: 0,
  focalPointMaximum: 1,
  zoomMinimum: 1,
  zoomMaximum: 3,
} as const;

export const defaultEventCoverPresentation: Readonly<EventCoverPresentation> = Object.freeze({
  focalPointX: 0.5,
  focalPointY: 0.5,
  zoom: 1,
});

export const eventCoverAlignmentPresets = {
  center: { focalPointX: 0.5, focalPointY: 0.5 },
  top: { focalPointX: 0.5, focalPointY: 0 },
  bottom: { focalPointX: 0.5, focalPointY: 1 },
  left: { focalPointX: 0, focalPointY: 0.5 },
  right: { focalPointX: 1, focalPointY: 0.5 },
} as const;

export type EventCoverAlignmentPreset = keyof typeof eventCoverAlignmentPresets;

export const eventCoverPreviewPresets = {
  heroDesktop: { label: "Event hero desktop", aspectRatio: "16 / 7" },
  heroMobile: { label: "Event hero mobile", aspectRatio: "4 / 5" },
  cardLandscape: { label: "Event card landscape", aspectRatio: "5 / 4" },
  cardCompact: { label: "Event card compact", aspectRatio: "3 / 4" },
} as const;

export type EventCoverPreviewPreset = keyof typeof eventCoverPreviewPresets;

interface EventCoverMediaSource {
  altText?: string | null;
  mediaType: MediaTypeValue;
  presentation?: Partial<EventCoverPresentation> | null;
  thumbnailUrl?: string | null;
  url: string;
}

export function clampEventCoverPresentation(
  value: Partial<EventCoverPresentation> | null | undefined,
): EventCoverPresentation {
  return {
    focalPointX: clampFinite(
      value?.focalPointX,
      eventCoverPresentationBounds.focalPointMinimum,
      eventCoverPresentationBounds.focalPointMaximum,
      defaultEventCoverPresentation.focalPointX,
    ),
    focalPointY: clampFinite(
      value?.focalPointY,
      eventCoverPresentationBounds.focalPointMinimum,
      eventCoverPresentationBounds.focalPointMaximum,
      defaultEventCoverPresentation.focalPointY,
    ),
    zoom: clampFinite(
      value?.zoom,
      eventCoverPresentationBounds.zoomMinimum,
      eventCoverPresentationBounds.zoomMaximum,
      defaultEventCoverPresentation.zoom,
    ),
  };
}

export function isValidEventCoverPresentation(value: unknown): value is EventCoverPresentation {
  if (!isRecord(value)) return false;
  return (
    isInRange(
      value.focalPointX,
      eventCoverPresentationBounds.focalPointMinimum,
      eventCoverPresentationBounds.focalPointMaximum,
    ) &&
    isInRange(
      value.focalPointY,
      eventCoverPresentationBounds.focalPointMinimum,
      eventCoverPresentationBounds.focalPointMaximum,
    ) &&
    isInRange(
      value.zoom,
      eventCoverPresentationBounds.zoomMinimum,
      eventCoverPresentationBounds.zoomMaximum,
    )
  );
}

export function applyEventCoverAlignmentPreset(
  presentation: EventCoverPresentation,
  preset: EventCoverAlignmentPreset,
): EventCoverPresentation {
  return { ...presentation, ...eventCoverAlignmentPresets[preset] };
}

export function eventCoverImageStyle(
  presentation: Partial<EventCoverPresentation> | null | undefined,
) {
  const normalized = clampEventCoverPresentation(presentation);
  const objectPosition = `${normalized.focalPointX * 100}% ${normalized.focalPointY * 100}%`;
  return {
    objectPosition,
    transform: `scale(${normalized.zoom})`,
    transformOrigin: objectPosition,
  };
}

export function eventCoverRenderData(
  media: EventCoverMediaSource | null | undefined,
  presentation: Partial<EventCoverPresentation> | null | undefined = media?.presentation,
) {
  if (!media || media.mediaType !== MediaType.Image) return null;
  const mediaUrl = safeHttpsUrl(media.url);
  if (!mediaUrl) return null;
  const sourceUrl = safeHttpsUrl(media.thumbnailUrl) ?? mediaUrl;
  return {
    altText: media.altText ?? "",
    sourceUrl,
    style: eventCoverImageStyle(presentation),
  };
}

export function eventCoverPresentationChanged(
  left: Partial<EventCoverPresentation> | null | undefined,
  right: Partial<EventCoverPresentation> | null | undefined,
): boolean {
  const normalizedLeft = clampEventCoverPresentation(left);
  const normalizedRight = clampEventCoverPresentation(right);
  return (
    normalizedLeft.focalPointX !== normalizedRight.focalPointX ||
    normalizedLeft.focalPointY !== normalizedRight.focalPointY ||
    normalizedLeft.zoom !== normalizedRight.zoom
  );
}

export function toEventCoverPresentationRequest(
  presentation: Partial<EventCoverPresentation> | null | undefined,
): UpdateEventCoverPresentationRequest {
  return clampEventCoverPresentation(presentation);
}

function clampFinite(value: unknown, minimum: number, maximum: number, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(maximum, Math.max(minimum, value))
    : fallback;
}

function isInRange(value: unknown, minimum: number, maximum: number): value is number {
  return (
    typeof value === "number" && Number.isFinite(value) && value >= minimum && value <= maximum
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function safeHttpsUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}
