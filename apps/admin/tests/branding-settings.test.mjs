import assert from "node:assert/strict";
import test from "node:test";
import {
  alternateBrandLogo,
  brandingChanged,
  brandingRequest,
  fallbackBranding,
  safeBrandingUrl,
} from "@the-domain/utils";
const settings = {
  ...fallbackBranding,
  primaryLogoMediaAssetId: null,
  alternateLogoMediaAssetId: null,
  faviconMediaAssetId: null,
  socialImageMediaAssetId: null,
};
test("fallback identity and alternate logo mapping are intentional", () => {
  assert.equal(fallbackBranding.primaryLogo, null);
  assert.equal(fallbackBranding.favicon, null);
  assert.deepEqual(fallbackBranding.socialLinks, {});
  assert.equal(alternateBrandLogo("primary", null), "primary");
  assert.equal(alternateBrandLogo("primary", "alternate"), "alternate");
});
test("request mapping normalizes optional contact and social values", () => {
  const request = brandingRequest({
    ...settings,
    publicEmail: " public@example.com ",
    socialLinks: { instagram: " https://instagram.com/domain " },
  });
  assert.equal(request.publicEmail, "public@example.com");
  assert.equal(request.socialLinks.instagram, "https://instagram.com/domain");
  assert.equal("siteName" in request, false);
  assert.equal("brandDescription" in request, false);
});
test("dirty detection and HTTPS mapping remain deterministic", () => {
  assert.equal(brandingChanged(settings, { ...settings }), false);
  assert.equal(brandingChanged(settings, { ...settings, publicPhone: "+962 7 9000 0000" }), true);
  assert.equal(safeBrandingUrl("https://cdn.example/logo.png"), "https://cdn.example/logo.png");
  assert.equal(safeBrandingUrl("http://unsafe.example/logo.png"), null);
});
