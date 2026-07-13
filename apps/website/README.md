# Public website

Next.js App Router foundation for The Domain’s public experience. It provides global metadata, accessible navigation, branded framework states, the approved route map, and a typed API client boundary. Feature content and live API reads are intentionally absent.

Run `pnpm --filter @the-domain/website dev` from the repository root for local development on port 3000. The corresponding `build`, `lint`, and `typecheck` scripts validate this workspace. Override `NEXT_PUBLIC_API_BASE_URL` in an untracked `.env.local` only when needed.

Copy this app's `.env.example` to `.env.local` to target the local API at `http://localhost:5000`. `NEXT_PUBLIC_` values are visible in the browser and must not contain credentials.
