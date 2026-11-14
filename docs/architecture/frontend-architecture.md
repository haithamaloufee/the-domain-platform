# Frontend architecture

The frontend is a pnpm workspace with two independent Next.js App Router applications. `apps/website` owns the public experience; `apps/admin` owns private operations and never appears in public navigation.

Shared boundaries are deliberate:

- `packages/ui` contains accessible Cinematic Noir primitives and design tokens, not app-specific navigation or business features.
- `packages/types` contains framework-neutral API contracts.
- `packages/utils` contains framework-neutral helpers and the typed fetch client foundation.
- `packages/config` contains strict TypeScript and Next.js ESLint defaults.

Both apps default to React Server Components. Client components are introduced only where browser interaction requires them. Public Website getters use a server-only, runtime-validated boundary, `cache: "no-store"` for persistence semantics, and React `cache()` for request-scope memoization. Backend Output Cache supplies cross-request caching and tag eviction.

Public routes are `/`, `/events`, `/events/[slug]`, `/gallery`, `/gallery/[eventSlug]`, `/about`, `/services`, and `/contact`. The public website remains authentication-free.

## Public events and gallery boundary

The public Events and Gallery pages are Server Components backed only by anonymous `/api/public/*` endpoints. Event summary requests expose one approved cover item instead of the event's media collection. Event details expose approved ordered media, long-form copy, location, map, computed status, and an external booking URL only while booking is open. The client countdown is isolated to a small component and stops when the event begins.

Gallery album summaries expose cover and media counts. Full ordered gallery metadata is fetched only for `/gallery/[eventSlug]`, where the client grid filters the already-bounded album data and reveals it in batches of 24. Image optimization, inert video thumbnails, metadata-only playback, and a shared accessible dialog keep media-heavy pages responsive without introducing browser-side API calls.

## Public homepage composition

The `/` route awaits one memoized `getPublicHomepage` read before emitting its page tree. This removes the former Hero/Footer-first stream while retaining independent Layout Suspense boundaries for dynamic Header-logo and Footer branding. API failure still renders every static section shell with code-owned empty states.

Homepage presentation remains split into small Server Components under `apps/website/src/components/home`. Typed editorial modules under `apps/website/src/content` own exact wording and fixed CTAs. `HOMEPAGE_SECTION_ORDER` is the single composition authority and preserves the published order: Statistics, Events, Why, Previous Events, Gallery, Services, Partners, Contact. Public/admin contracts contain no ordering or visibility fields.

The consolidated response bounds current events to two, previous events to two, a selected collection to one cover plus counts (or three fallback albums), and statistics to slots 1-4; it returns all visible partners. Static text never crosses the API. Hero and floating-video media remain CMS-owned, and video sources remain deferred.

## Public presentation and motion layer

Sprint 13 keeps cinematic polish at the presentation boundary. Reusable shell components own navigation, footer, and branded loading treatment; route components retain their existing server-side API ownership. The shared `cinematic-card`, `cinematic-media`, `architectural-grid`, and `cinematic-reveal` classes provide a consistent Noir language without moving business data into client components.

Scroll reveals use progressive CSS view timelines and degrade to fully visible content where unsupported. Reduced-motion preferences remove transforms, filtering, and loader movement. The only new stateful homepage behavior is the numeric statistic counter, isolated in a small client component and driven by `IntersectionObserver`; arbitrary CMS text is never coerced into an animation. Mobile navigation is a separate accessible disclosure inside the public header and does not expose admin routes.

## Public SEO and discovery boundary

The public application uses `NEXT_PUBLIC_WEBSITE_URL` as its single canonical origin and validates supplied website/API origins as absolute HTTP(S) URLs. A shared metadata helper keeps canonicals, Open Graph, and Twitter fields consistent. Dynamic event and album metadata comes only from the runtime-validated anonymous public API and uses approved image URLs or video thumbnails; failed metadata reads return a non-indexable fallback.

`sitemap.ts` combines static public routes with the existing upcoming, previous, featured, and gallery-album projections. Each request settles independently, so API unavailability leaves a valid static sitemap and does not break the build. `robots.ts` blocks all crawling in development or when the canonical origin is missing; configured production builds permit public routes, disallow admin-like/API paths, and advertise the sitemap. JSON-LD is serialized with `<` escaped and contains only Organization/WebSite identity plus real public event fields. No admin data, credentials, unverified contact details, or invented offers enter SEO output.

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

Authenticated editors manage Homepage publication/media, statistic values, and partners at `/dashboard/homepage`, `/dashboard/statistics`, and `/dashboard/partners`. They cannot edit static copy, fixed CTAs, section order, or section visibility. Client components call only same-origin BFF handlers and retain the existing authenticated CMS route boundary.

Homepage content has an explicit Draft/Published state. Statistics require both Visible and Verified to enter public projections. Partners require Visible; Featured affects presentation priority but does not bypass visibility. DELETE is documented and presented as reversible soft-hide. Partner logos remain URL references in this sprint, so the media upload architecture is unchanged.
