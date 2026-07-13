# Admin dashboard

Separate Next.js App Router foundation for The Domain’s private operations interface. It includes a non-functional login surface, dashboard shell, and placeholder module routes. Authentication, authorization, metrics, mutations, and backend integration are intentionally absent.

Run `pnpm --filter @the-domain/admin dev` from the repository root for local development on port 3001. The corresponding `build`, `lint`, and `typecheck` scripts validate this workspace. Admin routes are not linked from the public website.
