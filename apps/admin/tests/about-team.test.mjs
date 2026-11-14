import assert from "node:assert/strict";
import test from "node:test";
import { aboutChanged, aboutPreviewWidth, moveAboutItem, safeAboutHref } from "@the-domain/utils";
test("About CTA validation accepts only intentional destinations", () => {
  for (const value of ["/contact", "https://example.com", "mailto:hello@example.com", "tel:+9627"])
    assert.equal(safeAboutHref(value), true);
  for (const value of [
    "//example.com",
    "http://example.com",
    "javascript:alert(1)",
    "data:text/html,x",
  ])
    assert.equal(safeAboutHref(value), false);
});
test("Team ordering is immutable and deterministic", () => {
  const original = ["a", "b", "c"];
  assert.deepEqual(moveAboutItem(original, 0, 2), ["b", "c", "a"]);
  assert.deepEqual(original, ["a", "b", "c"]);
});
test("dirty and responsive preview mappings remain explicit", () => {
  assert.equal(aboutChanged({ title: "A" }, { title: "A" }), false);
  assert.equal(aboutChanged({ title: "A" }, { title: "B" }), true);
  assert.equal(aboutPreviewWidth("mobile"), "max-w-xs");
  assert.equal(aboutPreviewWidth("tablet"), "max-w-2xl");
  assert.equal(aboutPreviewWidth("desktop"), "max-w-full");
});
