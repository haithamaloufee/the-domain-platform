# Launch QA checklist

This checklist records local Sprint 15 evidence and the remaining gates before a production deployment. Local QA records are disposable PostgreSQL data; they are not production claims, seeds, or source-controlled content.

Status date: 2026-07-13

## Local demo runtime

- [x] PostgreSQL 16 container is running and reports healthy on port 5432.
- [x] All committed EF migrations apply successfully; the local database is current.
- [x] API runs at `http://localhost:5000` with persistence and authentication enabled.
- [x] Development Swagger is available at `http://localhost:5000/swagger`.
- [x] Admin runs at `http://localhost:3001` with its server-only API origin configured.
- [x] Website runs at `http://localhost:3000` with its server-only API origin configured.
- [x] API `/health` and `/api/info` return HTTP 200.
- [x] Public and admin route-level HTTP smoke checks pass.
- [x] Production Next.js builds include the publish, archive, cancel, media, gallery, homepage, sitemap, and robots routes.
- [x] A production-mode API rehearsal starts with explicit CORS origins and initial-admin provisioning disabled; health returns 200, Swagger returns 404, and unauthenticated admin access returns 401.

The repository root environment uses `API_URL`; the Next.js applications require `THE_DOMAIN_API_BASE_URL`. For normal local startup, create each app's ignored `.env.local` from its `.env.example`. A one-terminal alternative is to set `THE_DOMAIN_API_BASE_URL=$env:API_URL` in the process before starting either Next.js app.

## Local demo content

- [x] Homepage CMS contains published, claim-safe copy labeled `Local launch preview`.
- [x] Homepage Draft was verified to disappear from the public projection, then republished successfully.
- [x] Statistics remain empty so the safe awaiting-verification presentation is used. No metrics were invented.
- [x] Partners remain empty so the data-ready presentation is used. No identities or logos were invented.
- [x] Published upcoming event exists: `local-qa-upcoming-experience`.
- [x] Published finished event exists: `local-qa-previous-experience`.
- [x] Both event records are clearly labeled disposable local QA data and have booking disabled.
- [x] A separate lifecycle record verified create, edit, publish, cancel, archive, and public exclusion; it remains archived.
- [ ] Replace all local QA copy/events with approved launch content before production data entry is signed off.

## Media readiness

- [x] Configure `Cloudinary__Enabled=true` in the local API process with credentials kept server-only.
- [x] Upload disposable image and video assets through admin without committing either file.
- [x] Verify Draft, Approved, Hidden, and safe upload-failure behavior.
- [x] Keep the normal BFF backend timeout while allowing server-mediated media uploads a bounded 10-minute window.
- [x] Verify approved image/video event assignment, gallery projection, ordering persistence, featured selection, relationship-only removal, and reuse.
- [x] Generate a secure Cloudinary JPEG poster URL for uploaded videos and persist it as `ThumbnailUrl`.
- [x] Resolve the same poster transformation for previously stored Cloudinary videos that have no `ThumbnailUrl`.
- [ ] Assign approved launch media as Cover, Hero, Gallery, HomepagePreview, and PreviousEventPreview where editorially appropriate.
- [ ] Verify gallery photo/video filters, lightbox keyboard behavior, poster rendering, and no grid autoplay in a connected browser.
- [ ] Establish production Cloudinary transformations, image sizing, and video poster/thumbnail policy.

Sprint 16 local rehearsal: server-side Cloudinary image/video upload, metadata persistence, approval, assignment, ordering, public visibility, hiding, and gallery album/detail projection passed. Invalid video content returned a generic browser-safe error. Disposable rehearsal assets remain Hidden; production launch still requires approved media and a reviewed delivery/transformation policy.

## Admin workflow evidence

- [x] Valid SuperAdmin login succeeds through the same-origin admin BFF.
- [x] `/dashboard` redirects unauthenticated requests to `/login`.
- [x] Authenticated dashboard, events, media, homepage, statistics, and partners pages return HTTP 200.
- [x] Logout succeeds and protected navigation redirects afterward.
- [x] Homepage save as Draft and save/publish behavior persists and changes the public projection.
- [x] Event create, edit, publish, cancel, and archive actions persist correctly.
- [x] The observed publish-route 404 was reproduced against a stale Next.js development route manifest; restarting the admin server loaded the existing handler, all three lifecycle actions passed, and the production route manifest contains each route.
- [x] Archived events return public HTTP 404.
- [ ] Statistics create/edit/show/hide/delete was not exercised because no verified business value was supplied.
- [ ] Partners create/edit/show/hide/delete was not exercised because no approved partner identity was supplied.
- [x] Media upload, approval, hide, assignment, ordering, relationship removal, and event gallery workflows pass through the authenticated admin BFF.
- [ ] Repeat all interactive workflows in a connected browser with keyboard and screen-reader smoke checks.

