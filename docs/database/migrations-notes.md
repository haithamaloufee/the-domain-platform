# Migration notes

EF Core migrations will live in `src/TheDomain.Infrastructure/Persistence/Migrations` and use `TheDomain.Api` as the startup project. The design-time factory requires an untracked `Database__ConnectionString` environment value.

`AddIdentitySchema` is the first migration. It creates `application_users`, `refresh_tokens`, their foreign key, the unique normalized-email and token-hash indexes, and the user/expiry lookup index. It contains no seed credentials or business tables.

`AddEventsAndMediaMetadata` creates `events`, `media_assets`, and `event_media` with schedule/publication/homepage indexes and association constraints. It stores no media binaries or seed content.

Sprint 6C creates no migration. The authentication persistence repair declares application-assigned refresh-token GUIDs as non-generated EF keys; it changes change-tracking metadata only and does not alter the existing PostgreSQL schema.

`AddHomepageCms` creates `homepage_content`, `homepage_statistics`, and `partners`. It adds the homepage singleton check constraint, partner-slug unique index, and published/visibility/verification/order indexes. The migration contains no seed copy, statistics, partners, logo metadata, media, or credentials.

Production migrations must not run implicitly during ordinary API startup. Deployment automation, backups, rollback procedures, and migration ownership must be defined before production release.

## Local workflow

From `apps/backend`, set `Database__ConnectionString` in the current shell and run:

```powershell
dotnet tool restore
dotnet ef database update --project src/TheDomain.Infrastructure --startup-project src/TheDomain.Api
```

Use `dotnet ef migrations list` with the same project arguments to inspect migration state. Sprint 6A creates no migration because the approved schema is already represented by `AddIdentitySchema` and `AddEventsAndMediaMetadata`. Never use `database drop` or delete the Compose volume as part of ordinary startup.
