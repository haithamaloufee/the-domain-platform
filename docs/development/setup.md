# Development setup

Frontend development requires Node.js 22 or newer and pnpm 11.12.0. Install dependencies from the repository root with `pnpm install`.

Run the public site with `pnpm --filter @the-domain/website dev` and admin with `pnpm --filter @the-domain/admin dev`; they listen on ports 3000 and 3001. The backend is optional for Sprint 5 because placeholder routes make no API calls.

Copy values from `.env.example` into app-local, untracked `.env.local` files only when overrides are required. Browser-visible configuration uses the `NEXT_PUBLIC_` prefix and must never contain secrets.

Repository checks are `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, and `pnpm build`.
