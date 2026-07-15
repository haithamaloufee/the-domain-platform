import assert from "node:assert/strict";
import test from "node:test";
import {
  EventMediaUsage,
  MediaApprovalStatus,
  MediaOrientation,
  MediaType,
} from "@the-domain/types";
import {
  applyEventCoverAlignmentPreset,
  clampEventCoverPresentation,
  defaultEventCoverPresentation,
  eventCoverImageStyle,
  eventCoverPresentationChanged,
  eventCoverPreviewPresets,
  eventCoverRenderData,
  isValidEventCoverPresentation,
  toEventCoverPresentationRequest,
} from "@the-domain/utils";
import {
  moveEventMediaId,
  orderItemsByCanonicalIds,
  reorderEventMediaIds,
} from "../src/lib/media/event-media-ordering.ts";
import { activeEventCover } from "../src/lib/media/event-media-rules.ts";
import { parseEventMedia, parsePresentationRequest } from "../src/lib/media/media-contract.ts";

test("legacy and invalid presentation values resolve to safe bounded defaults", () => {
  assert.deepEqual(clampEventCoverPresentation(undefined), defaultEventCoverPresentation);
  assert.deepEqual(
    clampEventCoverPresentation({ focalPointX: -1, focalPointY: 2, zoom: Number.NaN }),
    { focalPointX: 0, focalPointY: 1, zoom: 1 },
  );
  assert.equal(isValidEventCoverPresentation({ focalPointX: 0, focalPointY: 1, zoom: 3 }), true);
  assert.equal(
    isValidEventCoverPresentation({ focalPointX: 0, focalPointY: 1, zoom: 3.01 }),
    false,
  );
});

test("alignment, reset, dirty detection, and save request mapping stay deterministic", () => {
  const changed = applyEventCoverAlignmentPreset(
    { focalPointX: 0.2, focalPointY: 0.3, zoom: 1.8 },
    "top",
  );
  assert.deepEqual(changed, { focalPointX: 0.5, focalPointY: 0, zoom: 1.8 });
  assert.equal(eventCoverPresentationChanged(changed, defaultEventCoverPresentation), true);
  assert.equal(
    eventCoverPresentationChanged(defaultEventCoverPresentation, {
      ...defaultEventCoverPresentation,
    }),
    false,
  );
  assert.deepEqual(toEventCoverPresentationRequest(undefined), defaultEventCoverPresentation);
  assert.deepEqual(clampEventCoverPresentation(defaultEventCoverPresentation), {
    focalPointX: 0.5,
    focalPointY: 0.5,
    zoom: 1,
  });
});

test("preview presets and CSS rendering use one focal point and zoom formula", () => {
  assert.deepEqual(Object.keys(eventCoverPreviewPresets), [
    "heroDesktop",
    "heroMobile",
    "cardLandscape",
    "cardCompact",
  ]);
  assert.deepEqual(eventCoverImageStyle({ focalPointX: 0.25, focalPointY: 0.75, zoom: 2 }), {
    objectPosition: "25% 75%",
    transform: "scale(2)",
    transformOrigin: "25% 75%",
  });
});

test("cover render data rejects unsafe and video sources while preserving alt text", () => {
  const image = mediaItem("cover", EventMediaUsage.Cover, 0);
  const rendering = eventCoverRenderData(image.media, {
    focalPointX: 0.2,
    focalPointY: 0.8,
    zoom: 1.5,
  });
  assert.equal(rendering?.sourceUrl, "https://media.example.com/cover.jpg");
  assert.equal(rendering?.altText, "Cover cover");
  assert.equal(eventCoverRenderData({ ...image.media, mediaType: MediaType.Video }), null);
  assert.equal(
    eventCoverRenderData({ ...image.media, url: "http://media.example.com/cover.jpg" }),
    null,
  );
});

test("admin response parser defaults legacy metadata and rejects invalid save requests", () => {
  const parsed = parseEventMedia({
    id: "assignment",
    eventId: "event",
    mediaAssetId: "asset",
    usage: EventMediaUsage.Cover,
    sortOrder: 0,
    isFeatured: true,
    createdAtUtc: "2026-01-01T00:00:00Z",
  });
  assert.deepEqual(parsed.presentation, defaultEventCoverPresentation);
  assert.deepEqual(parsePresentationRequest({ focalPointX: 0, focalPointY: 1, zoom: 3 }), {
    focalPointX: 0,
    focalPointY: 1,
    zoom: 3,
  });
  assert.equal(parsePresentationRequest({ focalPointX: -1, focalPointY: 1, zoom: 3 }), null);
});

test("pointer and keyboard reorder calculations map to the canonical ID contract", () => {
  const items = [
    mediaItem("first", EventMediaUsage.Cover, 0),
    mediaItem("second", EventMediaUsage.Gallery, 1),
    mediaItem("third", EventMediaUsage.Gallery, 2),
  ];
  assert.deepEqual(reorderEventMediaIds(items, "first", "third"), ["second", "third", "first"]);
  assert.deepEqual(moveEventMediaId(items, "second", -1), ["second", "first", "third"]);
  assert.deepEqual(moveEventMediaId(items, "first", -1), ["first", "second", "third"]);
  assert.deepEqual(moveEventMediaId(items, "third", 1), ["first", "second", "third"]);
});

test("invalid rollback order restores canonical sorting and cover metadata stays contextual", () => {
  const previous = mediaItem("previous", EventMediaUsage.Gallery, 0, {
    focalPointX: 0.1,
    focalPointY: 0.9,
    zoom: 2,
  });
  const replacement = mediaItem("replacement", EventMediaUsage.Cover, 1);
  const items = [replacement, previous];

  assert.deepEqual(
    orderItemsByCanonicalIds(items, ["replacement", "replacement"]).map((item) => item.id),
    ["previous", "replacement"],
  );
  assert.equal(activeEventCover(items)?.id, "replacement");
  assert.deepEqual(activeEventCover(items)?.presentation, defaultEventCoverPresentation);
  assert.deepEqual(previous.presentation, { focalPointX: 0.1, focalPointY: 0.9, zoom: 2 });
});

function mediaItem(id, usage, sortOrder, presentation = defaultEventCoverPresentation) {
  return {
    id,
    eventId: "event",
    mediaAssetId: `asset-${id}`,
    usage,
    sortOrder,
    isFeatured: usage === EventMediaUsage.Cover,
    createdAtUtc: "2026-01-01T00:00:00Z",
    presentation: { ...presentation },
    media: {
      id: `asset-${id}`,
      fileName: `${id}.jpg`,
      originalFileName: `${id}.jpg`,
      mediaType: MediaType.Image,
      url: `https://media.example.com/${id}.jpg`,
      thumbnailUrl: null,
      orientation: MediaOrientation.Portrait,
      category: null,
      caption: null,
      altText: `Cover ${id}`,
      approvalStatus: MediaApprovalStatus.Approved,
      createdAtUtc: "2026-01-01T00:00:00Z",
      width: 1200,
      height: 1500,
      durationSeconds: null,
      updatedAtUtc: "2026-01-01T00:00:00Z",
    },
  };
}
