import assert from "node:assert/strict";
import test from "node:test";
import { moveHomepageItem, partnerLogoEligible, statisticsPhraseRequest } from "@the-domain/utils";
test("visual ordering produces contiguous canonical sort values", () => {
  const items = [
    { id: "a", sortOrder: 0 },
    { id: "b", sortOrder: 1 },
    { id: "c", sortOrder: 2 },
  ];
  assert.deepEqual(
    moveHomepageItem(items, "c", -1).map((item) => [item.id, item.sortOrder]),
    [
      ["a", 0],
      ["c", 1],
      ["b", 2],
    ],
  );
  assert.equal(items[2].sortOrder, 2);
});
test("phrase mapping trims copy and preserves enabled state", () => {
  assert.deepEqual(statisticsPhraseRequest(" Motion in every moment ", false), {
    phrase: "Motion in every moment",
    isEnabled: false,
  });
});
test("partner logos require approved non-archived HTTPS images", () => {
  assert.equal(
    partnerLogoEligible({
      mediaType: 1,
      approvalStatus: 2,
      isArchived: false,
      url: "https://cdn.example/logo.png",
    }),
    true,
  );
  assert.equal(
    partnerLogoEligible({
      mediaType: 2,
      approvalStatus: 2,
      isArchived: false,
      url: "https://cdn.example/video.mp4",
    }),
    false,
  );
  assert.equal(
    partnerLogoEligible({
      mediaType: 1,
      approvalStatus: 1,
      isArchived: false,
      url: "https://cdn.example/logo.png",
    }),
    false,
  );
});
