# Migration notes

EF Core migrations will live in `src/TheDomain.Infrastructure/Persistence/Migrations` and use `TheDomain.Api` as the startup project. The design-time factory requires an untracked `Database__ConnectionString` environment value.

`AddIdentitySchema` is the first migration. It creates `application_users`, `refresh_tokens`, their foreign key, the unique normalized-email and token-hash indexes, and the user/expiry lookup index. It contains no seed credentials or business tables.

`AddEventsAndMediaMetadata` creates `events`, `media_assets`, and `event_media` with schedule/publication/homepage indexes and association constraints. It stores no media binaries or seed content.

Production migrations must not run implicitly during ordinary API startup. Deployment automation, backups, rollback procedures, and migration ownership must be defined before production release.
