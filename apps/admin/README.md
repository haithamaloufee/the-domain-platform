# Admin dashboard

Separate Next.js App Router application for The Domain's private operations interface. Login, session management, and event operations use the ASP.NET API through a server-side BFF.

Run `pnpm --filter @the-domain/admin dev` from the repository root for local development on port 3001. The corresponding `build`, `lint`, and `typecheck` scripts validate this workspace. Admin routes are not linked from the public website.

Copy this app's `.env.example` to `.env.local`. `THE_DOMAIN_API_BASE_URL` is server-only and is used by Next.js route handlers. `THE_DOMAIN_REFRESH_COOKIE_MAX_AGE_SECONDS` should match the backend refresh-token lifetime (14 days by default). Never put signing keys or passwords in a `NEXT_PUBLIC_` variable.

The browser submits credentials only to the admin app's same-origin `/api/auth/*` routes. Access and refresh tokens are stored in `td_access_token` and `td_refresh_token` HttpOnly cookies; they are never returned to client components or stored in Web Storage. A server-side Next.js proxy validates protected dashboard requests, rotates an expired access token once when a valid refresh cookie exists, and passes only the validated safe user fields to the dashboard layout.

Admin event management is available at `/dashboard/events`, with create, detail, and edit routes beneath it. Browser components call only same-origin `/api/admin/events/*` BFF handlers. Those handlers attach the cookie-held access token server-side, rotate an expired session once, validate event payloads, and return sanitized typed responses. The list, details, shared create/edit form, and publish/archive/cancel controls use the existing backend event rules and external booking URLs.

To test locally, provision the SuperAdmin through the Sprint 6A setup, start the backend on port 5000, then start admin on port 3001 and sign in at `/login`. Event media assignment and upload, dashboard metrics, password management, and user administration remain intentionally out of scope. The next media sprint can link assets to the event identifiers managed here without changing the event form.

The frontend workspace does not yet include a test runner. Sprint 6B is validated through strict TypeScript, zero-warning ESLint, and production builds rather than introducing an unplanned testing stack; route-level integration tests should be added with the dedicated frontend testing foundation.
