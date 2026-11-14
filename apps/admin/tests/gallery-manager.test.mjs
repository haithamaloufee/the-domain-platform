import assert from "node:assert/strict";
import test from "node:test";
import { GalleryLayoutPreset, MediaType } from "@the-domain/types";
import {
  galleryFeaturedMedia,
  galleryMediaImageSource,
  galleryPreviewWidths,
  galleryUnsaved,
  moveGalleryId,
  safeGalleryLayoutPreset,
} from "@the-domain/utils";

test("layout presets and preview modes have safe deterministic fallbacks", () => {
  assert.equal(safeGalleryLayoutPreset(99), GalleryLayoutPreset.Editorial);
  assert.equal(safeGalleryLayoutPreset(GalleryLayoutPreset.Compact), GalleryLayoutPreset.Compact);
  assert.deepEqual(Object.keys(galleryPreviewWidths), ["desktop", "tablet", "mobile"]);
});

test("collection ordering and featured fallback preserve canonical input", () => {
  const ids = ["one", "two", "three"];
  assert.deepEqual(moveGalleryId(ids, "three", "one"), ["three", "one", "two"]);
  assert.deepEqual(ids, ["one", "two", "three"]);
  const media = [{ id: "one" }, { id: "two" }];
  assert.equal(galleryFeaturedMedia(media, "two")?.id, "two");
  assert.equal(galleryFeaturedMedia(media, "missing")?.id, "one");
});

test("dirty detection includes all presentation fields and reset values are clean", () => {
  const reset = {
    publicTitle: null,
    publicDescription: null,
    layoutPreset: GalleryLayoutPreset.Editorial,
    featuredMediaAssetId: null,
  };
  assert.equal(galleryUnsaved(reset, { ...reset }), false);
  assert.equal(galleryUnsaved({ ...reset, publicTitle: "Public" }, reset), true);
});

test("video playback and poster sources remain distinct and HTTPS-only", () => {
  const video = {
    mediaType: MediaType.Video,
    url: "https://cdn.example/play.mp4",
    posterUrl: "https://cdn.example/poster.jpg",
  };
  assert.equal(galleryMediaImageSource(video), video.posterUrl);
  assert.notEqual(galleryMediaImageSource(video), video.url);
  assert.equal(
    galleryMediaImageSource({ ...video, posterUrl: "http://unsafe.example/poster.jpg" }),
    null,
  );
  assert.equal(galleryMediaImageSource({ ...video, mediaType: MediaType.Image }), video.url);
});
