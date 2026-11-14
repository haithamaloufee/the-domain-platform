import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parseCmsRequest } from "../src/lib/cms/cms-contract.ts";

test("Homepage save contracts ignore removed section composition fields", () => {
  const request = parseCmsRequest(
    {
      disabledSections: ["gallery"],
      floatingVideoMediaAssetId: null,
      floatingVideoPosterMediaAssetId: null,
      galleryCollectionId: null,
      heroMediaAssetId: null,
      isFloatingVideoEnabled: false,
      isPublished: true,
      sectionOrder: ["contact"],
    },
    "homepage",
  );

  assert.ok(request);
  assert.equal("sectionOrder" in request, false);
  assert.equal("disabledSections" in request, false);
});

test("Homepage editor exposes no reorder or disable-section controls", () => {
  const editor = readFileSync(
    new URL("../src/components/homepage/homepage-editor.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(editor, /sectionOrder|disabledSections|Section order and visibility/);
});
