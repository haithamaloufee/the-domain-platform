# Public website

Next.js App Router application for The Domain's public experience. The Events and Gallery journeys read live public data from the ASP.NET API through a server-only, runtime-validated boundary. The website has no authentication or admin navigation.

Run `pnpm --filter @the-domain/website dev` from the repository root for local development on port 3000. The corresponding `build`, `lint`, and `typecheck` scripts validate this workspace.

Copy this app's `.env.example` to `.env.local` and set the server-only `THE_DOMAIN_API_BASE_URL` when the API does not use `http://localhost:5000`. Public API reads use no cache during development and a 60-second revalidation window in production. `NEXT_PUBLIC_` values are visible in the browser and must not contain credentials.

Public routes implemented in Sprint 10 are `/events`, `/events/[slug]`, `/gallery`, and `/gallery/[eventSlug]`. Event booking always opens the backend-provided external URL; no ticketing flow exists in this application. Event lists receive only one approved cover-media projection, gallery lists receive cover and count metadata, and full ordered media metadata is requested only on detail pages. Gallery videos never autoplay and mount their player only after the visitor opens the lightbox.

Sprint 11 integrates `/` with the same public boundary. The homepage requests featured, upcoming, previous, and gallery-album summaries concurrently on the server, tolerates individual endpoint failures, and limits each visible preview. Featured approved cover metadata may frame the hero; the page never requests event-detail media or eagerly mounts video. Static editorial copy, unverified-stat placeholders, services, and the partners empty state live in `src/content/homepage-content.ts` so they can be replaced by a future homepage CMS without restructuring the page.

Homepage sections are Hero, Featured/Upcoming Events, Statistics, Why The Domain, Previous Events, Gallery Preview, Services, Partners/Sponsors, and Contact CTA. Statistics intentionally display an em dash with “Awaiting verified data,” and the partners section contains no invented names or logos. Homepage CMS administration UI, public CMS rendering, contact submission, discounts, analytics, and heavy animation polish remain intentionally unimplemented.

Sprint 12B connects those runtime-validated helpers to `/` without changing the established composition. Published CMS content replaces matching hero, section, and contact copy; missing or unpublished content keeps the complete Sprint 11 local fallback. Visible + Verified statistics replace the safe “Awaiting verified data” state, while Visible partners replace the data-ready partner placeholder. The requests settle independently and retain the 60-second production revalidation behavior. Services remain local because service management is a separate module. The public website remains login-free and contains no admin navigation or draft fields.
