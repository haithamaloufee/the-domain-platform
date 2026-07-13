# Admin dashboard

Separate Next.js App Router application for The Domain's private operations interface. Login and session management use the existing ASP.NET authentication endpoints through a server-side BFF; dashboard business modules remain placeholders.

Run `pnpm --filter @the-domain/admin dev` from the repository root for local development on port 3001. The corresponding `build`, `lint`, and `typecheck` scripts validate this workspace. Admin routes are not linked from the public website.

Copy this app's `.env.example` to `.env.local`. `THE_DOMAIN_API_BASE_URL` is server-only and is used by Next.js route handlers. `THE_DOMAIN_REFRESH_COOKIE_MAX_AGE_SECONDS` should match the backend refresh-token lifetime. Never put signing keys or passwords in a `NEXT_PUBLIC_` variable.

The browser submits credentials only to the admin app's same-origin `/api/auth/*` routes. Access and refresh tokens are stored in `td_access_token` and `td_refresh_token` HttpOnly cookies; they are never returned to client components or stored in Web Storage. The dashboard layout validates the access token with the backend before rendering identity.

To test locally, provision the SuperAdmin through the Sprint 6A setup, start the backend on port 5000, then start admin on port 3001 and sign in at `/login`. Authentication integration does not add event/media management, dashboard metrics, password management, or user administration UI.

The frontend workspace does not yet include a test runner. Sprint 6B is validated through strict TypeScript, zero-warning ESLint, and production builds rather than introducing an unplanned testing stack; route-level integration tests should be added with the dedicated frontend testing foundation.
