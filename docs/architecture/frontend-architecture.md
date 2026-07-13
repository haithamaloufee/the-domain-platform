# Frontend architecture

The frontend is a pnpm workspace with two independent Next.js App Router applications. `apps/website` owns the public experience; `apps/admin` owns private operations and never appears in public navigation.

Shared boundaries are deliberate:

- `packages/ui` contains accessible Cinematic Noir primitives and design tokens, not app-specific navigation or business features.
- `packages/types` contains framework-neutral API contracts.
- `packages/utils` contains framework-neutral helpers and the typed fetch client foundation.
- `packages/config` contains strict TypeScript and Next.js ESLint defaults.

Both apps default to React Server Components. Client components are introduced only where browser interaction requires them. API work uses the shared client factory with app-owned environment configuration; Sprint 5 placeholders perform no requests.

Public routes are `/`, `/events`, `/events/[slug]`, `/gallery`, `/gallery/[eventSlug]`, `/about`, `/services`, and `/contact`. Admin uses `/login` and dashboard modules. Real protection must be implemented with authentication integration rather than simulated in the frontend.
