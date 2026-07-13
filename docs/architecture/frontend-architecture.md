# Frontend architecture

The frontend is a pnpm workspace with two independent Next.js App Router applications. `apps/website` owns the public experience; `apps/admin` owns private operations and never appears in public navigation.

Shared boundaries are deliberate:

- `packages/ui` contains accessible Cinematic Noir primitives and design tokens, not app-specific navigation or business features.
- `packages/types` contains framework-neutral API contracts.
- `packages/utils` contains framework-neutral helpers and the typed fetch client foundation.
- `packages/config` contains strict TypeScript and Next.js ESLint defaults.

Both apps default to React Server Components. Client components are introduced only where browser interaction requires them. Public website API reads use a website-owned, server-only fetch boundary with runtime contract validation; browser components never receive an API origin. Development requests use `no-store`, while production requests revalidate every 60 seconds.

Public routes are `/`, `/events`, `/events/[slug]`, `/gallery`, `/gallery/[eventSlug]`, `/about`, `/services`, and `/contact`. The public website remains authentication-free.

## Public events and gallery boundary

The public Events and Gallery pages are Server Components backed only by anonymous `/api/public/*` endpoints. Event summary requests expose one approved cover item instead of the event's media collection. Event details expose approved ordered media, long-form copy, location, map, computed status, and an external booking URL only while booking is open. The client countdown is isolated to a small component and stops when the event begins.

Gallery album summaries expose cover and media counts. Full ordered gallery metadata is fetched only for `/gallery/[eventSlug]`, where the client grid filters the already-bounded album data and reveals it in batches of 24. Image optimization, inert video thumbnails, metadata-only playback, and a shared accessible dialog keep media-heavy pages responsive without introducing browser-side API calls.

## Public homepage composition

The `/` route composes `getFeaturedEvents`, `getUpcomingEvents`, `getPreviousEvents`, and `getGalleryAlbums` in one Server Component boundary. Requests run concurrently and settle independently, allowing an unavailable public endpoint to degrade only its own section. Featured and upcoming results are deduplicated before a bounded preview is rendered; previous events and albums are separately limited. The hero uses an approved cover or thumbnail when available and falls back to a media-free branded surface without requesting a video source.

Homepage presentation is split into small server components under `apps/website/src/components/home`. Non-API editorial content is typed and centralized in `apps/website/src/content/homepage-content.ts`. This file is an explicit temporary adapter for statistics, services, partners, and section copy; a future homepage CMS can replace its values while retaining the section components and public data boundary.

Sprint 12B composes `getPublicHomepage`, `getPublicStatistics`, and `getPublicPartners` alongside the existing event/gallery requests. Each CMS request settles independently. Published content replaces only matching editorial fields; missing or unpublished content keeps the Sprint 11 adapter. Empty statistic and partner collections preserve their non-fabricated awaiting-data states. Services remain local because service management is a separate future module rather than part of the homepage CMS persistence model.

## Public presentation and motion layer

Sprint 13 keeps cinematic polish at the presentation boundary. Reusable shell components own navigation, footer, and branded loading treatment; route components retain their existing server-side API ownership. The shared `cinematic-card`, `cinematic-media`, `architectural-grid`, and `cinematic-reveal` classes provide a consistent Noir language without moving business data into client components.

Scroll reveals use progressive CSS view timelines and degrade to fully visible content where unsupported. Reduced-motion preferences remove transforms, filtering, and loader movement. The only new stateful homepage behavior is the numeric statistic counter, isolated in a small client component and driven by `IntersectionObserver`; arbitrary CMS text is never coerced into an animation. Mobile navigation is a separate accessible disclosure inside the public header and does not expose admin routes.

## Admin authentication boundary

Admin authentication uses a lightweight BFF. Browser requests target same-origin Next.js route handlers under `/api/auth`; those handlers call the ASP.NET API through the server-only `THE_DOMAIN_API_BASE_URL`. Raw access and refresh tokens are stored only in HttpOnly, SameSite=Lax cookies and are never exposed to React components or Web Storage.

The login and dashboard pages validate the current user server-side. A Next.js proxy protects `/dashboard/:path*`, requires a successful backend `/api/auth/me` response, and rotates an expired access token once when a valid refresh cookie exists. It forwards only safe validated user fields to the dashboard layout through an internal request header. The BFF `me` endpoint follows the same one-refresh, one-retry limit. Feature API integration should reuse this server boundary rather than sending refresh tokens to the browser.

## Admin events boundary

Authenticated event pages live under `/dashboard/events`. Interactive components call only the admin application's same-origin `/api/admin/events/*` handlers. A reusable server-only authorized request helper reads HttpOnly cookies, retries once after refresh when necessary, and never serializes tokens into a page or client response.

Shared event contracts live in `packages/types`. The admin app validates backend event responses at its boundary and sanitizes backend errors before returning them to browser components. Create and edit share one form component, while event display status and booking availability remain backend-computed values.

## Admin media boundary

Authenticated media pages live under `/dashboard/media`. Browser components call only same-origin handlers under `/api/admin/media/*` and `/api/admin/events/*/media`; Cloudinary credentials and bearer tokens remain server-side. The BFF reconstructs uploads as multipart requests, permits only known metadata fields and filters, validates response shapes, and returns sanitized failures.

Media contracts are shared through `packages/types`. The library requests one bounded page at a time, images use the Next.js image pipeline, grid videos use thumbnails or inert placeholders, and the details player loads metadata only until the operator starts playback. Multi-file uploads run sequentially to control memory and network pressure. Event assignment is available during upload and from item details; cross-assignment reordering is reserved for the gallery-management workflow.

## Admin event gallery boundary

The dedicated `/dashboard/events/[id]/media` route combines existing event details with an event-scoped assignment list. The backend read DTO nests safe media metadata beneath each real assignment identifier; the BFF validates that shape before browser code receives it. No EF entities, bearer tokens, Cloudinary identifiers, or storage credentials cross the boundary.

The editor groups assignments by usage and keeps draft changes in component state. Move controls normalize sort order within one usage group, while usage, sort order, and featured changes persist sequentially through the existing assignment update route. The approved-media picker requests one bounded global-library page at a time. Uploading reuses the global upload queue with the event preselected rather than duplicating file handling.

## Admin homepage CMS boundary

Authenticated editors manage homepage copy, statistics, and partners at `/dashboard/homepage`, `/dashboard/statistics`, and `/dashboard/partners`. Client components call only same-origin BFF handlers under `/api/admin/homepage`, `/api/admin/statistics/*`, and `/api/admin/partners/*`. A CMS route layer reuses the authorized backend request helper, rejects cross-site mutations, validates request and response contracts, and sanitizes backend failures.

Homepage content has an explicit Draft/Published state. Statistics require both Visible and Verified to enter public projections. Partners require Visible; Featured affects presentation priority but does not bypass visibility. DELETE is documented and presented as reversible soft-hide. Partner logos remain URL references in this sprint, so the media upload architecture is unchanged.
