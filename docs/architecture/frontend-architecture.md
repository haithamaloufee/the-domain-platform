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

The login and dashboard pages validate the current user server-side. The dashboard layout requires a successful backend `/api/auth/me` response before rendering user identity. The BFF `me` endpoint may rotate the refresh token once and retry identity once. Feature API integration should reuse this server boundary rather than sending refresh tokens to the browser.