## Public website evidence

- [x] `/`, `/events`, `/gallery`, `/about`, `/services`, and `/contact` return HTTP 200.
- [x] Published CMS copy appears on the homepage.
- [x] Homepage preserves safe empty statistics/partners and unavailable-media fallbacks.
- [x] `/events` returns both local upcoming and finished event records.
- [x] Upcoming detail renders its countdown presentation and hides booking without an Open booking URL.
- [x] Finished detail renders `Event Finished` and hides booking.
- [x] `/gallery` renders the expected empty-album state while no approved Gallery assignments exist.
- [x] Unknown/archived event detail returns HTTP 404.
- [ ] Gallery album detail, filtering, lightbox, and video behavior require approved media.

## SEO evidence

- [x] `/sitemap.xml` returns HTTP 200 and contains both published local event URLs.
- [x] `/robots.txt` returns HTTP 200 and disallows crawling in Development.
- [x] Dynamic event metadata emits canonical/Open Graph/Twitter data and Event JSON-LD.
- [x] Dynamic metadata does not serialize `publicationStatus`, `isFeatured`, or other admin-only fields.
- [x] Archived lifecycle event is excluded from public detail and discovery.
- [ ] Verify configured production robots references the final HTTPS sitemap after domains are approved.
- [ ] Add only an approved official icon/manifest after brand sign-off.

## Visual and accessibility QA

- [ ] Review 360px mobile layout.
- [ ] Review 390px mobile layout.
- [ ] Review tablet, desktop, and large-desktop layouts.
- [ ] Verify mobile navigation open/close, focus order, active states, and Escape behavior.
- [ ] Verify text overflow, tap targets, event cards, countdown, empty states, and media aspect ratios with approved content.
- [ ] Verify gallery filter and lightbox keyboard operation when media exists.
- [ ] Run assistive-technology smoke testing and reduced-motion verification.

Current blocker: no connected browser runtime was available during Sprint 15. HTTP and contract checks are complete, but no visual or interactive browser QA is claimed.

## Security and performance launch gates

- [ ] Replace local credentials with production-specific secrets held outside Git.
- [ ] Disable `InitialAdmin__Enabled` immediately after controlled production provisioning.
- [ ] Require HTTPS and exact CORS origins for website, admin, and API.
- [ ] Confirm Secure, HttpOnly, SameSite=Lax admin cookies on the production HTTPS origin.
- [x] Production-mode admin login emits Secure, HttpOnly, SameSite=Lax cookies and returns no access or refresh token in the browser-visible JSON response.
- [ ] Confirm database backups, restore drill, monitoring, log retention, dependency scanning, and incident ownership.
- [ ] Confirm no `.env.local`, production media, database volume, token, or Cloudinary secret is in Git or release artifacts.
- [ ] Run clean production builds and zero-warning validation from the reviewed commit.
- [ ] Run Lighthouse/Core Web Vitals with approved production-like content and mobile throttling.
- [ ] Validate Cloudinary delivery formats, responsive images, posters, and media budgets at realistic scale.

## Known blockers

1. Approved production homepage/event copy has not replaced local QA records.
2. Verified statistics and approved partner identities/logos have not been supplied.
3. Visual, responsive, keyboard, lightbox, poster-rendering, and assistive-technology QA remains incomplete because no browser runtime was available.
4. Approved production media and a reviewed Cloudinary transformation/delivery policy are still required.
5. Final domains, production environment revisions, official icon, monitoring, backup restore evidence, and security review remain pending.

## Ready-to-deploy criteria

The platform is ready to deploy only when every applicable unchecked item above is complete, local QA records are replaced or removed, production secrets and domains are approved, media workflows pass with disposable assets, browser/device QA passes, backups are restorable, and the release commit passes all frontend and backend build/test commands in `production-readiness.md`.
