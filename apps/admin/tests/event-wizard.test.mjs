import assert from "node:assert/strict";
import test from "node:test";
import {
  BookingAvailability,
  EventMediaUsage,
  EventPublicationStatus,
  MediaApprovalStatus,
  MediaOrientation,
  MediaType,
} from "@the-domain/types";
import { eventRequestErrorKind } from "../src/lib/events/event-request-errors.ts";
import {
  buildEventPreview,
  buildPublishChecklist,
  canPublish,
  eventTypeSelection,
  firstInvalidField,
  initialWizardFields,
  isManualSlugOverride,
  routeAfterDraftCreation,
  timezoneOptions,
  toSaveEventRequest,
  validateWizardStep,
} from "../src/lib/events/event-wizard-model.ts";

test("step validation reports meaningful required fields and focuses the first one", () => {
  const fields = { ...initialWizardFields(), city: "" };
  const errors = validateWizardStep(fields, "basic");

  assert.equal(errors.title, "Event title is required.");
  assert.equal(errors.shortDescription, "Short description is required.");
  assert.equal(firstInvalidField(errors), "title");
});

test("legacy event types load through Other without losing the custom value", () => {
  assert.deepEqual(eventTypeSelection("Immersive theatre"), {
    choice: "Other",
    custom: "Immersive theatre",
  });
  assert.deepEqual(eventTypeSelection("Concert"), { choice: "Concert", custom: "" });
});

test("timezone options always retain Amman and a valid existing value", () => {
  const options = timezoneOptions("Pacific/Honolulu");
  assert.ok(options.includes("Asia/Amman"));
  assert.ok(options.includes("Pacific/Honolulu"));
});

test("human date and time fields map to the intended timezone instant", () => {
  const fields = validFields();
  const request = toSaveEventRequest(fields);

  assert.equal(request?.startAtUtc, "2026-11-18T19:00:00.000Z");
  assert.equal(request?.endAtUtc, "2026-11-18T21:00:00.000Z");
});

test("booking fields only block progress when persisted state is Open", () => {
  const hidden = { ...validFields(), bookingStatus: BookingAvailability.Hidden };
  const open = { ...hidden, bookingStatus: BookingAvailability.Open, externalBookingUrl: "" };

  assert.equal(validateWizardStep(hidden, "schedule").externalBookingUrl, undefined);
  assert.match(validateWizardStep(open, "schedule").externalBookingUrl, /HTTPS/);
});

test("preview maps live text, eligible cover, and approved gallery ordering", () => {
  const cover = mediaItem("cover", EventMediaUsage.Cover, 1, MediaApprovalStatus.Approved);
  const later = mediaItem("later", EventMediaUsage.Gallery, 2, MediaApprovalStatus.Approved);
  const earlier = mediaItem("earlier", EventMediaUsage.Gallery, 0, MediaApprovalStatus.Approved);
  const hidden = mediaItem("hidden", EventMediaUsage.Gallery, 3, MediaApprovalStatus.Hidden);
  const preview = buildEventPreview(
    validFields(),
    [cover, later, hidden, earlier],
    new Date("2026-01-01T00:00:00Z"),
  );

  assert.equal(preview.title, "Domain Night");
  assert.equal(preview.cover?.id, "cover");
  assert.deepEqual(
    preview.gallery.map((item) => item.id),
    ["earlier", "later"],
  );
});

test("publish checklist requires acknowledgement only when cover is missing", () => {
  const fields = validFields();
  fields.publicationStatus = EventPublicationStatus.Published;
  const blocked = buildPublishChecklist(fields, [], false, false);
  const acknowledged = buildPublishChecklist(fields, [], true, false);

  assert.equal(canPublish(blocked), false);
  assert.equal(canPublish(acknowledged), true);
});

test("draft route, advanced slug override, and event errors remain predictable", () => {
  assert.equal(routeAfterDraftCreation("event id"), "/dashboard/events/event%20id/edit?step=media");
  assert.equal(isManualSlugOverride("stable-slug", "stable-slug"), false);
  assert.equal(isManualSlugOverride("new-slug", "stable-slug"), true);
  assert.equal(eventRequestErrorKind(409), "conflict");
  assert.equal(eventRequestErrorKind(429), "rate-limit");
  assert.equal(eventRequestErrorKind(503), "service-unavailable");
});

function validFields() {
  return {
    ...initialWizardFields(),
    title: "Domain Night",
    eventTypeChoice: "Concert",
    shortDescription: "A cinematic night in Amman.",
    longDescription: "A complete event description for the public detail page.",
    city: "Amman",
    venueName: "The Domain",
    startDate: "2026-11-18",
    startTime: "22:00",
    endDate: "2026-11-19",
    endTime: "00:00",
    timeZoneId: "Asia/Amman",
  };
}

function mediaItem(id, usage, sortOrder, approvalStatus) {
  return {
    id,
    eventId: "event",
    mediaAssetId: `asset-${id}`,
    usage,
    sortOrder,
    isFeatured: usage === EventMediaUsage.Cover,
    createdAtUtc: "2026-01-01T00:00:00Z",
    presentation: { focalPointX: 0.5, focalPointY: 0.5, zoom: 1 },
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
      altText: null,
      approvalStatus,
      createdAtUtc: "2026-01-01T00:00:00Z",
      width: 1200,
      height: 1500,
      durationSeconds: null,
      updatedAtUtc: "2026-01-01T00:00:00Z",
    },
  };
}
