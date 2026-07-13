# Public website

Next.js App Router application for The Domain's public experience. The Events and Gallery journeys read live public data from the ASP.NET API through a server-only, runtime-validated boundary. The website has no authentication or admin navigation.

Run `pnpm --filter @the-domain/website dev` from the repository root for local development on port 3000. The corresponding `build`, `lint`, and `typecheck` scripts validate this workspace.

Copy this app's `.env.example` to `.env.local` and set the server-only `THE_DOMAIN_API_BASE_URL` when the API does not use `http://localhost:5000`. Public API reads use no cache during development and a 60-second revalidation window in production. `NEXT_PUBLIC_` values are visible in the browser and must not contain credentials.

Public routes implemented in Sprint 10 are `/events`, `/events/[slug]`, `/gallery`, and `/gallery/[eventSlug]`. Event booking always opens the backend-provided external URL; no ticketing flow exists in this application. Event lists receive only one approved cover-media projection, gallery lists receive cover and count metadata, and full ordered media metadata is requested only on detail pages. Gallery videos never autoplay and mount their player only after the visitor opens the lightbox.
