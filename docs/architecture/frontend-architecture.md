# Frontend architecture

The frontend is a pnpm workspace with two independent Next.js App Router applications. `apps/website` owns the public experience; `apps/admin` owns private operations and never appears in public navigation.

Shared boundaries are deliberate:

- `packages/ui` contains accessible Cinematic Noir primitives and design tokens, not app-specific navigation or business features.
- `packages/types` contains framework-neutral API contracts.
- `packages/utils` contains framework-neutral helpers and the typed fetch client foundation.
- `packages/config` contains strict TypeScript and Next.js ESLint defaults.

Both apps default to React Server Components. Client components are introduced only where browser interaction requires them. API work uses the shared client factory with app-owned environment configuration; Sprint 5 placeholders perform no requests.

Public routes are `/`, `/events`, `/events/[slug]`, `/gallery`, `/gallery/[eventSlug]`, `/about`, `/services`, and `/contact`. The public website remains authentication-free.

## Admin authentication boundary

Admin authentication uses a lightweight BFF. Browser requests target same-origin Next.js route handlers under `/api/auth`; those handlers call the ASP.NET API through the server-only `THE_DOMAIN_API_BASE_URL`. Raw access and refresh tokens are stored only in HttpOnly, SameSite=Lax cookies and are never exposed to React components or Web Storage.

The login and dashboard pages validate the current user server-side. A Next.js proxy protects `/dashboard/:path*`, requires a successful backend `/api/auth/me` response, and rotates an expired access token once when a valid refresh cookie exists. It forwards only safe validated user fields to the dashboard layout through an internal request header. The BFF `me` endpoint follows the same one-refresh, one-retry limit. Feature API integration should reuse this server boundary rather than sending refresh tokens to the browser.

## Admin events boundary

Authenticated event pages live under `/dashboard/events`. Interactive components call only the admin application's same-origin `/api/admin/events/*` handlers. A reusable server-only authorized request helper reads HttpOnly cookies, retries once after refresh when necessary, and never serializes tokens into a page or client response.

Shared event contracts live in `packages/types`. The admin app validates backend event responses at its boundary and sanitizes backend errors before returning them to browser components. Create and edit share one form component, while event display status and booking availability remain backend-computed values.

## Admin media boundary

Authenticated media pages live under `/dashboard/media`. Browser components call only same-origin handlers under `/api/admin/media/*` and `/api/admin/events/*/media`; Cloudinary credentials and bearer tokens remain server-side. The BFF reconstructs uploads as multipart requests, permits only known metadata fields and filters, validates response shapes, and returns sanitized failures.

Media contracts are shared through `packages/types`. The library requests one bounded page at a time, images use the Next.js image pipeline, grid videos use thumbnails or inert placeholders, and the details player loads metadata only until the operator starts playback. Multi-file uploads run sequentially to control memory and network pressure. Event assignment is available during upload and from item details; cross-assignment reordering is reserved for the gallery-management workflow.
