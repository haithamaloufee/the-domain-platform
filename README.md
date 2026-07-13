# The Domain Platform

The Domain Platform is the digital platform for The Domain Entertainment Company in Jordan. It comprises a premium public events website, a separate content-management dashboard, and an ASP.NET Core API. The engineering and product source of truth is [THE_DOMAIN_DEVELOPER_BIBLE.md](THE_DOMAIN_DEVELOPER_BIBLE.md).

The repository includes the Clean Architecture backend, public event/gallery/homepage APIs, the private admin BFF and management workflows, and the production-polished public website. Provider-neutral launch preparation is documented in [docs/deployment/production-readiness.md](docs/deployment/production-readiness.md).

## Repository layout

- `apps/website` — future public Next.js website.
- `apps/admin` — future private Next.js admin dashboard.
- `apps/backend` — future ASP.NET Core Web API and Clean Architecture projects.
- `packages/ui` — future shared frontend primitives and design-system components.
- `packages/types` — future shared TypeScript contracts.
- `packages/config` — future shared frontend and tooling configuration.
- `packages/utils` — future framework-agnostic TypeScript utilities.
- `docs` — design sources, architecture records, API notes, and engineering guidance.
- `docker` — future local and deployment container configuration.
- `assets` — policy-controlled local sample assets; never the production media library.

## Development approach

Work proceeds incrementally according to the sprint sequence in the Developer Bible. Each app will be scaffolded only when its foundation is approved. Architecture and API documentation should evolve with implementation, and significant decisions should be recorded before they become difficult to reverse.

Stitch exports are visual references only. Their HTML must not be copied into production applications. Production interfaces will be rebuilt with typed, accessible, reusable components and design tokens.

## Media policy

Do not commit production images, videos, uploads, database volumes, or secrets. Production media belongs in Cloudinary or approved object storage; the database stores metadata and URLs only. `assets/sample-media` is limited to a few lightweight, license-safe test assets, while `assets/raw-media` remains ignored.

Frontend setup and validation commands are documented in `docs/development/setup.md`. Run `pnpm install` before using either Next.js application.

The backend foundation is now available under `apps/backend`; its restore, build, run, and test commands are documented in `apps/backend/README.md`.

## Local runtime

The full local sequence is documented in `docs/development/setup.md`: install prerequisites, copy and replace the example environment values, start PostgreSQL with `docker/compose/docker-compose.local.yml`, apply the existing EF migrations, then start the API, admin, and website. Local ports are PostgreSQL 5432, API 5000, website 3000, and admin 3001.

Committed defaults and examples contain no production secrets. Cloudinary remains disabled, and the local initial-admin credentials must never be reused outside an isolated development environment.
