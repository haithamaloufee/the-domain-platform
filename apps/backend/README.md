# The Domain Backend

ASP.NET Core Web API for The Domain Platform, targeting .NET 8. The solution contains authentication, events, media metadata, gallery projections, and the homepage CMS foundation while preserving Clean Architecture boundaries.

## Solution structure

- `TheDomain.Api` — HTTP composition root, endpoints, middleware, configuration, OpenAPI, health checks, CORS, and logging.
- `TheDomain.Application` — application use-case boundary and service registration.
- `TheDomain.Domain` — dependency-free domain boundary.
- `TheDomain.Infrastructure` — future persistence and external-service implementations.
- `TheDomain.Shared` — framework-independent shared contracts.
- `tests` — API integration and layer-specific test projects.

## Commands

Run these commands from `apps/backend`:

```powershell
dotnet restore
dotnet build --no-restore
dotnet run --project src/TheDomain.Api
dotnet test --no-build
```

In Development, Swagger UI is available at `http://localhost:5000/swagger`, health status at `/health`, and API metadata at `/api/info`. The local HTTP port is defined in `src/TheDomain.Api/Properties/launchSettings.json`.

## Configuration

`Api` and `Cors` settings are strongly typed and validated at startup. Development permits only the local website and admin origins. Production startup requires at least one explicitly configured origin; wildcard origins are not enabled.

PostgreSQL persistence is implemented in `TheDomain.Infrastructure` with EF Core and the Npgsql provider. Persistence is disabled by default so the foundation can run without silently depending on a local database. To enable it, set untracked environment values:

```powershell
$env:Database__Enabled = 'true'
$env:Database__ConnectionString = 'Host=localhost;Port=5432;Database=the_domain;Username=the_domain;Password=<local-password>'
```

When enabled, startup validates the connection string and `/health` includes PostgreSQL connectivity. `Database__CommandTimeoutSeconds` defaults to 30.

The design-time context factory reads `Database__ConnectionString`. After an approved model exists, migrations will be created from `apps/backend` with:

```powershell
dotnet ef migrations add <MigrationName> --project src/TheDomain.Infrastructure --startup-project src/TheDomain.Api --output-dir Persistence/Migrations
dotnet ef database update --project src/TheDomain.Infrastructure --startup-project src/TheDomain.Api
```

The first migration, `AddIdentitySchema`, contains only the approved internal identity tables and indexes.

For the complete local PostgreSQL and environment-variable sequence, follow `docs/development/setup.md`. The abbreviated migration workflow from `apps/backend` is:

```powershell
dotnet tool restore
dotnet ef database update --project src/TheDomain.Infrastructure --startup-project src/TheDomain.Api
dotnet run --project src/TheDomain.Api
```

The shell running these commands must already contain the values from the root `.env.local`; ASP.NET Core does not load that dotenv file automatically.

## Admin authentication

Admin authentication is disabled by default. Enable it only with untracked configuration containing an issuer, audience, and signing key of at least 32 UTF-8 bytes:

```powershell
$env:Authentication__Enabled = 'true'
$env:Authentication__Issuer = 'TheDomain.Api.Local'
$env:Authentication__Audience = 'TheDomain.Admin.Local'
$env:Authentication__SigningKey = '<strong-random-local-key>'
```

Access tokens default to 15 minutes. Refresh tokens default to 14 days, are rotated on use, and are stored only as SHA-256 hashes. Authentication endpoints are `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, and protected `/api/auth/me`. Public registration is not available.

Refresh-token identifiers are assigned by the application and explicitly mapped as non-generated EF keys. This ensures login and rotation insert new token rows while updating the tracked user or prior token in the same transaction.

Initial SuperAdmin provisioning is disabled by default. It runs only when persistence, authentication, and `InitialAdmin__Enabled` are all enabled and only when no user exists. Configure its email, full name, and a strong password through untracked environment values. The password is hashed and never logged.

For local provisioning, apply migrations before the first API startup. Once the SuperAdmin exists, set `InitialAdmin__Enabled=false` for subsequent runs. The local password must be changed before any shared or real deployment.

The committed local tool manifest pins `dotnet-ef` 8.0.11. Run `dotnet tool restore` before migration commands on a new workstation. The first migration is `AddIdentitySchema`.

Serilog writes structured events to the console only. Production exceptions return RFC-style Problem Details without exception messages or stack traces.

## Production operations

Swagger and Swagger UI are registered only in Development. Production must configure exact `Cors__AllowedOrigins__0..n` HTTPS origins, a TLS-enabled PostgreSQL connection, deployment-specific JWT issuer/audience/signing key, and server-only Cloudinary credentials. Apply committed migrations from a controlled release job before starting the new API version; never generate migrations during deployment.

Use `/health` for health monitoring and `/api/info` for release smoke checks. After the first controlled SuperAdmin provisioning succeeds, disable `InitialAdmin__Enabled` and remove the plaintext bootstrap password from runtime configuration. See `docs/deployment/production-readiness.md` for the full release, backup, rollback, and smoke-test sequence.

## Intentionally not implemented

Public registration, full user CRUD, campaigns, contact submission, homepage CMS administration UI, frontend CMS consumption, and public authentication remain outside this sprint.

## Events and media metadata

The event aggregate supports Draft, Published, Cancelled, and Archived lifecycle states. Public display status and external-booking availability are computed from UTC schedule data at request time. Public APIs expose upcoming, previous, featured, detail, and event-based gallery album projections. Admin event APIs require `AdminDashboardAccess`.

`MediaAsset` stores descriptive metadata and external URLs only. `EventMedia` assigns approved assets to event usages and ordering. The migration `AddEventsAndMediaMetadata` creates the approved event and metadata schema.

## Cloudinary media management

Cloudinary integration is disabled by default. Configure `Cloudinary__Enabled`, cloud name, API key, API secret, folder prefix, and size/MIME policy through untracked environment values. Images default to JPEG/PNG/WebP up to 15 MB; videos default to MP4/WebM up to 100 MB.

Admin media APIs provide single-file upload, bounded pagination, metadata editing, approve/hide lifecycle, safe deletion by hiding, and event-media assignment. PostgreSQL stores metadata and URLs only. Cloudinary deletion is limited to compensation when an upload succeeds but metadata persistence fails.

## Homepage CMS

The homepage CMS stores one application-identified content record, verified statistics, and partner/sponsor metadata. `GET /api/public/homepage` returns published content plus visible verified statistics and visible partners. Standalone reads are available at `/api/public/statistics` and `/api/public/partners`. Before content is published, the aggregate response contains `content: null`; empty statistic and partner arrays are valid.

Protected `/api/admin/homepage`, `/api/admin/statistics`, and `/api/admin/partners` routes prepare the Sprint 12B admin workflow. They require `AdminDashboardAccess`, validate explicit DTOs, enforce unique partner slugs, and implement statistic/partner deletion as soft hide. The `AddHomepageCms` migration creates the three tables and indexes without seeding content, metrics, partners, logos, or media.
