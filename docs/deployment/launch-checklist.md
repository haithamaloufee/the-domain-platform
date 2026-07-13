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

- [ ] Configure `Cloudinary__Enabled=true` in the API process.
- [ ] Configure server-only `Cloudinary__CloudName`, `Cloudinary__ApiKey`, and `Cloudinary__ApiSecret`.
- [ ] Upload a disposable approved image and video through admin; do not commit either file.
- [ ] Verify Draft, Approved, Hidden, and delete-by-hide behavior.
- [ ] Assign approved media as Cover, Hero, Gallery, HomepagePreview, and PreviousEventPreview where editorially appropriate.
- [ ] Verify featured selection, ordering persistence, relationship-only removal, and reuse across events.
- [ ] Verify gallery album projection, photo/video filters, lightbox keyboard behavior, poster use, and no grid autoplay.
- [ ] Establish production Cloudinary transformations, image sizing, and video poster/thumbnail policy.

Current blocker: Cloudinary is disabled and credentials are not configured, so media upload APIs return the expected unavailable response and no gallery album can be created from new media.

## Admin workflow evidence

- [x] Valid SuperAdmin login succeeds through the same-origin admin BFF.
- [x] `/dashboard` redirects unauthenticated requests to `/login`.
- [x] Authenticated dashboard, events, media, homepage, statistics, and partners pages return HTTP 200.
- [x] Logout succeeds and protected navigation redirects afterward.
- [x] Homepage save as Draft and save/publish behavior persists and changes the public projection.
- [x] Event create, edit, publish, cancel, and archive actions persist correctly.
- [x] Archived events return public HTTP 404.
- [ ] Statistics create/edit/show/hide/delete was not exercised because no verified business value was supplied.
- [ ] Partners create/edit/show/hide/delete was not exercised because no approved partner identity was supplied.
- [ ] Media and event-media workflows remain blocked by Cloudinary configuration.
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
- [ ] Confirm database backups, restore drill, monitoring, log retention, dependency scanning, and incident ownership.
- [ ] Confirm no `.env.local`, production media, database volume, token, or Cloudinary secret is in Git or release artifacts.
- [ ] Run clean production builds and zero-warning validation from the reviewed commit.
- [ ] Run Lighthouse/Core Web Vitals with approved production-like content and mobile throttling.
- [ ] Validate Cloudinary delivery formats, responsive images, posters, and media budgets at realistic scale.

## Known blockers

1. Approved production homepage/event copy has not replaced local QA records.
2. Verified statistics and approved partner identities/logos have not been supplied.
3. Cloudinary is not configured, so media/gallery end-to-end QA is incomplete.
4. Visual, responsive, keyboard, lightbox, and assistive-technology QA remains incomplete because no browser runtime was available.
5. Final domains, production environment revisions, official icon, monitoring, backup restore evidence, and security review remain pending.

## Ready-to-deploy criteria

The platform is ready to deploy only when every applicable unchecked item above is complete, local QA records are replaced or removed, production secrets and domains are approved, media workflows pass with disposable assets, browser/device QA passes, backups are restorable, and the release commit passes all frontend and backend build/test commands in `production-readiness.md`.
