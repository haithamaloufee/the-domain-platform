# Admin dashboard

Separate Next.js App Router application for The Domain's private operations interface. Login, session management, and event operations use the ASP.NET API through a server-side BFF.

Run `pnpm --filter @the-domain/admin dev` from the repository root for local development on port 3001. The corresponding `build`, `lint`, and `typecheck` scripts validate this workspace. Admin routes are not linked from the public website.

Copy this app's `.env.example` to `.env.local`. `THE_DOMAIN_API_BASE_URL` is server-only and is used by Next.js route handlers. `THE_DOMAIN_REFRESH_COOKIE_MAX_AGE_SECONDS` should match the backend refresh-token lifetime (14 days by default). Never put signing keys or passwords in a `NEXT_PUBLIC_` variable.

The browser submits credentials only to the admin app's same-origin `/api/auth/*` routes. Access and refresh tokens are stored in `td_access_token` and `td_refresh_token` HttpOnly cookies; they are never returned to client components or stored in Web Storage. A server-side Next.js proxy validates protected dashboard requests, rotates an expired access token once when a valid refresh cookie exists, and passes only the validated safe user fields to the dashboard layout.

Admin event management is available at `/dashboard/events`, with create, detail, and edit routes beneath it. Browser components call only same-origin `/api/admin/events/*` BFF handlers. Those handlers attach the cookie-held access token server-side, rotate an expired session once, validate event payloads, and return sanitized typed responses. The list, details, shared create/edit form, and publish/archive/cancel controls use the existing backend event rules and external booking URLs.

Admin media management is available at `/dashboard/media`, with item details at `/dashboard/media/[id]`. The library provides bounded pagination and server-backed search, type, approval, orientation, category, and event filters. Uploads are explicitly started, validated in the browser for fast feedback, sent sequentially through the same-origin BFF, and validated again by the backend. An optional event assignment can be created after each successful upload. The details view supports metadata edits, approval, hiding, safe delete-by-hide, original-file access, and event assignment. Event details link to an event-scoped media view.

Event gallery management is available at `/dashboard/events/[id]/media`. It loads the event summary and enriched assignment records through same-origin BFF routes, groups assignments by usage, and provides keyboard-accessible move controls, numeric ordering, usage changes, featured toggles, and relationship-only removal. Changed assignments are saved sequentially through the existing update endpoint. Editors can search the approved global library with bounded pagination or follow the event-scoped upload shortcut; assets remain reusable across events.

Homepage CMS management is available at `/dashboard/homepage`, `/dashboard/statistics`, and `/dashboard/partners`. Browser components use only same-origin `/api/admin/homepage`, `/api/admin/statistics/*`, and `/api/admin/partners/*` BFF handlers. The handlers reuse the HttpOnly-cookie session, perform at most one refresh, reject cross-site mutations, validate CMS contracts, and return sanitized errors.

The homepage editor saves the singleton as either Draft or Published. Statistics are public only when both Visible and Verified; verification remains an explicit editorial decision. Partners are public only when Visible, and logo fields reference an approved absolute URL rather than uploading a file. DELETE for statistics and partners is a reversible soft-hide operation and does not remove database records or external media.

To test CMS locally, apply the approved backend migrations, start the API on port 5000 and admin on port 3001, then sign in at `/login`. Save homepage copy as Draft and verify that the public fallback remains; publish it and verify the website after its development no-cache request or production revalidation window. Create statistics and confirm that only Visible + Verified records appear publicly. Create partners and confirm that only Visible records appear. Hide and soft-delete actions must preserve the records in the admin list. Do not invent business facts, partner identities, or logo URLs for testing.

Cloudinary configuration is needed only for media upload testing, not CMS text/statistic/partner management. Dashboard metrics, password management, user administration, rich text, partner logo upload, final cinematic animation polish, and bulk media migration remain out of scope.

The frontend workspace does not yet include a test runner. The admin integration is validated through strict TypeScript, zero-warning ESLint, and production builds rather than introducing an unplanned testing stack; route-level integration tests should be added with the dedicated frontend testing foundation.

## Production configuration

Deploy admin on a dedicated HTTPS origin. `THE_DOMAIN_API_BASE_URL` must be an absolute HTTP(S) URL available only to the Next.js server; no API credentials, signing keys, or Cloudinary values belong in this app. Production auth cookies are automatically Secure as well as HttpOnly and SameSite=Lax. Keep `THE_DOMAIN_REFRESH_COOKIE_MAX_AGE_SECONDS` aligned with the backend refresh-token lifetime.

The root metadata prevents indexing, unauthenticated dashboard routes remain protected by the server proxy, and the public website contains no admin link. Follow `docs/deployment/production-readiness.md` for CORS, provisioning, smoke testing, and rollback.
